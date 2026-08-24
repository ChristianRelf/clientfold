/** @type {import('next').NextConfig} */
const lowMemoryBuild = process.env.NEXT_LOW_MEMORY_BUILD === "1";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Server Actions are enabled by default in Next 15.
    serverActions: {
      bodySizeLimit: "5mb",
    },
    ...(lowMemoryBuild
      ? {
          // Production images may be compiled on small shared-CPU hosts.
          // Serial workers trade build speed for a substantially lower peak
          // memory footprint and avoid the kernel killing the build worker.
          cpus: 1,
          staticGenerationMaxConcurrency: 1,
          webpackBuildWorker: true,
          webpackMemoryOptimizations: true,
        }
      : {}),
  },
  async headers() {
    return [
      {
        // Private app + portal + internal routes must never be indexed.
        source: "/(app|portal|internal|settings)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
