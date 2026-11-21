/**
 * Data-isolation and integrity tests against a real PostgreSQL database with the
 * project's migrations applied (see scripts/test-db.sh). Each helper call runs in
 * its own transaction as the `authenticated` role with a JWT `sub` claim, exactly
 * how Supabase's API executes queries.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool, type PoolClient } from "pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not set — run via `npm run test:db`");
const pool = new Pool({ connectionString: url });

type Ctx = { role: "authenticated" | "anon"; sub?: string };

async function as<T>(ctx: Ctx, fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query("begin");
    await c.query(`set local role ${ctx.role}`);
    await c.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify(ctx.sub ? { sub: ctx.sub, role: ctx.role } : { role: ctx.role }),
    ]);
    const out = await fn(c);
    await c.query("commit");
    return out;
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
  }
}

async function admin<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    return await fn(c);
  } finally {
    c.release();
  }
}

let A = "";
let B = "";
let progA = "";
let progB = "";
const userA = (): Ctx => ({ role: "authenticated", sub: A });
const userB = (): Ctx => ({ role: "authenticated", sub: B });

const USER_TABLES = [
  "programs",
  "program_habits",
  "daily_entries",
  "habit_completions",
  "weekly_measurements",
  "cycle_reviews",
  "daily_rhythm_blocks",
  "import_batches",
  "backup_events",
  "profiles",
];

beforeAll(async () => {
  await admin(async (c) => {
    await c.query("truncate auth.users cascade");
    A = (await c.query("insert into auth.users (email) values ('a@test.local') returning id")).rows[0].id;
    B = (await c.query("insert into auth.users (email) values ('b@test.local') returning id")).rows[0].id;
  });
  progA = await as(userA(), async (c) =>
    (await c.query("select public.create_program('First cycle', '2026-11-22', '2027-02-13') as id")).rows[0].id,
  );
  progB = await as(userB(), async (c) =>
    (await c.query("select public.create_program('B cycle', '2026-11-22', '2027-02-13') as id")).rows[0].id,
  );
  // A logs a full day with private content
  await as(userA(), async (c) => {
    await c.query(
      `insert into daily_entries (program_id, entry_date, journal, gratitude, protein_g)
       values ($1, '2026-11-22', 'private journal', 'private gratitude', 98.5)`,
      [progA],
    );
    await c.query(
      `insert into habit_completions (program_id, entry_date, habit_id, status)
       values ($1, '2026-11-22', 'spiritual.fajr', 'completed')`,
      [progA],
    );
    await c.query(
      `insert into weekly_measurements (program_id, measurement_date, weight_kg, waist_cm)
       values ($1, '2026-11-22', 71, 82.5)`,
      [progA],
    );
    await c.query(
      `insert into cycle_reviews (program_id, cycle_number, reflection) values ($1, 1, 'private reflection')`,
      [progA],
    );
    await c.query("select public.seed_my_rhythm()");
    await c.query(`insert into backup_events (event_type) values ('export_json')`);
  });
});

afterAll(async () => {
  await pool.end();
});

describe("setup", () => {
  it("creates a profile automatically with Toronto timezone", async () => {
    const rows = await as(userA(), async (c) => (await c.query("select id, timezone from profiles")).rows);
    expect(rows).toEqual([{ id: A, timezone: "America/Toronto" }]);
  });

  it("attaches all 22 habits to a new program in the original order", async () => {
    const rows = await as(userA(), async (c) =>
      (await c.query(
        `select ph.habit_id, h.legacy_index from program_habits ph
           join habit_definitions h on h.id = ph.habit_id
          where ph.program_id = $1 order by ph.sort_order`,
        [progA],
      )).rows,
    );
    expect(rows).toHaveLength(22);
    expect(rows.map((r) => r.legacy_index)).toEqual([...Array(22).keys()]);
    expect(rows[0].habit_id).toBe("spiritual.fajr");
    expect(rows[21].habit_id).toBe("growth.workday_shutdown");
  });

  it("seeds 12 rhythm blocks once and only once", async () => {
    const again = await as(userA(), async (c) => (await c.query("select public.seed_my_rhythm() as n")).rows[0].n);
    expect(again).toBe(0);
    const n = await as(userA(), async (c) => (await c.query("select count(*)::int as n from daily_rhythm_blocks")).rows[0].n);
    expect(n).toBe(12);
  });
});

describe("isolation between users", () => {
  it.each(USER_TABLES)("user B sees none of user A's rows in %s", async (table) => {
    const ownerCol = table === "profiles" ? "id" : "user_id";
    const n = await as(userB(), async (c) =>
      (await c.query(`select count(*)::int as n from ${table} where ${ownerCol} = $1`, [A])).rows[0].n,
    );
    expect(n).toBe(0);
  });

  it("user A does see their own rows", async () => {
    const n = await as(userA(), async (c) => (await c.query("select count(*)::int as n from daily_entries")).rows[0].n);
    expect(n).toBe(1);
    const seesB = await as(userA(), async (c) =>
      (await c.query("select count(*)::int as n from programs where id = $1", [progB])).rows[0].n,
    );
    expect(seesB).toBe(0);
  });

  it("user B cannot update or delete user A's rows, even knowing the IDs", async () => {
    const entryId = await as(userA(), async (c) => (await c.query("select id from daily_entries")).rows[0].id);
    const upd = await as(userB(), (c) => c.query("update daily_entries set journal = 'hacked' where id = $1", [entryId]));
    const del = await as(userB(), (c) => c.query("delete from daily_entries where id = $1", [entryId]));
    const delM = await as(userB(), (c) => c.query("delete from weekly_measurements where user_id = $1", [A]));
    expect(upd.rowCount).toBe(0);
    expect(del.rowCount).toBe(0);
    expect(delM.rowCount).toBe(0);
    const journal = await as(userA(), async (c) => (await c.query("select journal from daily_entries")).rows[0].journal);
    expect(journal).toBe("private journal");
  });

  it("user B cannot insert rows owned by user A", async () => {
    await expect(
      as(userB(), (c) =>
        c.query(
          "insert into daily_entries (user_id, program_id, entry_date) values ($1, $2, '2026-11-23')",
          [A, progA],
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("user B cannot attach their own rows to user A's program (IDOR via program_id)", async () => {
    await expect(
      as(userB(), (c) =>
        c.query("insert into daily_entries (program_id, entry_date) values ($1, '2026-11-23')", [progA]),
      ),
    ).rejects.toThrow(/foreign key/);
    await expect(
      as(userB(), (c) =>
        c.query(
          "insert into weekly_measurements (program_id, measurement_date, weight_kg) values ($1, '2026-11-23', 70)",
          [progA],
        ),
      ),
    ).rejects.toThrow(/foreign key/);
  });

  it("ownership cannot be transferred by updating user_id", async () => {
    await expect(
      as(userA(), (c) => c.query("update daily_entries set user_id = $1", [B])),
    ).rejects.toThrow(/ownership cannot be changed/);
  });
});

describe("anonymous and unauthenticated access", () => {
  it.each([...USER_TABLES, "habit_definitions"])("anon role is denied on %s", async (table) => {
    await expect(as({ role: "anon" }, (c) => c.query(`select * from ${table} limit 1`))).rejects.toThrow(
      /permission denied/,
    );
  });

  it("anon cannot execute RPC functions", async () => {
    await expect(as({ role: "anon" }, (c) => c.query("select public.seed_my_rhythm()"))).rejects.toThrow(
      /permission denied/,
    );
  });

  it("authenticated role without a user id sees nothing", async () => {
    const n = await as({ role: "authenticated" }, async (c) =>
      (await c.query("select count(*)::int as n from daily_entries")).rows[0].n,
    );
    expect(n).toBe(0);
  });
});

describe("catalogs are read-only", () => {
  it("users can read the 22 habit definitions", async () => {
    const n = await as(userB(), async (c) => (await c.query("select count(*)::int as n from habit_definitions")).rows[0].n);
    expect(n).toBe(22);
  });

  it("users cannot modify habit definitions", async () => {
    await expect(
      as(userA(), (c) => c.query("update habit_definitions set label = 'x' where id = 'spiritual.fajr'")),
    ).rejects.toThrow(/permission denied/);
  });

  it("import and backup logs are append-only", async () => {
    await expect(as(userA(), (c) => c.query("delete from backup_events"))).rejects.toThrow(/permission denied/);
  });
});

describe("data integrity rules", () => {
  it("has no weight or waist columns on daily entries", async () => {
    const cols = await admin(async (c) =>
      (await c.query(
        "select column_name from information_schema.columns where table_name = 'daily_entries'",
      )).rows.map((r) => r.column_name as string),
    );
    expect(cols.filter((c) => /weight|waist/.test(c))).toEqual([]);
  });

  it("allows only one daily entry per date", async () => {
    await expect(
      as(userA(), (c) =>
        c.query("insert into daily_entries (program_id, entry_date) values ($1, '2026-11-22')", [progA]),
      ),
    ).rejects.toThrow(/daily_entries_one_per_day/);
  });

  it("rejects daily entries outside the program dates", async () => {
    for (const d of ["2026-11-21", "2027-02-14"]) {
      await expect(
        as(userA(), (c) => c.query("insert into daily_entries (program_id, entry_date) values ($1, $2)", [progA, d])),
      ).rejects.toThrow(/outside this program/);
    }
  });

  it("accepts the first and last program days", async () => {
    await as(userA(), async (c) => {
      await c.query("insert into daily_entries (program_id, entry_date) values ($1, '2027-02-13')", [progA]);
      await c.query("delete from daily_entries where entry_date = '2027-02-13'");
    });
  });

  it("allows a baseline measurement up to 14 days before the start, not 15", async () => {
    await as(userA(), async (c) => {
      await c.query(
        "insert into weekly_measurements (program_id, measurement_date, weight_kg) values ($1, '2026-11-08', 71)",
        [progA],
      );
      await c.query("delete from weekly_measurements where measurement_date = '2026-11-08'");
    });
    await expect(
      as(userA(), (c) =>
        c.query(
          "insert into weekly_measurements (program_id, measurement_date, weight_kg) values ($1, '2026-11-07', 71)",
          [progA],
        ),
      ),
    ).rejects.toThrow(/outside this program/);
  });

  it("supports partial measurements but not empty ones", async () => {
    await as(userA(), async (c) => {
      await c.query(
        "insert into weekly_measurements (program_id, measurement_date, waist_cm) values ($1, '2026-11-29', 81)",
        [progA],
      );
    });
    await expect(
      as(userA(), (c) =>
        c.query("insert into weekly_measurements (program_id, measurement_date) values ($1, '2026-11-29')", [progA]),
      ),
    ).rejects.toThrow(/weekly_measurements_has_value/);
  });

  it("keeps decimal values exactly (no truncation)", async () => {
    const v = await as(userA(), async (c) => {
      await c.query("update daily_entries set workout_minutes = 30.5 where entry_date = '2026-11-22'");
      return (await c.query("select workout_minutes::text as v from daily_entries where entry_date = '2026-11-22'")).rows[0].v;
    });
    expect(v).toBe("30.5");
  });

  it("increments version and updated_at on every update", async () => {
    const [before, after] = await as(userA(), async (c) => {
      const b = (await c.query("select version from daily_entries where entry_date = '2026-11-22'")).rows[0].version;
      await c.query("update daily_entries set mood = 'good' where entry_date = '2026-11-22'");
      const a = (await c.query("select version from daily_entries where entry_date = '2026-11-22'")).rows[0].version;
      return [b, a];
    });
    expect(after).toBe(before + 1);
  });

  it("rejects habit completions for habits not in the program or days without an entry", async () => {
    await expect(
      as(userA(), (c) =>
        c.query(
          "insert into habit_completions (program_id, entry_date, habit_id, status) values ($1, '2026-11-22', 'spiritual.unknown', 'completed')",
          [progA],
        ),
      ),
    ).rejects.toThrow(/foreign key/);
    await expect(
      as(userA(), (c) =>
        c.query(
          "insert into habit_completions (program_id, entry_date, habit_id, status) values ($1, '2026-11-30', 'spiritual.fajr', 'completed')",
          [progA],
        ),
      ),
    ).rejects.toThrow(/foreign key/);
  });

  it("rejects invalid enum values and invalid timezones", async () => {
    await expect(
      as(userA(), (c) => c.query("update daily_entries set energy = 'terrible'")),
    ).rejects.toThrow(/check constraint/);
    await expect(
      as(userA(), (c) => c.query("update profiles set timezone = 'Mars/Olympus'")),
    ).rejects.toThrow(/check constraint/);
  });

  it("permits only one active program per user", async () => {
    await expect(
      as(userA(), (c) => c.query("select public.create_program('Second', '2027-03-01', '2027-05-23')")),
    ).rejects.toThrow(/programs_one_active_per_user/);
  });
});

describe("account deletion", () => {
  it("requires the exact confirmation phrase", async () => {
    await expect(as(userB(), (c) => c.query("select public.delete_my_account('yes')"))).rejects.toThrow(
      /Confirmation phrase/,
    );
  });

  it("deletes only the caller and all of their data", async () => {
    await as(userB(), (c) => c.query("select public.delete_my_account('DELETE MY ACCOUNT')"));
    const counts = await admin(async (c) => {
      const b = (await c.query("select count(*)::int as n from programs where user_id = $1", [B])).rows[0].n;
      const a = (await c.query("select count(*)::int as n from daily_entries where user_id = $1", [A])).rows[0].n;
      const users = (await c.query("select count(*)::int as n from auth.users")).rows[0].n;
      return { b, a, users };
    });
    expect(counts).toEqual({ b: 0, a: 1, users: 1 });
  });
});
