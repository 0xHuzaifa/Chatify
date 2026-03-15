/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable the Next.js dev indicators (including the bottom-left Next.js icon)
  devIndicators: false,
};

export default nextConfig;
