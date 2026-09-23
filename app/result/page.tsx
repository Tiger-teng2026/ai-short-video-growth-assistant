import type { Metadata } from "next";
import { ResultView } from "@/components/ResultView";

export const metadata: Metadata = {
  title: "Production Blueprint",
  description:
    "A scene-by-scene short-video production workspace for your SaaS product.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultPage() {
  return <ResultView />;
}
