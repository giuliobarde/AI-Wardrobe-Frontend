import NavBar from "@/app/components/NavBar";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import { WardrobeProvider } from "@/app/context/WardrobeContext";

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
          <WardrobeProvider>
            <NavBar/>
            {children}
          </WardrobeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
