import "server-only";
import { requireUser } from "@/lib/auth";

export type Program = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  timezone: string;
  starting_weight_kg: number | null;
  goal_weight_kg: number | null;
  protein_guide_g: number | null;
  fibre_guide_g: number | null;
  writing_intention_min: number;
  status: string;
};

export type RhythmBlock = {
  id: string;
  sort_order: number;
  time_label: string;
  title: string;
  details: string | null;
  is_prayer_relative: boolean;
};

/** The first cycle exactly as approved on 2026-11-21. */
export const FIRST_CYCLE = {
  name: "First 84-day cycle",
  start: "2026-11-22",
  end: "2027-02-13",
  timezone: "America/Toronto",
  startingWeightKg: 71,
  goalWeightKg: 59,
  proteinGuideG: 105,
  fibreGuideG: 32,
} as const;

export async function getActiveProgram(): Promise<Program | null> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("programs")
    .select(
      "id, name, start_date, end_date, timezone, starting_weight_kg, goal_weight_kg, protein_guide_g, fibre_guide_g, writing_intention_min, status",
    )
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error("Could not load your program. Please try again.");
  if (!data) return null;
  const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  return {
    ...data,
    starting_weight_kg: num(data.starting_weight_kg),
    goal_weight_kg: num(data.goal_weight_kg),
    protein_guide_g: num(data.protein_guide_g),
    fibre_guide_g: num(data.fibre_guide_g),
    writing_intention_min: Number(data.writing_intention_min),
  } as Program;
}

export async function getRhythm(): Promise<RhythmBlock[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("daily_rhythm_blocks")
    .select("id, sort_order, time_label, title, details, is_prayer_relative")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error("Could not load your daily rhythm.");
  return data ?? [];
}

export async function getProfile() {
  const { supabase, userId, email } = await requireUser();
  const { data } = await supabase.from("profiles").select("display_name, timezone, last_export_at").eq("id", userId).single();
  return { email, ...(data ?? { display_name: null, timezone: "America/Toronto", last_export_at: null }) };
}
