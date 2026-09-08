import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

// Arabic display font — applied to <body> when html[dir="rtl"] (see globals.css).
const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://reva-ai.ae"),
  title: "Reva AI — WhatsApp Receptionist Automation for UAE Clinics",
  description:
    "Reva AI helps UAE clinic reception teams handle WhatsApp enquiries, appointment booking, reminders, consent requests, and billing follow-ups with human handoff.",
  keywords: [
    "Reva AI",
    "clinic automation",
    "WhatsApp Business API",
    "clinic receptionist software",
    "patient appointment reminders",
    "no-show prevention",
    "Dubai healthcare",
    "UAE clinic software",
  ],
  authors: [{ name: "Reva AI" }],
  icons: {
    icon: [
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/reva-icon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Reva AI — WhatsApp Support for Your Reception Team",
    description:
      "Handle clinic WhatsApp enquiries, bookings, reminders, consent requests, and billing follow-ups with human handoff.",
    siteName: "Reva AI",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Reva AI — AI Patient Operations Layer for UAE Clinics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reva AI — WhatsApp Support for Your Reception Team",
    description:
      "Handle clinic WhatsApp enquiries, bookings, reminders, consent requests, and billing follow-ups with human handoff.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${tajawal.variable}`}>
      <head>
        {/* Apply the persisted language/direction before hydration (anti-FOUC). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem("reva-lang");var d=document.documentElement;if(l==="ar"){d.lang="ar";d.dir="rtl";}else{d.lang="en";d.dir="ltr";}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
