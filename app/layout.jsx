import { Sora, DM_Sans, DM_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "MedWallet — Global Medical Record Wallet",
    template: "%s | MedWallet",
  },
  description:
    "Own and manage your medical records in a secure, portable digital health wallet.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: { fontFamily: "var(--font-dm-sans)", borderRadius: "12px" },
          }}
        />
      </body>
    </html>
  );
}
