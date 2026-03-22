/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/AhorcadoMultiplayer',
  assetPrefix: '/AhorcadoMultiplayer', 
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;