import './globals.scss'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'andvygrams',
  description: 'Play anagrams online with your friends!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
        <meta name="viewport" content="width=device-width, user-scalable=no"></meta>
      </head>
      <body className={`stripe`}>
        {children}
      </body>
    </html>
  )
}
