import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/lib/store";
import NavBar from "@/components/NavBar";
import CloudDot from "@/components/CloudDot";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Discipline OS",
  description:
    "Personal consistency operating system — habits, day-type schedules, gym tracker, shutdown ritual.",
  applicationName: "Discipline OS",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f1e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0f1e] text-slate-200">
        <AppStateProvider>
          <ServiceWorkerRegister />
          <div className="flex min-h-dvh flex-col">
            <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0a0f1e]/80 backdrop-blur">
              <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
                <NavBar />
                <CloudDot />
              </div>
            </header>
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-4">{children}</main>
            <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
              Discipline OS · built for one user · show up daily
            </footer>
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
