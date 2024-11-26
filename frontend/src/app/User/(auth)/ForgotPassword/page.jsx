"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { updatePassword } from "@/util/userAPI";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        newPassword: "",
        confirmPassword: "",
    });

    const validateForm = () => {
        const newErrors = {
            email: !formData.email ? "Email không được để trống" : "",
            newPassword: !formData.newPassword ? "Mật khẩu không được để trống" : "",
            confirmPassword: formData.newPassword !== formData.confirmPassword 
                ? "Mật khẩu xác nhận không khớp" 
                : ""
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== "");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear errors when user starts typing
        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const response = await updatePassword(formData.email, formData.newPassword);

            
            
            if (response.success) {
                toast.success("Đổi mật khẩu thành công");
                router.push("/User/Login");
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="flex-grow bg-gray-100 flex items-center justify-center p-4 py-20 h-full">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="Nhập email đã đăng ký" 
                                className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div className="mb-4">
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="Nhập mật khẩu mới"
                                className={`w-full p-2 border rounded ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                        </div>

                        <div className="mb-6">
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Xác nhận mật khẩu mới"
                                className={`w-full p-2 border rounded ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200"
                        >
                            Đổi mật khẩu
                        </button>
                    </form>

                    <p className="mt-4 text-center text-sm">
                        <a href="/login" className="text-red-500 hover:text-red-600">
                            Quay lại đăng nhập
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}