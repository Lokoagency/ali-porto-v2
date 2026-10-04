import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (roughly a third smaller than WebP), WebP for browsers without it
    formats: ["image/avif", "image/webp"],
    // Only Ali's own Supabase bucket goes through the optimiser. Journal images (Notion, Markdown)
    // render as plain <img>, so no wildcard hosts here: a broad pattern like *.amazonaws.com would
    // let anyone use the site as a free image proxy.
    remotePatterns: [{ protocol: "https", hostname: "bwnfyhcmekdzumndknhp.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
