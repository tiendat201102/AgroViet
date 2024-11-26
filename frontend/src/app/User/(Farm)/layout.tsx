import FarmSideBar from "@/components/userComponents/farmSideBar";
import React from "react";
import  ToastContainer  from "@/components/ToastContainer";
import toast from "react-icons"

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-100 py-12 px-4">
            <ToastContainer>
                <FarmSideBar />
                <main className="flex-1 px-8">{children}</main>
            </ToastContainer>
        </div>
    );
}
