/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
    ],
  },
  // Add ESLint configuration
  eslint: {
    // This will completely disable ESLint during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;