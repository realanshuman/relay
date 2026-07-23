import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Relay — AI Release Manager",
    template: "%s · Relay",
  },
  description:
    "Relay is the AI Release Manager that turns every merged pull request into a polished product release.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
