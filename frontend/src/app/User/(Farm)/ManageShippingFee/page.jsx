"use client";
import { getAllCity, getAllRegion } from "@/util/adminAPI";
import ReactPaginate from "react-paginate";
import {
    createShippingFee,
    getShippingFeeByVendor,
    updateShippingFeeByVendor,
    deleteShippingFeeByVendor,
    setShippingFeeForAllCities,
} from "@/util/userAPI";
import { getCookie } from "cookies-next";
import React, { useState, useEffect } from "react";

const ShippingFeeManagement = () => {
    // State management
    const [userInfo, setUserInfo] = useState(null);
    const [regions, setRegions] = useState([]);
    const [allCities, setAllCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [shippingCost, setShippingCost] = useState("");
    const [shippingFees, setShippingFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [editingCost, setEditingCost] = useState("");
    const [globalShippingCost, setGlobalShippingCost] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 7;

    // Calculate current items to display
    const offset = currentPage * itemsPerPage;
    const currentItems = shippingFees.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(shippingFees.length / itemsPerPage);

    // Handle page change
    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    // Load user info from cookie
    useEffect(() => {
        const cookieData = getCookie("user_info");
        if (cookieData) {
            try {
                const parsedData = JSON.parse(cookieData);
                setUserInfo(parsedData);
            } catch (err) {
                setError("Lỗi khi đọc thông tin người dùng");
            }
        }
    }, []);

    // Load regions
    useEffect(() => {
        const loadRegions = async () => {
            try {
                const response = await getAllRegion();
                if (response.success) {
                    setRegions(response.data);
                }
            } catch (err) {
                setError("Lỗi khi tải danh sách vùng miền");
            }
        };
        loadRegions();
    }, []);

    // Load all cities once
    useEffect(() => {
        const loadAllCities = async () => {
            try {
                const response = await getAllCity();
                if (response.success) {
                    setAllCities(response.data);
                }
            } catch (err) {
                setError("Lỗi khi tải danh sách thành phố");
            }
        };
        loadAllCities();
    }, []);

    // Filter cities when region changes
    useEffect(() => {
        if (!selectedRegion) {
            setFilteredCities([]);
            setSelectedCity("");
            return;
        }

        const citiesInRegion = allCities.filter((city) => city.region_id === selectedRegion);
        setFilteredCities(citiesInRegion);
        setSelectedCity("");
    }, [selectedRegion, allCities]);

    const handleSetGlobalShippingFee = async (e) => {
        e.preventDefault();

        if (!userInfo?.user_id) {
            setError("Không tìm thấy thông tin người dùng");
            return;
        }

        if (!globalShippingCost) {
            setError("Vui lòng nhập phí ship");
            return;
        }

        try {
            const response = await setShippingFeeForAllCities(userInfo.user_id, Number(globalShippingCost));

            if (response.success) {
                // Refresh shipping fees list
                const updatedFeesResponse = await getShippingFeeByVendor(userInfo.user_id);
                if (updatedFeesResponse.success) {
                    const feesWithCityNames = updatedFeesResponse.data.map((fee) => {
                        const city = allCities.find((c) => c.city_id === fee.city_id);
                        return {
                            ...fee,
                            cityName: city ? city.city_name : "N/A",
                        };
                    });
                    setShippingFees(feesWithCityNames);
                    setGlobalShippingCost("");
                    setError(null);
                }
            } else {
                setError(response.message || "Lỗi khi cập nhật phí ship");
            }
        } catch (err) {
            setError("Lỗi khi cập nhật phí ship");
        }
    };

    // Load shipping fees when user info is available
    useEffect(() => {
        const loadShippingFees = async () => {
            if (!userInfo?.user_id) return;

            try {
                setLoading(true);
                const response = await getShippingFeeByVendor(userInfo.user_id);

                if (response.success && Array.isArray(response.data)) {
                    // Map shipping fees with city names from allCities
                    const feesWithCityNames = response.data.map((fee) => {
                        const city = allCities.find((c) => c.city_id === fee.city_id);
                        return {
                            ...fee,
                            cityName: city ? city.city_name : "N/A",
                        };
                    });
                    setShippingFees(feesWithCityNames);
                }
            } catch (err) {
                setError("Lỗi khi tải thông tin phí ship");
            } finally {
                setLoading(false);
            }
        };

        if (allCities.length > 0) {
            loadShippingFees();
        }
    }, [userInfo, allCities]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userInfo?.user_id) {
            setError("Không tìm thấy thông tin người dùng");
            return;
        }

        if (!selectedCity || !shippingCost) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            const response = await createShippingFee(userInfo.user_id, selectedCity, Number(shippingCost));

            if (response.success) {
                // After successful creation, reload shipping fees
                const updatedFeesResponse = await getShippingFeeByVendor(userInfo.user_id);
                if (updatedFeesResponse.success) {
                    const feesWithCityNames = updatedFeesResponse.data.map((fee) => {
                        const city = allCities.find((c) => c.city_id === fee.city_id);
                        return {
                            ...fee,
                            cityName: city ? city.city_name : "N/A",
                        };
                    });
                    setShippingFees(feesWithCityNames);
                    resetForm();
                    setError(null);
                }
            } else {
                setError(response.message || "Lỗi khi thêm phí ship");
            }
        } catch (err) {
            setError("Lỗi khi thêm phí ship");
        }
    };

    // Reset form fields
    const resetForm = () => {
        setSelectedRegion("");
        setSelectedCity("");
        setShippingCost("");
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };
    // Handle edit button click
    const handleEditClick = (fee) => {
        setEditMode(true);
        setEditingFee(fee);
        setEditingCost(fee.shipping_cost.toString());
    };

    // Handle update shipping fee
    const handleUpdate = async () => {
        if (!userInfo?.user_id || !editingFee || !editingCost) {
            setError("Thông tin không hợp lệ");
            return;
        }

        try {
            const response = await updateShippingFeeByVendor(editingFee.shipping_fee_id, Number(editingCost));

            if (response.success) {
                // Refresh shipping fees list
                const updatedFeesResponse = await getShippingFeeByVendor(userInfo.user_id);
                if (updatedFeesResponse.success) {
                    const feesWithCityNames = updatedFeesResponse.data.map((fee) => {
                        const city = allCities.find((c) => c.city_id === fee.city_id);
                        return {
                            ...fee,
                            cityName: city ? city.city_name : "N/A",
                        };
                    });
                    setShippingFees(feesWithCityNames);
                    setError(null);
                }
                // Reset edit mode
                setEditMode(false);
                setEditingFee(null);
                setEditingCost("");
            } else {
                setError(response.message || "Lỗi khi cập nhật phí ship");
            }
        } catch (err) {
            setError("Lỗi khi cập nhật phí ship");
        }
    };

    // Handle delete shipping fee
    const handleDelete = async (shippingFeeId) => {
        if (!userInfo?.user_id) {
            setError("Không tìm thấy thông tin người dùng");
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn xóa phí ship này?")) {
            try {
                const response = await deleteShippingFeeByVendor(shippingFeeId);

                if (response.success) {
                    // Refresh shipping fees list
                    const updatedFeesResponse = await getShippingFeeByVendor(userInfo.user_id);
                    if (updatedFeesResponse.success) {
                        const feesWithCityNames = updatedFeesResponse.data.map((fee) => {
                            const city = allCities.find((c) => c.city_id === fee.city_id);
                            return {
                                ...fee,
                                cityName: city ? city.city_name : "N/A",
                            };
                        });
                        setShippingFees(feesWithCityNames);
                        setError(null);
                    }
                } else {
                    setError(response.message || "Lỗi khi xóa phí ship");
                }
            } catch (err) {
                setError("Lỗi khi xóa phí ship");
            }
        }
    };

    // Cancel edit mode
    const handleCancelEdit = () => {
        setEditMode(false);
        setEditingFee(null);
        setEditingCost("");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-600">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý phí vận chuyển</h1>

                <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-4">
                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Chọn vùng miền</option>
                        {regions.map((region) => (
                            <option key={region.region_id} value={region.region_id}>
                                {region.region_name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!selectedRegion}
                    >
                        <option value="">Chọn thành phố</option>
                        {filteredCities.map((city) => (
                            <option key={city.city_id} value={city.city_id}>
                                {city.city_name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(e.target.value)}
                        placeholder="Nhập phí ship"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                    />

                    <button
                        type="submit"
                        disabled={!selectedCity || !shippingCost}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Thêm phí ship
                    </button>
                </form>
            </div>

            {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Cập nhật đồng loạt</h2>
                <form onSubmit={handleSetGlobalShippingFee} className="flex items-center gap-4">
                    <input
                        type="number"
                        value={globalShippingCost}
                        onChange={(e) => setGlobalShippingCost(e.target.value)}
                        placeholder="Nhập phí ship cho tất cả thành phố"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                        min="0"
                    />
                    <button
                        type="submit"
                        disabled={!globalShippingCost}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Cập nhật tất cả
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành phố</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phí ship</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.length > 0 ? (
                            currentItems.map((fee) => (
                                <tr key={fee.shipping_fee_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{fee.cityName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editMode && editingFee?.shipping_fee_id === fee.shipping_fee_id ? (
                                            <input
                                                type="number"
                                                value={editingCost}
                                                onChange={(e) => setEditingCost(e.target.value)}
                                                className="px-2 py-1 border border-gray-300 rounded-md w-32"
                                                min="0"
                                            />
                                        ) : (
                                            formatCurrency(fee.shipping_cost)
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex gap-2">
                                            {editMode && editingFee?.shipping_fee_id === fee.shipping_fee_id ? (
                                                <>
                                                    <button onClick={handleUpdate} className="text-green-600 hover:text-green-800">
                                                        Lưu
                                                    </button>
                                                    <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-800">
                                                        Hủy
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                        onClick={() => handleEditClick(product.product_id)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>

                    <button
                        onClick={() => handleDeleteClick(product.product_id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                    Chưa có dữ liệu phí ship
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {shippingFees.length > itemsPerPage && (
                <ReactPaginate
                    breakLabel="..."
                    nextLabel="Tiếp >"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={5}
                    pageCount={pageCount}
                    previousLabel="< Trước"
                    renderOnZeroPageCount={null}
                    className="mt-4 flex items-center justify-center gap-2"
                    pageClassName="px-3 py-1 border rounded hover:bg-gray-100"
                    previousClassName="px-3 py-1 border rounded hover:bg-gray-100"
                    nextClassName="px-3 py-1 border rounded hover:bg-gray-100"
                    activeClassName="bg-blue-500 text-white"
                    disabledClassName="opacity-50 cursor-not-allowed"
                />
            )}
        </div>
    );
};

export default ShippingFeeManagement;
