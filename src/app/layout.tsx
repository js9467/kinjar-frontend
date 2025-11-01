import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kinjar",
  description: "Family admin portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
