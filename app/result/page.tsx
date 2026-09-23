import type { Metadata } from "next";
import { ResultView } from "@/components/ResultView";

export const metadata: Metadata = {
  title: "Production Blueprint",
  description: "Follow these steps from recording to publishing.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultPage() {
  return <ResultView />;
}
