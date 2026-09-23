import type { Metadata } from "next";
import { ResultView } from "@/components/ResultView";

export const metadata: Metadata = {
  title: "Production Blueprint",
  description:
    "Your video production blueprint: Recording Guide, Video Strategy, Voice Script, Editing Guide, and Publishing Package.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultPage() {
  return <ResultView />;
}
