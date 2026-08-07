import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // Cloudinary — property photos uploaded by users
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Unsplash — fallback placeholder images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Google user profile pictures (OAuth)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    // Enable AVIF for maximum compression; WebP as fallback
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
