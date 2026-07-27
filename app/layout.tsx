import type { Metadata } from 'next'
import Script from 'next/script'
import { Outfit } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/hooks/use-auth'
import { LanguageProvider } from '@/hooks/use-language'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dragonccm Project Manager | Phần mềm quản lý  & báo cáo công việc',
  description:
    'Dragonccm Project Manager – Phần mềm quản lý dự án giúp lập kế hoạch, theo dõi tiến độ, xuất báo cáo công việc nhanh chóng, hiệu quả và dễ dàng.',
  keywords: [
    'phần mềm quản lý dự án',
    'project management software', 
    'xuất báo cáo công việc',
    'Dragonccm',
  ],
  authors: [{ name: 'Dragonccm', url: 'https://project-manager-pearl-eight.vercel.app/' }],
  creator: 'Dragonccm',
  publisher: 'Dragonccm',
  alternates: {
    canonical: 'https://project-manager-pearl-eight.vercel.app/', // URL trang chính
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.png', // Path to favicon in public folder
  },
  openGraph: {
    title: 'Dragonccm Project Manager | Phần mềm quản lý dự án & báo cáo công việc',
    description:
      'Dragonccm Project Manager – Phần mềm quản lý dự án giúp lập kế hoạch, theo dõi tiến độ, xuất báo cáo công việc nhanh chóng, hiệu quả và dễ dàng.',
    url: 'https://project-manager-pearl-eight.vercel.app/',
    siteName: 'Dragonccm',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: 'https://project-manager-pearl-eight.vercel.app/logo.png', // Updated to use logo.png
        width: 1200,
        height: 630,
        alt: 'Dragonccm Project Manager',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dragonccm Project Manager | Quản lý dự án & báo cáo công việc',
    description:
      'Phần mềm quản lý dự án giúp lập kế hoạch, theo dõi tiến độ, xuất báo cáo công việc nhanh chóng, hiệu quả.',
    images: ['https://project-manager-pearl-eight.vercel.app/logo.png'], // Updated to use logo.png
    creator: '@dragonccm',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className={outfit.className}>
        {/* Google tag (gtag.js) — chỉ nạp ở production để không bắn event khi dev */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-TV89DPZCW8"
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-TV89DPZCW8');
              `}
            </Script>
          </>
        )}
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              storageKey="dragonccm-theme"
            >
              {children}
              <Analytics />
              <SpeedInsights />
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>   
    </html>
  )
}
