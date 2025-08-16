import type { NextConfig } from "next";

// PWA support
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*$/,
      handler: "CacheFirst",
      options: { cacheName: "google-fonts", expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
    },
    {
      urlPattern: /\/_next\/image\?url=.*/,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "next-image", expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 } },
    },
    {
      urlPattern: /\/_next\/static\/.*/,
      handler: "CacheFirst",
      options: { cacheName: "next-static", expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } },
    },
    {
      urlPattern: /\/api\/chat/,
      handler: "NetworkOnly",
      options: { cacheName: "api-chat" },
    },
    {
      urlPattern: /.*/,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "misc", expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 } },
    },
  ],
});

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // allow future remote images if needed
    remotePatterns: [],
  },
  async headers() {
    const csp = [
      "default-src 'self'", // 기본 자기 자신
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com", // Next.js dev eval 허용 (prod 조정 가능)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
