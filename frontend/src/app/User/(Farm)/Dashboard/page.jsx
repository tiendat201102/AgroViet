"use client";
import { GetUserAPI } from "@/util/userAPI";
import { getCookie } from "cookies-next";
import React, { useEffect, useState } from "react";

const metrics = [
    {
        title: "Sản phẩm",
        value: "0",
        bgColor: "bg-[#E3F2FD]",
        textColor: "text-blue-600",
    },
    {
        title: "Tổng doanh thu",
        value: "0",
        bgColor: "bg-[#F3E5F5]",
        textColor: "text-purple-600",
    },
    {
        title: "Tổng Thu Nhập",
        value: "0 VND",
        bgColor: "bg-[#E8EAF6]", 
        textColor: "text-indigo-600",
    },
    {
        title: "Đơn hàng thành công",
        value: "0",
        bgColor: "bg-[#E3F2FD]", 
        textColor: "text-blue-600",
    },
];

const orderMetrics = [
    { label: "Tổng số đơn hàng", value: "10" },
    { label: "Đơn hàng chưa duyệt", value: "10" },
    { label: "Đơn hàng đã hủy", value: "10" },
    { label: "Đơn hàng thành công", value: "10" },
];

export default function DashboardPage() {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const userInfo = getCookie('user_info');
            console.log("userInfo >>> ", userInfo);
            
            if (userInfo) {
                const { email } = JSON.parse(userInfo);
                const response = await GetUserAPI(email);
                console.log("response >>> ", response);
                
                if (response.success) {
                    setUserData(response.data);
                }
            }
        };
        fetchUserData();
    }, []);

    return (
        <div className="p-6 space-y-6">
            {/* Header section */}
            <div className="flex items-center space-x-4 mb-8">
                <h1 className="text-xl font-semibold">Quản lý chung</h1>
            </div>

            {/* User Information */}
            {/* {userData && (
                <div className="flex items-center space-x-4 mb-8">
                    <img
                        src={userData.image}
                        alt={userData.name}
                        className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                        <h2 className="text-lg font-semibold">{userData.name}</h2>
                        <p className="text-gray-600">{userData.email}</p>
                        <p className="text-gray-600">{userData.phone}</p>
                        <p className="text-gray-600">{userData.address}</p>
                    </div>
                </div>
            )} */}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <div key={index} className={`${metric.bgColor} rounded-lg p-6 transition-transform hover:scale-105`}>
                        <div className={`text-2xl font-bold ${metric.textColor}`}>{metric.value}</div>
                        <div className="text-gray-600 text-sm mt-1">{metric.title}</div>
                    </div>
                ))}
            </div>

            {/* Orders Section */}
            <div className="bg-white rounded-lg p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4">Đơn hàng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {orderMetrics.map((order, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-gray-600">{order.label}</span>
                            <span className="font-semibold">{order.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Sản phẩm</h2>
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Thêm sản phẩm</button>
                </div>
                <div className="flex items-center justify-center py-8 text-gray-500">
                    {/* Add your EmptyState icon here */}
                    <div className="text-center">
                        <div className="text-6xl mb-4">😕</div>
                        <p>Không kết quả</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
