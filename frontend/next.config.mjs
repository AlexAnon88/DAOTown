/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suppress deprecation warnings from dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Suppress zustand warnings from wagmi/rainbowkit
      config.ignoreWarnings = [
        /getStorage.*deprecated/,
        /serialize.*deprecated/,
        /deserialize.*deprecated/,
        /Default export is deprecated/,
      ];
    }
    return config;
  },
};

export default nextConfig;
