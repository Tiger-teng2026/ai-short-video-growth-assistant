import Image from "next/image";
import { SITE_NAME } from "@/lib/site";

const lockup = { src: "/logo.jpg", width: 778, height: 455 };
const mark = { src: "/logo-mark.png", width: 324, height: 318 };

export function BrandLogo({
  variant = "lockup",
  height,
  className,
  decorative = false,
  priority = false,
}: {
  variant?: "lockup" | "mark";
  height: number;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
}) {
  const asset = variant === "mark" ? mark : lockup;
  const width = Math.round((height * asset.width) / asset.height);

  return (
    <Image
      src={asset.src}
      alt={decorative ? "" : SITE_NAME}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
