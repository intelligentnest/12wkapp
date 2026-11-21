import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Weekly measurements" };

export default function Page() {
  return <ComingSoon title="Weekly measurements" stage={4} />;
}
