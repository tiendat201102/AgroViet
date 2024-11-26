"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginUserAPI } from "../../../../util/userAPI";
import { setCookie } from "cookies-next";
import { toast } from 'react-toastify';
import { showErrorToast, showSuccessToast } from "@/util/toast";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        // rememberMe: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === "checkbox" ? checked : value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await LoginUserAPI(formData.email, formData.password);
            console.log("API Response:", res);

            // const expirationDate = new Date();
            // expirationDate.setDate(expirationDate.getDate() + 1);
            if (res && res.success === true) {
                // console.log("User data to be stored:", res.user);
                setCookie('access_token', res.access_token, {
                    maxAge: 24 * 60 * 60,
                    path: '/',
                });

                setCookie('user_role', res.user.role, {
                    maxAge: 24 * 60 * 60,
                    path: '/',
                });

                setCookie('user_info', JSON.stringify(res.user), {
                    maxAge: 24 * 60 * 60,
                    path: '/',
                });

 
                window.dispatchEvent(new Event('loginSuccess'));
                router.push("/User");
                toast.success("Đăng nhập thành công")
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            // console.error("Login error:", error);
            toast.error("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.")
        }
    };

    return (
        <div className="flex-grow bg-gray-100 flex items-center justify-center p-4 py-20 h-full">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative">
                <div className="absolute top-2 right-2">
                    <div className="text-gray-500 cursor-pointer" />
                </div>
                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input type="email" name="email" placeholder="Email" className="w-full p-2 border border-gray-300 rounded" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <input
                                type="password"
                                name="password"
                                placeholder="Mật khẩu"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center">
                                <input type="checkbox" name="rememberMe" className="mr-2" checked={formData.rememberMe} onChange={handleChange} />
                                <span className="text-sm">Ghi nhớ</span>
                            </label>
                            <a href="/User/ForgotPassword" className="text-sm text-blue-500">
                                Quên mật khẩu?
                            </a>
                        </div>
                        <button type="submit" className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600">
                            Đăng nhập
                        </button>
                    </form>
                    <p className="mt-4 text-center text-sm">
                        Bạn chưa có tài khoản?{" "}
                        <a href="/Register" className="text-red-500">
                            Đăng ký ngay
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
