const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Add any other configuration options you had in your next.config.ts
}

module.exports = nextConfig