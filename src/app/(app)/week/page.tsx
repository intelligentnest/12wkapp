import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Weekly progress" };

export default function Page() {
  return <ComingSoon title="Weekly progress" stage={5} />;
}
