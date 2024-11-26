"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
// import { RegisterUserAPI } from "../../../util/userAPI";
import { RegisterUserAPI } from "../../../../util/userAPI";
import { showErrorToast, showSuccessToast } from "../../../../util/toast";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        phonenumber: "",
        gender: "MALE",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
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

        if (formData.password !== formData.confirmPassword) {
            showErrorToast("Mật khẩu xác nhận không khớp!");
            // alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            // const result = await RegisterUserAPI(formData.name,formData.email, formData.password, formData.gender, formData.phonenumber);
                 const result = await RegisterUserAPI(
                    formData.name, 
                    formData.email, 
                    formData.password, 
                    formData.gender,
                    formData.phonenumber
                );
            // console.log("API Response:", result);

            if (result && result.success === true) {
                showSuccessToast(result.message);
                // alert(result.message);
                router.push("/User/Login");
            } else {
                showErrorToast(result?.message || "Có lỗi xảy ra khi đăng ký");
                // alert(result?.message || "Có lỗi xảy ra khi đăng ký");
            }
        } catch (error) {
            console.error("Registration error:", error);
            showErrorToast(error?.message || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
            // alert(error?.message || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="flex justify-center items-center py-10 bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h2 className="text-2xl font-bold text-center mb-6">Tạo tài khoản</h2>

                <div className="mb-4">
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                        Họ và tên
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Họ và tên"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="phonenumber" className="block mb-2 text-sm font-medium text-gray-700">
                        Số điện thoại
                    </label>
                    <input
                        id="phonenumber"
                        name="phonenumber"
                        type="tel"
                        placeholder="Số điện thoại"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={formData.phonenumber}
                         pattern="0[3-9][0-9]{8}"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="gender" className="block mb-2 text-sm font-medium text-gray-700">
                        Giới tính
                    </label>
                    <select
                        id="gender"
                        name="gender"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                    >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                        Mật khẩu
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Mật khẩu"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                        Xác nhận mật khẩu
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Xác nhận mật khẩu"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex items-center mb-4">
                    <input
                        id="agreeToTerms"
                        type="checkbox"
                        name="agreeToTerms"
                        className="mr-2"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        required
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                        Bạn đồng ý với các điều khoản và điều kiện của chúng tôi.
                    </label>
                </div>

                <button type="submit" className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300">
                    Tạo tài khoản
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Bạn đã có tài khoản?{" "}
                    <a href="/login" className="text-red-500 hover:underline">
                        Đăng nhập ngay
                    </a>
                </p>
            </form>
        </div>
    );
}
