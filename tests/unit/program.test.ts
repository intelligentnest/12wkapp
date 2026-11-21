import { describe, expect, it } from "vitest";
import { addDays, diffDays, isIsoDate, todayIn } from "@/lib/dates";
import { chapterFor, chapters, dayNumber, months, programLength, weeks } from "@/lib/program";

const P = { start_date: "2026-11-22", end_date: "2027-02-13" };

describe("first cycle (approved dates)", () => {
  it("is exactly 84 days", () => expect(programLength(P)).toBe(84));

  it("numbers days 1..84 and rejects outside dates", () => {
    expect(dayNumber(P, "2026-11-22")).toBe(1);
    expect(dayNumber(P, "2027-02-13")).toBe(84);
    expect(dayNumber(P, "2026-11-21")).toBeNull();
    expect(dayNumber(P, "2027-02-14")).toBeNull();
  });

  it("has four 21-day chapters with the approved boundaries", () => {
    expect(chapters(P).map((c) => [c.name, c.start, c.end])).toEqual([
      ["Foundation", "2026-11-22", "2026-12-12"],
      ["Consistency", "2026-12-13", "2027-01-02"],
      ["Momentum", "2027-01-03", "2027-01-23"],
      ["Strengthen & sustain", "2027-01-24", "2027-02-13"],
    ]);
    expect(chapterFor(P, "2026-12-12")?.number).toBe(1);
    expect(chapterFor(P, "2026-12-13")?.number).toBe(2);
  });

  it("has 12 weeks, last ending on the final day", () => {
    const w = weeks(P);
    expect(w).toHaveLength(12);
    expect(w[0]).toEqual({ number: 1, start: "2026-11-22", end: "2026-11-28" });
    expect(w[11]).toEqual({ number: 12, start: "2027-02-07", end: "2027-02-13" });
  });

  it("spans November to February", () => {
    expect(months(P)).toEqual(["2026-11", "2026-12", "2027-01", "2027-02"]);
  });
});

describe("date helpers", () => {
  it("validates real calendar dates only", () => {
    expect(isIsoDate("2027-02-29")).toBe(false);
    expect(isIsoDate("2028-02-29")).toBe(true);
    expect(isIsoDate("2026-11-2")).toBe(false);
  });

  it("does arithmetic across month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(diffDays("2026-11-22", "2027-02-13")).toBe(83);
  });

  it("computes 'today' in Toronto, not UTC", () => {
    // 2026-11-22 03:30 UTC is still the evening of Nov 21 in Toronto (UTC-5)
    const instant = new Date("2026-11-22T03:30:00Z");
    expect(todayIn("America/Toronto", instant)).toBe("2026-11-21");
    expect(todayIn("UTC", instant)).toBe("2026-11-22");
  });

  it("is unaffected by the March 2027 DST change", () => {
    expect(addDays("2027-03-13", 1)).toBe("2027-03-14");
    expect(addDays("2027-03-14", 1)).toBe("2027-03-15");
  });
});

describe("generalises to future cycles", () => {
  it("handles a shorter custom cycle", () => {
    const q = { start_date: "2027-03-01", end_date: "2027-03-30" };
    expect(chapters(q).map((c) => c.end)).toEqual(["2027-03-21", "2027-03-30"]);
    expect(weeks(q)).toHaveLength(5);
  });
});
