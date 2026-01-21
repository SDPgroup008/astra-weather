/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.paypal.com https://js.paypal.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.paypal.com; font-src 'self' https://fonts.gstatic.com https://*.paypalobjects.com https://*.paypal.com; img-src 'self' data: https:; connect-src 'self' https://checkout.paypal.com https://*.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com; frame-src https://checkout.paypal.com;",
          },
        ],
      },
    ]
  },
}

export default nextConfig
