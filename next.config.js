/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Move this to the top level
  compiler: {
    // Keeps the styled-components SWC transform setting
    styledComponents: true,
  },
};

module.exports = nextConfig;
