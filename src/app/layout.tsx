import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joseph Landry — Senior Full-Stack Software Engineer",
  description:
    "Accomplished Senior Full-Stack and Backend Software Engineer with 10 years of experience designing, scaling, and migrating high-availability systems across financial services and enterprise entertainment domains.",
  keywords: [
    "Software Engineer",
    "Full-Stack Developer",
    "TypeScript",
    "React",
    "Node.js",
    "AWS",
    "Resume",
  ],
  authors: [{ name: "Joseph Landry" }],
  openGraph: {
    title: "Joseph Landry — Senior Full-Stack Software Engineer",
    description:
      "10 years of experience designing, scaling, and migrating high-availability systems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light' || (!theme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                    document.documentElement.classList.add('light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
