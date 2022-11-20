import "./globals.css";
import { Header } from "../components/Header";
import { Inter } from "@next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <head />

      <body className="flex flex-col">
        {/* @ts-expect-error */}
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
