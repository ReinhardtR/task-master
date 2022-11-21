import "@/styles/globals.css";

import { type AppType } from "next/app";
import { type Session } from "next-auth";

import { trpc } from "@/utils/trpc";
import { SessionProvider } from "next-auth/react";
import { Header } from "@/components/Header";
import { Inter } from "@next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className={`${inter.variable} font-sans flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
      </div>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
