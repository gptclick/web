/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  resolve: {
    alias: {
      '@uniswap/conedison/dist':'@uniswap/conedison'
    }
  },
};

module.exports = nextConfig;