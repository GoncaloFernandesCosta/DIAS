/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@dias/lead-sources', '@dias/contracts'],
};

module.exports = nextConfig;