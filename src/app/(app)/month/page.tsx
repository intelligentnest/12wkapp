import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Monthly overview" };

export default function Page() {
  return <ComingSoon title="Monthly overview" stage={5} />;
}
