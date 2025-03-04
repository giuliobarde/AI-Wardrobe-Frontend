import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext"; // adjust the path as needed

export const metadata = {
  title: "AI Wardrobe",
  description: "Your AI-powered wardrobe assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
