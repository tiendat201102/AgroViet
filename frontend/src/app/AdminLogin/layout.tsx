// import React from "react";
import type { Metadata } from "next";
import "../globals.css";
import localFont from "next/font/local";

import { toast } from "react-toastify";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ToastProvider from "@/components/ToastContainer";

// const geistSans = localFont({
//   src: "../../fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });

// const geistMono = localFont({
//   src: "../../fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata: Metadata = {
    title: "Admin Login - VietAgro",
    description: "Login page for VietAgro Admin",
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
    return (
        // <html lang="en">
        //   <body>{children}</body>
        // </html> className={`${geistSans.variable} ${geistMono.variable}`}

        <div >

            <ToastProvider>
                <main>{children}</main>
            </ToastProvider>
        </div>
        
    );
}
