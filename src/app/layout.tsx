import NavBar from "@/app/components/NavBar";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import { WardrobeProvider } from "@/app/context/WardrobeContext";
import { OutfitProvider } from "@/app/context/OutfitContext";
import { WeatherProvider } from "@/app/context/WeatherContext";

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
          <WeatherProvider>
            <WardrobeProvider>
              <OutfitProvider>
                <NavBar/>
                {children}
              </OutfitProvider>
            </WardrobeProvider>
          </WeatherProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
