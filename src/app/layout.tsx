import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "nexusml — Train the world's best ML models with one click",
  description: "Production-grade AutoML platform: upload a CSV, automatically profile, train 20+ models, optimize hyperparameters, ensemble, explain, and deploy — all in one click.",
  keywords: ["AutoML", "Machine Learning", "nexusml", "MLOps", "Model Training", "XAI", "SHAP"],
  authors: [{ name: "nexusml" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "nexusml",
    description: "Train the world's best machine learning models with one click.",
    siteName: "nexusml",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
