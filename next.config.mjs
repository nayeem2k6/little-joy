/** @type {import('next').NextConfig} */
const configuredApiProxyOrigin = process.env.API_PROXY_ORIGIN;

const apiProxyOrigin = (configuredApiProxyOrigin || "http://localhost:4000").replace(/\/$/, "");

const nextConfig = (phase) => {
  const isLintCommand = process.env.npm_lifecycle_event === "lint" || process.argv.includes("lint");
  if (phase === "phase-production-build" && !isLintCommand) {
    let productionProxyIsSafe = false;
    try {
      const origin = new URL(configuredApiProxyOrigin || "");
      productionProxyIsSafe = origin.protocol === "https:"
        && !["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)
        && !origin.hostname.endsWith(".localhost");
    } catch {
      productionProxyIsSafe = false;
    }
    if (!productionProxyIsSafe) {
      throw new Error("API_PROXY_ORIGIN must be a valid HTTPS backend origin, not a local address, for production builds");
    }
  }

  return {
    poweredByHeader: false,
    reactStrictMode: true,
    outputFileTracingRoot: process.cwd(),
    async rewrites() {
      return [{ source: "/api/:path*", destination: `${apiProxyOrigin}/api/:path*` }];
    }
  };
};

export default nextConfig;



