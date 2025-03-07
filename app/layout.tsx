// app/layout.tsx
"use client";
import "./globals.css"; // Asegúrate de que este archivo existe

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
