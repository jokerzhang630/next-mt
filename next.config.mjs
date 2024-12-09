/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    TZ: "Asia/Shanghai",
  },
  experimental: {
    dns: {
      resolver: {
        nameservers: [
          "223.5.5.5", // 阿里 DNS
          "119.29.29.29", // 腾讯 DNS
          "114.114.114.114", // 114 DNS
        ],
      },
    },
  },
};

export default nextConfig;
