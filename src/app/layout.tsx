import type { Metadata } from "next";
import 'bootstrap/dist/css/bootstrap.css';
import "./globals.css";
import BootstrapClient from "@/components/BootstrapClient";
//import {  } from "next/font/google";

export const metadata: Metadata = {
  title: "Markov Chain Stock Predictor",
  description: "Developed by John DeVoe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <BootstrapClient />
      </body>
    </html>
  );
}
