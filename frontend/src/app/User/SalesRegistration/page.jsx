"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"
import {SalesRegistrationAPI} from "../../../util/userAPI"
import {showSuccessToast, showErrorToast} from "../../../util/toast"
import { toast } from "react-toastify";
import { useEffect } from "react";
import { getCookie } from 'cookies-next';
import { getAllCity, getAllRegion } from "@/util/adminAPI";



export default function SalesRegistrationPage() {
    const router = useRouter();
    const [userID, setUserID] = useState("");
    const [logoPreview, setLogoPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedCity, setSelectedCity] = useState("");


    const [formData, setFormData] = useState({
        farm_name: "",
        farm_logo: null,
        farm_phone: "",
        farm_region_address: "",
        farm_city_address: "",
        farm_detail: "",
        farm_banner: null,
        agreeToTerms: false,
    });

    useEffect(() => {
        fetchData();
        const userInfo = getCookie('user_info');
        if (userInfo) {
            try {
                const userData = JSON.parse(userInfo);
                if (userData.user_id) {
                    setUserID(userData.user_id);
                } else {
                    showErrorToast("Không tìm thấy thông tin email");
                    router.push("/User/Login");
                }
            } catch (error) {
                console.error("Error parsing user info:", error);
                showErrorToast("Có lỗi xảy ra khi lấy thông tin người dùng");
                router.push("/User/Login");
            }
        } else {
            showErrorToast("Vui lòng đăng nhập để đăng ký bán hàng");
            router.push("/User/Login");
        }
    }, [router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [regionsResponse, citiesResponse] = await Promise.all([getAllRegion(), getAllCity()]);

            if (regionsResponse.success && citiesResponse.success) {
                setRegions(regionsResponse.data);
                setCities(citiesResponse.data);
            } else {
                console.error("Failed to fetch data");
                toast.error("Có lỗi xảy ra khi tải dữ liệu khu vực và thành phố");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    // const handleRegionChange = (e) => {
    //     const regionId = e.target.value;
    //     setSelectedRegion(regionId);
    //     setFormData(prev => ({
    //         ...prev,
    //         farm_region_address: regions.find(r => r._id === regionId)?.name || ""
    //     }));
    //     // Reset city when region changes
    //     setSelectedCity("");
    //     setFormData(prev => ({
    //         ...prev,
    //         farm_city_address: ""
    //     }));
    // };

    const handleRegionChange = (e) => {
        const regionId = e.target.value;
        setSelectedRegion(regionId);
        setFormData(prev => ({
            ...prev,
            farm_region_address: regionId  // Gửi ID thay vì tên
        }));
        setSelectedCity("");
        setFormData(prev => ({
            ...prev,
            farm_city_address: ""
        }));
    };

    // const handleCityChange = (e) => {
    //     const cityId = e.target.value;
    //     setSelectedCity(cityId);
    //     setFormData(prev => ({
    //         ...prev,
    //         farm_city_address: cities.find(c => c._id === cityId)?.name || ""
    //     }));
    // };

    const handleCityChange = (e) => {
        const cityId = e.target.value;
        setSelectedCity(cityId);
        setFormData(prev => ({
            ...prev,
            farm_city_address: cityId  // Gửi ID thay vì tên
        }));
    };

    const handleImageChange = (e) => {
        const { name } = e.target;
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(",")[1];
                // Cập nhật preview
                if (name === "farm_logo") {
                    setLogoPreview(reader.result);
                } else if (name === "farm_banner") {
                    setBannerPreview(reader.result);
                }
                // Cập nhật formData với base64String
                setFormData(prev => ({
                    ...prev,
                    [name]: base64String
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Filter cities based on selected region
    const filteredCities = cities.filter(city => city.region_id === selectedRegion)

    // const handleChange = (e) => {
    //     const { name, value, type, checked, files } = e.target;
        
    //     if (type === "file") {
    //         const file = files[0];
    //         if (file) {
    //             const reader = new FileReader();
    //             reader.onloadend = () => {
    //                 if (name === "farm_logo") {
    //                     setLogoPreview(reader.result);
    //                 } else if (name === "farm_banner") {
    //                     setBannerPreview(reader.result);
    //                 }
    //             };
    //             reader.readAsDataURL(file);
                
    //             setFormData(prev => ({
    //                 ...prev,
    //                 [name]: file
    //             }));
    //         }
    //     } else {
    //         setFormData(prev => ({
    //             ...prev,
    //             [name]: type === "checkbox" ? checked : value
    //         }));
    //     }
    // };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === "file") {
            handleImageChange(e);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value
            }));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // const email = 
            const res = await SalesRegistrationAPI(
                userID,
                formData.farm_name,
                formData.farm_logo,
                formData.farm_phone,
                formData.farm_region_address,
                formData.farm_city_address, 
                formData.farm_detail,
                formData.farm_banner);
            console.log("API Response:", res);

            if (res && res.success === true) {
                showSuccessToast(res.message)
                router.push("/User/Login")
            } else {
                toast.error(res?.message || "Có lỗi xảy ra khi đăng ký");
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error?.message || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.")
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center mb-6">Đăng ký bán hàng</h2>

                    <div className="space-y-6">
                        {/* Farm Basic Information */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="farm_name" className="block text-sm font-medium text-gray-700">
                                    Tên cửa hàng
                                </label>
                                <input
                                    id="farm_name"
                                    name="farm_name"
                                    type="text"
                                    placeholder="Nhập tên cửa hàng"
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                                    value={formData.farm_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="farm_phone" className="block text-sm font-medium text-gray-700">
                                    Số điện thoại cửa hàng
                                </label>
                                <input
                                    id="farm_phone"
                                    name="farm_phone"
                                    type="tel"
                                    placeholder="Nhập số điện thoại"
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                                    value={formData.farm_phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Farm Address */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Địa chỉ
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <select
                                        value={selectedRegion}
                                        onChange={handleRegionChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                    >
                                        <option value="">Chọn khu vực</option>
                                        {regions.map((region) => (
                                            <option key={region.region_id} value={region.region_id}>
                                                {region.region_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <select
                                        value={selectedCity}
                                        onChange={handleCityChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                        disabled={!selectedRegion}
                                    >
                                        <option value="">Chọn thành phố</option>
                                        {filteredCities.map((city) => (
                                            <option key={city.city_id} value={city.city_id}>
                                                {city.city_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Farm Details */}
                        <div>
                            <label htmlFor="farm_detail" className="block text-sm font-medium text-gray-700">
                                Mô tả cửa hàng
                            </label>
                            <textarea
                                id="farm_detail"
                                name="farm_detail"
                                rows="4"
                                placeholder="Nhập mô tả về cửa hàng của bạn"
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                                value={formData.farm_detail}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Image Uploads */}
                        <div className="space-y-4">
                            {/* Logo Upload */}
                            <div>
                                <label htmlFor="farm_logo" className="block text-sm font-medium text-gray-700">
                                    Logo cửa hàng
                                </label>
                                <input
                                    id="farm_logo"
                                    name="farm_logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="mt-1 w-full"
                                />
                                {logoPreview && (
                                    <div className="mt-2">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="h-32 w-32 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Banner Upload */}
                            <div>
                                <label htmlFor="farm_banner" className="block text-sm font-medium text-gray-700">
                                    Ảnh bìa cửa hàng
                                </label>
                                <input
                                    id="farm_banner"
                                    name="farm_banner"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="mt-1 w-full"
                                />
                                {bannerPreview && (
                                    <div className="mt-2">
                                        <img
                                            src={bannerPreview}
                                            alt="Banner preview"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Terms Agreement */}
                        <div className="flex items-center">
                            <input
                                id="agreeToTerms"
                                name="agreeToTerms"
                                type="checkbox"
                                className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                                Tôi đồng ý với các điều khoản và điều kiện
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300"
                    >
                        Đăng ký bán hàng
                    </button>

                    <p className="mt-4 text-center text-sm text-gray-600">
                        Quay lại{" "}
                        <a href="/User/Login" className="text-red-500 hover:underline">
                            trang đăng nhập
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}