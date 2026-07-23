/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // The project ships without eslint configured; don't block builds on it.
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
