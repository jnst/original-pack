import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Original Pack - オリパガチャシステム",
  description: "トレーディングカードのオリジナルパック販売システム",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  )
}
