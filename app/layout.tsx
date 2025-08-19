// app/layout.tsx
export const metadata = {
  title: 'Kinjar',
  description: 'Multi-tenant family app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
