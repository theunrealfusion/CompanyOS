import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow access from local network IPs
  allowedDevOrigins: ['192.168.1.222', 'localhost', '127.0.0.1'],
};

export default nextConfig;
