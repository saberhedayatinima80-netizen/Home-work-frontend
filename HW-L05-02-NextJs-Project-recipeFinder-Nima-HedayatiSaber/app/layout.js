import { Poppins } from "next/font/google";
import Navbar from "../components/Navbar";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "HW-L05-02-NextJs-Project-recipeFinder-Nima-HedayatiSaber",
  description: "Recipe Finder app with search, details, and favorites",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.variable}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
