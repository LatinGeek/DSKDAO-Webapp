/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "http": false,
      "https": false,
      "ws": false,
      "zlib": false,
      "crypto": false,
      "stream": false,
      "undici": false,
      "buffer": false,
      "url": false,
      "net": false,
      "tls": false,
    };
    
    // Ignore undici package
    config.resolve.alias = {
      ...config.resolve.alias,
      'undici': false,
    };
    
    return config;
  },
  transpilePackages: ['@firebase/auth'],
  reactStrictMode: false, // Disable StrictMode to prevent double initialization
  images: {
    domains: ['ipfs.io'], // Allow loading images from IPFS gateway
  },
};

module.exports = nextConfig; 