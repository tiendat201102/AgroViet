// import type { Metadata } from "next";
// import localFont from "next/font/local";
// import "./globals.css";
// import Header from "@/components/userComponents/header";
// import Footer from "@/components/userComponents/footer";

// const geistSans = localFont({
//   src: "../fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "../fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

// export const metadata: Metadata = {
//   title: "VietAgro",
//   description: "Generated by create next app",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {/* <Header/> */}
//         {children}
//         {/* <Footer/> */}
//       </body>
//     </html>
//   );
// }

// >>>>>>>>>> NEW <<<<<<<<<<

// app/layout.tsx
// import type { Metadata } from "next";
// import "./globals.css";
// // import '../../static/css/toast.css'
// // import { Bounce, ToastContainer,toast } from "react-toastify";
// // import 'react-toastify/dist/ReactToastify.css';

// import { Bounce, ToastContainer, toast } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';

// export const metadata: Metadata = {
//     title: "VietAgro",
//     // description: "Generated by create next app",
// };

// export default function RootLayout({
//     children
// }: {
//     children: React.ReactNode
// }) {
//     return (
//         <html lang="en">
//             <body>
//                 {children}
//                 <ToastContainer
//                     position="top-right"
//                     autoClose={5000}
//                     hideProgressBar={false}
//                     newestOnTop={false}
//                     closeOnClick
//                     rtl={false}
//                     pauseOnFocusLoss
//                     draggable
//                     pauseOnHover
//                     theme="colored"
//                 />
//             </body>
//         </html>
//     );
// }

// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ToastProvider from "@/components/ToastContainer";


const geistSans = localFont({
    src: "../fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});

const geistMono = localFont({
    src: "../fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "VietAgro",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {/* <ToastProvider>{children}</ToastProvider> */}
                {children}
                <ToastContainer 
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
            </body>
        </html>
    );
}
