import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const logoData = await readFile(
  join(process.cwd(), "public/logo.jpg"),
  "base64",
);
const logoSrc = `data:image/jpeg;base64,${logoData}`;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
        <img src={logoSrc} width={520} height={304} />
        <div
          style={{
            display: "flex",
            marginTop: 28,
            color: "#475569",
            fontSize: 26,
            letterSpacing: 0.2,
          }}
        >
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    size,
  );
}
