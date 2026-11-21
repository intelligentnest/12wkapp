"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { FIRST_CYCLE } from "@/lib/data/program";

export type SetupState = { error?: string };

/** Creates the approved first cycle and the editable daily rhythm. Safe to retry. */
export async function setupFirstCycle(): Promise<SetupState> {
  const { supabase } = await requireUser();

  const { data: existing } = await supabase.from("programs").select("id").eq("status", "active").maybeSingle();
  if (!existing) {
    const { error } = await supabase.rpc("create_program", {
      p_name: FIRST_CYCLE.name,
      p_start_date: FIRST_CYCLE.start,
      p_end_date: FIRST_CYCLE.end,
      p_timezone: FIRST_CYCLE.timezone,
      p_starting_weight_kg: FIRST_CYCLE.startingWeightKg,
      p_goal_weight_kg: FIRST_CYCLE.goalWeightKg,
      p_protein_guide_g: FIRST_CYCLE.proteinGuideG,
      p_fibre_guide_g: FIRST_CYCLE.fibreGuideG,
    });
    if (error) return { error: "Setup didn't complete. Nothing was lost — please try again." };
  }
  const { error: rhythmError } = await supabase.rpc("seed_my_rhythm");
  if (rhythmError) return { error: "Your cycle was created, but the daily rhythm didn't load. Please try again." };

  revalidatePath("/today");
  return {};
}
