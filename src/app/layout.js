import "./globals.css";

export const metadata = {
  title: "Hotseat",
  description:
    "Background music and sound effects for a hotseat interrogation session.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hotseat",
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
