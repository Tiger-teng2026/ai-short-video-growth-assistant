import type { Metadata } from "next";
import { ResultView } from "@/components/ResultView";

export const metadata: Metadata = {
  title: "Founder Content Package",
  description: "Your founder content package: platform, content type, script, and recording plan.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultPage() {
  return <ResultView />;
}
