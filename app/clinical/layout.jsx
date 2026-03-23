import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: {
    default: "Clinical Portal | MedWallet",
    template: "%s | MedWallet Clinical",
  },
  description: "Secure medical record access for healthcare professionals.",
};

export default function ClinicalLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {children}
    </div>
  );
}
