"use client";

import Link from "next/link";
import React from "react";
import { FaSearch } from "react-icons/fa";
import { FaRegHeart, FaPhone } from "react-icons/fa6";
import { MdOutlineShoppingCart } from "react-icons/md";
import { TiThMenu } from "react-icons/ti";
import { IoIosArrowDown } from "react-icons/io";
import { LuBellRing } from "react-icons/lu";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCookie, deleteCookie } from "cookies-next";
import { GetUserAPI } from "@/util/userAPI";

export default function Header() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [profileImage, setProfileImage] = useState("/defaultUserImage.webp");
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [isNotificationVisible, setIsNotificationVisible] = useState(false);

    const checkUserLogin = async () => {
        const userInfoCookie = getCookie("user_info");

        if (userInfoCookie) {
            try {
                const userData = JSON.parse(userInfoCookie);

                const response = await GetUserAPI(userData.email);
                if (response && response.success) {
                    setUser(response.data);
                    setApplicationStatus(response.data.application_status);
                    //nếu có ảnh
                    if (response.data.image) {
                        setProfileImage(`data:image/jpeg;base64,${response.data.image}`);
                    } else {
                        setProfileImage("/defaultUserImage.webp");
                    }
                }
            } catch (error) {
                console.error("Error checking user login:", error);
                setUser(null);
                setProfileImage("/defaultUserImage.webp");
            }
        } else {
            setUser(null);
            setProfileImage("/defaultUserImage.webp");
        }
    };

    useEffect(() => {
        checkUserLogin();

        // Handle login success event
        const handleLoginSuccess = () => {
            checkUserLogin();
        };

        // Handle profile update event
        const handleProfileUpdate = (event) => {
            const updatedUser = event.detail;
            setUser(updatedUser);
            if (updatedUser.image) {
                setProfileImage(`data:image/jpeg;base64,${updatedUser.image}`);
            } else {
                setProfileImage("/defaultUserImage.webp");
            }
        };

        // Register event listeners
        window.addEventListener("loginSuccess", handleLoginSuccess);
        window.addEventListener("profileUpdate", handleProfileUpdate);

        // Cleanup
        return () => {
            window.removeEventListener("loginSuccess", handleLoginSuccess);
            window.removeEventListener("profileUpdate", handleProfileUpdate);
        };
    }, []);

    const handleLogout = () => {
        deleteCookie("access_token");
        deleteCookie("user_role");
        deleteCookie("user_info");
        setUser(null);
        setProfileImage("/defaultUserImage.webp");
        router.push("/User");
        router.refresh();
    };
    return (
        <div>
            <div>
                {/* Orange header */}
                <div className="bg-orange-500 text-white p-2 text-center text-xl font-bold">CHỢ NÔNG SẢN ONLINE</div>

                {/* Contact */}
                <div className="border-b border-gray-300 text-sm">
                    <div className="flex items-center space-x-4 justify-end mr-40 h-11">
                        <div className="border-r border-gray-300 pr-4 h-full"></div>
                        <FaPhone />
                        <span>Hotline 0582 186 596</span>
                        <div className="border-r border-gray-300 pr-4 h-full"></div>

                        {user ? (
                            <>
                                <div className="relative z-10">
                                    <div className="flex items-center space-x-3">
                                        {/* Notification Bell */}
                                        {applicationStatus && (
                                            <div
                                                onMouseEnter={() => setIsNotificationVisible(true)}
                                                onMouseLeave={() => setIsNotificationVisible(false)}
                                                className="relative flex items-center"
                                            >
                                                <LuBellRing
                                                    size={24}
                                                    className={`transition-colors duration-300 ${
                                                        applicationStatus === "approved"
                                                            ? "text-green-500"
                                                            : applicationStatus === "pending"
                                                            ? "text-yellow-500"
                                                            : "text-red-500"
                                                    } hover:text-orange-500 cursor-pointer`}
                                                />

                                                <div className="ml-3 h-11 border-l-2 border-gray-300"></div>
                                            </div>
                                        )}

                                        <button
                                            onMouseEnter={() => setIsProfileMenuOpen(true)}
                                            onMouseLeave={() => setIsProfileMenuOpen(false)}
                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                                        >
                                            <div className="flex flex-col items-end">
                                                <span className="font-semibold text-sm">{user.name}</span>
                                            </div>
                                            <Image
                                                src={profileImage}
                                                width={40}
                                                height={40}
                                                alt="Profile"
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        </button>
                                    </div>

                                    {isNotificationVisible && (
                                        <div className="absolute left-0 mt-0 w-48 bg-white text-black rounded-lg shadow-lg px-3 py-2 text-sm">
                                            {applicationStatus === "approved" ? (
                                                "Đơn đăng ký làm nhà vườn của bạn đã được duyệt"
                                            ) : applicationStatus === "pending" ? (
                                                "Đơn đang ký làm nhà vườn của bạn đang được duyệt"
                                            ) : (
                                                <>
                                                    <p>Đơn đang ký làm nhà vườn của bạn bị từ chối. Vui lòng đăng ký lại </p>
                                                    <p className="text-red-500 mt-1">Lý do: {user.rejection_reason}</p>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {isProfileMenuOpen && (
                                        <div
                                            onMouseEnter={() => setIsProfileMenuOpen(true)}
                                            onMouseLeave={() => setIsProfileMenuOpen(false)}
                                            className="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-xl py-2 border transition-all duration-300"
                                            // className="absolute left-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg px-3 py-2 text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300"

                                            // style={{
                                            //     opacity: 1,
                                            //     minHeight: "150px",
                                            //     zIndex: 100,
                                            //     backgroundColor: "rgba(255, 255, 255, 0.95)",
                                            // }}
                                        >
                                            <a href="/User/UserProfile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Trang cá nhân
                                            </a>
                                            <a href="/User/ProductFavourite" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Sản phẩm yêu thích
                                            </a>
                                            <a href="/User/Dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Trang bán hàng
                                            </a>
                                            <a href="/User/OrderHistory" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Lịch sử đơn hàng
                                            </a>
                                            <a href="/User/test" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                test
                                            </a>
                                            <hr className="my-1" />
                                            <a
                                                onClick={handleLogout}
                                                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                                            >
                                                Logout
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/User/Login" className="text-black hover:underline pl-4">
                                    Đăng nhập
                                </Link>
                                <div className="border-r border-gray-300 pr-4 h-full"></div>
                                <Link href="/User/Register" className="text-black hover:underline pl-4">
                                    Đăng ký
                                </Link>
                            </>
                        )}
                        <div className="border-r border-gray-300 pr-4 h-full"></div>
                    </div>
                </div>
            </div>

            {/* Main header */}
            <div className="bg-white sticky">
                <div className="container mx-auto flex flex-col md:flex-row items-center">
                    {/* Logo */}
                    <Link href="/User" className="flex items-center mb-4 md:mb-0 h-24">
                        {/* <Image src="/Logo.png" alt="CTU" className="mr-2 h-32 w-52" width={208} height={128} /> */}
                        <Image src="/Logo.png" alt="logo" className="mr-2 h-24 w-40" width={160} height={100} />
                    </Link>

                    {/* Thể loại dropdown */}
                    <div className="relative group w-1/12">
                        {/* <button className="flex items-center text-gray-700 hover:text-gray-900 h-full w-full absolute justify-end">
                            <TiThMenu className="w-5 h-5" />
                            <IoIosArrowDown className="w-5 h-5" />
                        </button>
                        <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                            <ul className="py-2">
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <span>🍎 Nông sản</span>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <span>🍗 Thực Phẩm</span>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <span>🧂 Gia vị</span>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <span>🍬 Bánh kẹo HCM</span>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <span>🐟 Thủy hải sản</span>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <span>🍵 Trà</span>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <span>👗 Thời Trang HCM</span>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <span>🌾 Nông Sản HCM</span>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <span>🍹 Đồ Uống HCM</span>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <span>🏠 Nhà Cửa & Đời Sống</span>
                                </li>
                            </ul>
                        </div> */}
                    </div>

                    {/* Search and Cart */}
                    <div className=" mx-4 mb-4 md:mb-0 w-[650px]">
                        <div className="flex">
                            <input
                                type="text"
                                placeholder="Tìm sản phẩm cần mua..."
                                className="py-2.5 px-4 border border-gray-300 rounded-l w-[650px]"
                            />
                            <button className="bg-red-500 text-white py-2.5 px-5 rounded-r hover:bg-[#2E3192]">
                                <FaSearch size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-8">
                        <Link href="/User/ProductFavourite" className="flex items-center justify-between w-40 hover:underline">
                            <FaRegHeart size={20} className="text-gray-600" />
                            <div className="text-sm opacity-60 flex flex-col ml-1">
                                <span className="text-red-600 font-semibold"></span>
                                <span>Danh sách yêu thích</span>
                            </div>
                        </Link>
                        <Link href="/User/Cart" className="flex items-center w-28 hover:underline">
                            <MdOutlineShoppingCart size={20} className="text-gray-600" />
                            <div className="text-sm opacity-60 flex flex-col ml-1">
                                <span className="text-red-600 font-semibold"></span>
                                <span>Giỏ hàng</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="p-2">
                <div className="border-t border-gray-200 h-full"></div>

                <div className="container mx-auto flex text-center justify-center">
                    <a href="/" className="opacity-60 hover:opacity-100 font-semibold py-2 px-4">
                        Trang Chủ
                    </a>
                    <a href="/User/Category" className="opacity-60 hover:opacity-100 font-semibold py-2 px-4">
                        Tất cả danh mục
                    </a>
                    <a href="/User/Salesman" className="opacity-60 hover:opacity-100 font-semibold py-2 px-4">
                        Tất cả người bán
                    </a>
                    <a href="/User/SaleProduct" className="opacity-60 hover:opacity-100 font-semibold py-2 px-4">
                        Sản phẩm
                    </a>
                    <a href="/User/RescueProduct" className="opacity-60 hover:opacity-100 font-semibold py-2 px-4">
                        Sản phẩm giải cứu
                    </a>
                    {/* <a href="#" className="opacity-60 hover:opacity-100 font-semibold py-2 px-4">
                        Tất cả người bán
                    </a> */}
                    <a href="/User/BlogPost" className="opacity-60 hover:opacity-100 font-semibold py-2 px-4">
                        Blog
                    </a>
                    {/* Chỉ hiển thị link đăng ký bán hàng khi chưa được approved */}
                    {(!user || (user && (applicationStatus === "unavailable" || applicationStatus === "rejected"))) && (
                        <a href="/User/SalesRegistration" className="opacity-60 hover:opacity-100 font-semibold py-2 px-4">
                            Đăng ký bán hàng
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
