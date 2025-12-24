/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    turbo: false,  // ← THIS IS THE CORRECT KEY TO DISABLE TURBOPACK
  },
};

export default nextConfig;