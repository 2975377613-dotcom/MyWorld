import type { Metadata } from "next";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { InteractiveBackground } from "@/components/ui/interactive-background";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyWorld",
  description: "A personal AI-native portal for navigation, search, and intelligent workflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <SettingsProvider>
          <div className="relative min-h-screen">
            <InteractiveBackground />
            <div className="relative z-10">{children}</div>
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
