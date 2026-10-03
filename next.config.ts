import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/book-consultation",
        destination: "/collections",
        permanent: true,
      },
      {
        source: "/authenticity",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/collections/pooja-essentials",
        destination: "/collections/pooja-items",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/terms-and-conditions",
        permanent: true,
      },
      {
        source: "/refund-policy",
        destination: "/refunds-and-cancellations",
        permanent: true,
      },
      {
        source: "/cancellation-policy",
        destination: "/refunds-and-cancellations",
        permanent: true,
      },
      {
        source: "/returns",
        destination: "/refunds-and-cancellations",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
