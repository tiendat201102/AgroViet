// import type { Metadata } from "next";
// import localFont from "next/font/local";
// import "../globals.css";

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

// export const metadata: Metadata = {
//   title: "VietAgro Admin",
//   description: "Admin Dashboard",
// };

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gray-100`}>

//     </div>
//   );
// }

// app/(admin)/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
// import { AdminHeader } from "@/components/adminComponents/AdminHeader";
// import { AdminSideBar } from "@/components/adminComponents/AdminSideBar";
import AdminHeader from "@/components/adminComponents/AdminHeader";
import AdminSideBar from "@/components/adminComponents/AdminSideBar";


import { toast } from 'react-toastify';
import { Bounce, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ToastProvider from "@/components/ToastContainer";

const geistSans = localFont({
    src: "../../fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});

const geistMono = localFont({
    src: "../../fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "VietAgro Admin",
    description: "Admin Dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gray-100 flex`}>
            <ToastProvider>
                <AdminSideBar />
                <div className="flex-1 flex flex-col min-h-screen">
                    <AdminHeader />
                    <main className="flex-1 p-2 overflow-hidden">{children}</main>
                    {/* footer */}
                </div>
            </ToastProvider>
        </div>
    );
}
