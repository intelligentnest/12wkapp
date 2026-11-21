import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "History" };

export default function Page() {
  return <ComingSoon title="History" stage={5} />;
}
