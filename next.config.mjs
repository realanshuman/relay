/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // The project ships without eslint configured; don't block builds on it.
    ignoreDuringBuilds: true,
  },
  // Don't 308-redirect trailing-slash requests — external API clients (e.g. the
  // Better Auth dashboard hitting /api/auth/...) must reach the handler directly.
  skipTrailingSlashRedirect: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  async redirects() {
    // The dashboard moved from / to /app when the marketing site took over /.
    return [
      { source: "/releases", destination: "/app/releases", permanent: false },
      { source: "/releases/:id", destination: "/app/releases/:id", permanent: false },
      { source: "/repositories", destination: "/app/repositories", permanent: false },
      { source: "/settings", destination: "/app/settings", permanent: false },
      { source: "/changelog", destination: "/app/changelog", permanent: false },
    ];
  },
};

export default nextConfig;
