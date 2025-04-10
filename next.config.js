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
  experimental: {
    serverActions: true
  }
};

module.exports = nextConfig; 