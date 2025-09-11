import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: 'Dragonccm Project Manager | Phần mềm quản lý dự án & báo cáo công việc',
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
