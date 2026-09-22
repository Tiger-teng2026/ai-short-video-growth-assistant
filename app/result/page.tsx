import type { Metadata } from "next";
import { ResultView } from "@/components/ResultView";

export const metadata: Metadata = {
  title: "Short Video Production Plan",
  description: "A ready-to-record content workflow for your SaaS product.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultPage() {
  return <ResultView />;
}
