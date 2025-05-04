/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_API_URL: "https://tripplaner.onrender.com/api"
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
}

module.exports = nextConfig 