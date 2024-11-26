"use client"
import { adminLogin } from '@/util/adminAPI';
import { setCookie } from 'cookies-next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    const {name, value, type, checked} = e.target;
    setFormData((prevState) =>({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminLogin(formData.email, formData.password);
      // console.log("API adminLogin response >>> ", response);
      if(response && response.success === true) {
        setCookie('access_token', response.access_token, {
          maxAge: 24 * 60 * 60,
          path: '/',
      });

      setCookie('user_role', response.data.role, {
          maxAge: 24 * 60 * 60,
          path: '/',
      });

      setCookie('user_info', JSON.stringify(response.data), {
          maxAge: 24 * 60 * 60,
          path: '/',
      });
      
      toast.success(response.message);
      router.push("/Admin/ManageUser")
      } else {
        toast.error(response.message)
      }
      
    } catch (error) {
      console.log("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.");
      toast.error("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-contain bg-center antialiased " style={{ backgroundImage: 'url("/background-login1.jpg")' }} >
      <div className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6 h-36 opacity-1000">
          <Image src="/logo.png" alt="Website Logo" width={200} height={140} />
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-4">Sign in to your account</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300">Your email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 mt-1 bg-gray-700 text-white rounded"
              placeholder="name@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 mt-1 bg-gray-700 text-white rounded"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="text-blue-500 rounded" />
              <label htmlFor="remember" className="ml-2 text-gray-300">Remember me</label>
            </div>
            {/* <a href="#" className="text-blue-400 hover:underline">Forgot password?</a> */}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded"
          >
            Log in to your account
          </button>
        </form>
        {/* <p className="mt-4 text-center text-gray-400">
          Don't have an account? <a href="#" className="text-blue-400 hover:underline">Sign up</a>
        </p> */}
      </div>
      {/* <ToastContainer/> */}
    </div>
  );
}
