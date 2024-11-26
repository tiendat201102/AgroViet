"use client";
import React, { useState, useEffect } from "react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { GetUserAPI, UpdateUserAPI } from "@/util/userAPI";
import { toast } from "react-toastify";
import { getAllRegion, getAllCity } from "@/util/adminAPI";

export default function UserProfile() {
    const [user, setUser] = useState({});
    const [userEmail, setUserEmail] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [file, setFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [filteredCities, setFilteredCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRegionName, setSelectedRegionName] = useState("");
    const [selectedCityName, setSelectedCityName] = useState("");

    const provinces = [
        "An Giang",
        "Bà Rịa - Vũng Tàu",
        "Bắc Giang",
        "Bắc Kạn",
        "Bến Tre",
        "Bình Định",
        "Bình Dương",
        "Bình Phước",
        "Cà Mau",
        "Cần Thơ",
        "Đắk Lắk",
        "Đắk Nông",
        "Điện Biên",
        "Đồng Nai",
        "Đồng Tháp",
        "Gia Lai",
        "Hà Giang",
        "Hà Nam",
        "Hà Tĩnh",
        "Hải Dương",
        "Hải Phòng",
        "Hòa Bình",
        "Hưng Yên",
        "Khánh Hòa",
        "Kiên Giang",
        "Kon Tum",
        "Lai Châu",
        "Lạng Sơn",
        "Lào Cai",
        "Long An",
        "Nam Định",
        "Nghệ An",
        "Ninh Bình",
        "Ninh Thuận",
        "Phú Thọ",
        "Phú Yên",
        "Quảng Bình",
        "Quảng Nam",
        "Quảng Ngãi",
        "Quảng Ninh",
        "Quảng Trị",
        "Sóc Trăng",
        "Sơn La",
        "Tây Ninh",
        "Thái Bình",
        "Thái Nguyên",
        "Thanh Hóa",
        "Thừa Thiên Huế",
        "Tiền Giang",
        "TP Hồ Chí Minh",
        "Tuyên Quang",
        "Vĩnh Long",
        "Vĩnh Phúc",
        "Yên Bái",
    ];
    useEffect(() => {
        fetchUser();
        fetchData();
    }, []);

    // useEffect(() => {
    //     if (selectedRegion) {
    //         const citiesInRegion = cities.filter((city) => city.region_id === selectedRegion);
    //         setFilteredCities(citiesInRegion);
    //     } else {
    //         setFilteredCities([]);
    //     }
    // }, [selectedRegion, cities]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [regionsResponse, citiesResponse] = await Promise.all([getAllRegion(), getAllCity()]);

            if (regionsResponse.success && citiesResponse.success) {
                setRegions(regionsResponse.data);
                setCities(citiesResponse.data);
                
                // Nếu user đã có region_id, set selected region và filter cities
                if (user.region_id) {
                    setSelectedRegion(user.region_id);
                    const citiesInRegion = citiesResponse.data.filter(
                        city => city.region_id === user.region_id
                    );
                    setFilteredCities(citiesInRegion);
                }
            } else {
                console.error("Failed to fetch data");
                toast.error("Có lỗi xảy ra khi tải dữ liệu vùng miền và thành phố");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        const userInfo = getCookie("user_info");

        if (userInfo) {
            try {
                const userData = JSON.parse(userInfo);
                const email = userData.email;
                const res = await GetUserAPI(email);
                if (res && res.success) {
                    setUser(res.data);
                    if (res.data.image) {
                        setPreviewImage(`data:image/jpeg;base64,${res.data.image}`);
                    } else {
                        setPreviewImage("/defaultUserImage.webp");
                    }

                    // if (res.data.region_id) {
                    //     setSelectedRegion(res.data.region_id);
                    // }
                    // if (res.data.city_id) {
                    //     const cityData = cities.find((c) => c._id === res.data.city_id);
                    //     if (cityData) {
                    //         setSelectedCityName(cityData.name);
                    //     }
                    // }
                    if (res.data.region_id) {
                        setSelectedRegion(res.data.region_id);
                        setSelectedRegionName(res.data.region_name);
                    }
                    if (res.data.city_id) {
                        setSelectedCityName(res.data.city_name);
                    }
                }
            } catch (error) {
                console.error("Error parsing user info:", error);
                toast.error("Có lỗi xảy ra khi lấy thông tin người dùng.");
            }
        }
    };

    useEffect(() => {
        if (selectedRegion) {
            const citiesInRegion = cities.filter(city => city.region_id === selectedRegion);
            setFilteredCities(citiesInRegion);

            // Tìm và set tên vùng
            const region = regions.find(r => r._id === selectedRegion);
            if (region) {
                setSelectedRegionName(region.region_name);
            }
        } else {
            setFilteredCities([]);
            setSelectedRegionName("");
        }
    }, [selectedRegion, cities, regions]);

    const handleRegionChange = (e) => {
        const regionId = e.target.value;
        setSelectedRegion(regionId);
        setUser((prevUser) => ({
            ...prevUser,
            region_id: regionId,
            city: "",
        }));
        setSelectedCityName("");
    };

    const handleCityChange = (e) => {
        const cityId = e.target.value;
        setUser((prevUser) => ({
            ...prevUser,
            city_id: cityId,
        }));
        const city = cities.find((c) => c._id === cityId);
        if (city) {
            setSelectedCityName(city.name);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(",")[1];
                setUser((prevUser) => ({
                    ...prevUser,
                    image: base64String,
                }));
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            const response = await UpdateUserAPI(
                user.email,
                user.name,
                passwords.oldPassword,
                passwords.newPassword,
                user.gender,
                user.phone,
                user.image,
                // user.address,
                user.region_id,
                user.city_id
                // selectedRegionName,
                // selectedCityName 
            );
            console.log("response co gì: ", response);

            if (passwords.newPassword || passwords.oldPassword) {
                // Kiểm tra xem đã nhập đủ các trường mật khẩu chưa
                if (!passwords.oldPassword) {
                    toast.error("Vui lòng nhập mật khẩu cũ");
                    return;
                }
                if (!passwords.newPassword) {
                    toast.error("Vui lòng nhập mật khẩu mới");
                    return;
                }
                if (passwords.newPassword !== passwords.confirmPassword) {
                    toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
                    return;
                }
            }

            if (response.success) {
                toast.success(response.message);
                setIsEditing(false);

                const updatedUserInfo = JSON.stringify(response.data);
                console.log("updateUserInfor co gi: ", updatedUserInfo);

                setCookie("user_info", updatedUserInfo, {
                    maxAge: 24 * 60 * 60,
                    path: "/",
                });

                window.dispatchEvent(
                    new CustomEvent("profileUpdate", {
                        detail: response.data,
                    })
                );

                setUser(response.data);
                setPasswords({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                if (response.data.image) {
                    setPreviewImage(`data:image/jpeg;base64,${response.data.image}`);
                }
                setFile(null);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEdit = () => {
        // console.log("truoc khi thay doi du lieu co gi");

        setIsEditing(true);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8">
                <h2 className="text-2xl font-semibold mb-4">Trang cá nhân</h2>
                <p className="text-gray-600 mb-6">Real-time information and activities of your property.</p>

                {/* Profile Picture */}
                <div className="flex items-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-gray-300 mr-4">
                        {/* <img src={previewImage || "/defaultUserImage.webp"} alt="Profile" className="w-full h-full rounded-full object-cover" /> */}
                        {previewImage ? (
                            <img src={previewImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <img src="/defaultUserImage.webp" alt="Default Profile" className="w-full h-full rounded-full object-cover" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Ảnh PNG, JPEG không trên 15MB</p>
                        <input
                            className="px-4 py-2 text-sm bg-gray-200 rounded-lg mr-2"
                            type="file"
                            onChange={handleFileChange}
                            disabled={!isEditing}
                        />
                        {file && <p className="text-sm text-gray-600 mt-2">Chọn ảnh: {file.name}</p>}
                    </div>
                </div>

                {/* Full Name */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Họ và tên</h3>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full name"
                        className="border border-gray-300 rounded-lg p-3 w-full"
                        value={user.name || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                    />
                </div>

                {/* Contact Email */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Email</h3>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="border border-gray-300 rounded-lg p-3 w-full"
                        value={user.email || ""}
                        disabled={true}
                    />
                </div>
                
                {/* Region and City */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Địa chỉ giao hàng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Miền</label>
                            <select
                                name="region_id"
                                className="border border-gray-300 rounded-lg p-3 w-full"
                                value={user.region_id || ""}
                                onChange={handleRegionChange}
                                disabled={!isEditing || loading}
                            >
                                <option value="">Select Region</option>
                                {regions.map((region) => (
                                    <option key={region.region_id} value={region.region_id}>
                                        {region.region_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                            <select
                                name="city_id"
                                className="border border-gray-300 rounded-lg p-3 w-full"
                                value={user.city_id || ""}
                                onChange={handleCityChange}
                                disabled={!isEditing || !selectedRegion || loading}
                            >
                                <option value="">Select City</option>
                                {filteredCities.map((city) => (
                                    <option key={city.city_id} value={city.city_id}>
                                        {city.city_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Phone */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Số điện thoại</h3>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone number"
                        className="border border-gray-300 rounded-lg p-3 w-full"
                        value={user.phone || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                    />
                </div>

                {/* Gender */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Giới tính</h3>
                    <select
                        name="gender"
                        className="border border-gray-300 rounded-lg p-3 w-full"
                        value={user.gender || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                    >
                        <option value="">Select gender</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                    </select>
                </div>

                {/* Password */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Password</h3>
                    <p className="text-sm text-gray-500 mb-2">Thay đổi mật khẩu của bạn.</p>
                    <div className="space-y-4">
                        <input
                            type="password"
                            name="oldPassword"
                            placeholder="Mật khẩu cũ"
                            className="border border-gray-300 rounded-lg p-3 w-full"
                            value={passwords.oldPassword}
                            onChange={handlePasswordChange}
                            disabled={!isEditing}
                        />
                        <div className="flex gap-x-4">
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="Mật khẩu mới"
                                className="border border-gray-300 rounded-lg p-3 w-full"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                disabled={!isEditing}
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Xác nhận mật khẩu mới"
                                className="right-0 border border-gray-300 rounded-lg p-3 w-full"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex items-center justify-center gap-4">
                    <button className="px-4 py-2 text-sm rounded-lg bg-green-400 hover:bg-green-200" onClick={handleEdit} disabled={isEditing}>
                        EDIT
                    </button>
                    <button className="px-4 py-2 text-sm rounded-lg bg-red-400 hover:bg-red-200" onClick={handleSave} disabled={!isEditing}>
                        SAVE
                    </button>
                </div>
            </div>
        </div>
    );
}
