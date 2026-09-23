import type { Metadata } from "next";
import { ResultView } from "@/components/ResultView";

export const metadata: Metadata = {
  title: "Production Blueprint",
  description:
    "Record your clips, put them together, and publish your short video.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultPage() {
  return <ResultView />;
}
