/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["roomate-finder.s3.eu-north-1.amazonaws.com"], // Add your S3 bucket domain here
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = "inline-source-map";
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
