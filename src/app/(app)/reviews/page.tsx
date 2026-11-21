import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "21-day reviews" };

export default function Page() {
  return <ComingSoon title="21-day reviews" stage={5} />;
}
