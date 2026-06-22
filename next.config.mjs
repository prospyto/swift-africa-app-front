/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      // Anciens utilisateurs qui allaient sur / → maintenant redirigés vers /app
      // Non — on ne redirige pas, / c'est la landing maintenant
    ]
  },
}

export default nextConfig
