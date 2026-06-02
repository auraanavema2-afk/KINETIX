import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 restricts allowed image qualities to [75] by default.
    // ImageBackground renders full-screen backgrounds at quality 85.
    qualities: [75, 85],
  },
};

export default nextConfig;
