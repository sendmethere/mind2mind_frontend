import { Inter } from "next/font/google";
import "./globals.css";
import Head from 'next/head';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mind 2 Mind",
  description: "우리의 생각은 이어질 수 있을까?",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji"
      rel="stylesheet"
    />
      </Head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
