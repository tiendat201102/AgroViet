"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GetUserAPI } from "@/util/userAPI";
import { getCookie } from "cookies-next";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaHome } from "react-icons/fa";
import { FaShoppingBasket } from "react-icons/fa";

const FarmSideBar = () => {
    const pathname = usePathname();
    const totalAmount = "0 VND";
    const previousAmount = "0 VND";
    const [userData, setUserData] = useState(null);
    const [avatar, setAvatar] = useState("/defaultUserImage.webp")

    useEffect(() => {
        const fetchUserData = async () => {
            const userInfo = getCookie("user_info");
            console.log("userInfo >>> ", userInfo);

            if (userInfo) {
                const { email } = JSON.parse(userInfo);
                const response = await GetUserAPI(email);
                if (response.data.image) {
                  setAvatar(`data:image/jpeg;base64,${response.data.image}`);
              } else {
                  setAvatar("/defaultUserImage.webp");
              }
                console.log("avatar >>> ", avatar);

                if (response.success) {
                    setUserData(response.data);
                }
            }
        };
        fetchUserData();
    }, []);

    const menuItems = [
        { path: "/User/Dashboard", label: "Quản lý chung", icon: <FaHome size={20} /> }, // Add icon: <Home size={20} />
        { path: "/User/AddProduct", label: "Thêm sản phẩm" }, // Add icon: <Truck size={20} />
        { path: "/User/ManageProduct", label: "Quản lý sản phẩm" }, // Add icon: <History size={20} />
        { path: "/User/ManageShippingFee", label: "Quản lý phí giao hàng" }, // Add icon: <Heart size={20} />
        { path: "/User/ManageOrder", label: "Quản lý đơn hàng" }, // Add icon: <MessageSquare size={20} />
        { path: "/User/AddPromotion", label: "Thêm khuyến mại" }, // Add icon: <Settings size={20} />
        { path: "/User/ManagePromotion", label: "Quản lý khuyến mại" }, // Add icon: <HelpCircle size={20} />
        { path: "/User/AddBlogPost", label: "Thêm bài viết" }, // Add icon: <HelpCircle size={20} />
        { path: "/User/ManageBlogPost", label: "Quản lý bài viết" }, // Add icon: <User size={20} />
        { path: "/User/Product", label: "Quản lý sản phẩm (old version)",icon: <FaShoppingBasket size={20}/>  }, // Add icon: <ShoppingCart size={20} />
    ];

    return (
        <div className="w-64 min-h-screen bg-white shadow-lg ml-14">
            {/* User Profile Section */}
            <div className="bg-red-500 p-4 text-white">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200">
                        {userData && userData.image ? (
                            <Image src={avatar} alt={userData.name} className="w-full h-full rounded-full" width={40} height={40} />
                        ) : (
                            <Image src="/defaultUserImage.webp" className="w-12 h-12 bg-gray-300 rounded-full" width={40} height={40}/>
                        )}
                    </div>
                    <div>
                        {userData && (
                            <>
                                <div className="font-bold">{userData.name}</div>
                                <div className="text-sm">{userData.email}</div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="mt-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 ${
                            pathname === item.path ? "bg-gray-100" : ""
                        }`}
                    >
                        {/* Add icon here */}
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default FarmSideBar;
