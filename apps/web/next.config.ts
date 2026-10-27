import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
  experimental: {
    // Next 16.3 usa el verificador CLI por defecto; con TypeScript 5.9 puede
    // perder la salida de `--showConfig` en procesos secundarios.
    useTypeScriptCli: false,
  },
  images: {
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/images/yum/**", search: "?v=20261025-alpha" },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
