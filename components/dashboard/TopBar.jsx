"use client";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const pageTitles = {
  "/dashboard": { title: "Dashboard", description: "Your health overview" },
  "/records": {
    title: "Health Records",
    description: "Manage your medical information",
  },
  "/documents": {
    title: "Documents",
    description: "Your medical document vault",
  },
  "/emergency-qr": {
    title: "Emergency QR",
    description: "Your emergency access code",
  },
  "/doctor-access": {
    title: "Doctor Access",
    description: "Manage temporary access tokens",
  },
  "/profile": {
    title: "My Profile",
    description: "Personal and emergency contact info",
  },
  "/settings": {
    title: "Settings",
    description: "Account and security settings",
  },
};

export default function TopBar() {
  const pathname = usePathname();
  const page = pageTitles[pathname] || { title: "MedWallet", description: "" };
  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800/50 px-6 py-4 flex items-center justify-between transition-colors">
      <div className="pl-10 lg:pl-0">
        <h1 className="font-display font-semibold text-lg text-gray-900 dark:text-zinc-100">
          {page.title}
        </h1>
        {page.description && (
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 hidden sm:block">
            {page.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
