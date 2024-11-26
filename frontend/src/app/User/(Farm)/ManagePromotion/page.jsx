"use client";
import { deletePromotion, getProductByID, getPromotionsByFarmId, updatePromotion } from "@/util/userAPI";
import { getCookie } from "cookies-next";
import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/userComponents/loadingSpinner";

const ManagePromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [displayedPromotions, setDisplayedPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [productNames, setProductNames] = useState({});
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [updateForm, setUpdateForm] = useState({
        promotion_name: "",
        promotion_description: "",
        promotion_value: "",
        promotion_id: null,
    });
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(0);
    const [sortType, setSortType] = useState("newest");

    useEffect(() => {
        fetchPromotions();
    }, []);

    useEffect(() => {
        loadProductNames();
    }, [promotions]);

    useEffect(() => {
        if (showUpdateModal || showDeleteModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [showUpdateModal, showDeleteModal]);

    const loadProductNames = async () => {
        const newProductNames = { ...productNames };
        for (const promotion of promotions) {
            if (promotion.product_id && !productNames[promotion.product_id]) {
                try {
                    const response = await getProductByID(promotion.product_id);
                    if (response.success) {
                        newProductNames[promotion.product_id] = response.data.product_name;
                    }
                } catch (error) {
                    console.error("Error fetching product name:", error);
                }
            }
        }
        setProductNames(newProductNames);
    };

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const userInfo = getCookie("user_info");
            if (!userInfo) return;
            const userData = JSON.parse(userInfo);

            const response = await getPromotionsByFarmId(userData.user_id);
            if (response.success) {
                const sortedPromotions = [...response.data].sort((a, b) => new Date(b.promotion_start_date) - new Date(a.promotion_start_date));
                setPromotions(sortedPromotions);
                handleSort(sortedPromotions, "newest");
            }
        } catch (error) {
            toast.error("Không thể tải danh sách khuyến mãi");
        }
        setLoading(false);
    };

    const handleUpdate = (promotion) => {
        setSelectedPromotion(promotion);
        setUpdateForm({
            promotion_name: promotion.promotion_name,
            promotion_description: promotion.promotion_description || "",
            promotion_value: promotion.promotion_value,
            promotion_id: promotion.promotion_id,
        });
        setShowUpdateModal(true);
    };

    const handleUpdateSubmit = async () => {
        try {
            if (!updateForm.promotion_id) {
                toast.error("Không tìm thấy mã khuyến mãi");
                return;
            }

            const response = await updatePromotion(
                updateForm.promotion_id,
                updateForm.promotion_name,
                updateForm.promotion_description,
                updateForm.promotion_value
            );

            if (response.success) {
                toast.success("Cập nhật khuyến mãi thành công");
                setShowUpdateModal(false);
                await fetchPromotions();
            } else {
                toast.error("Không thể cập nhật khuyến mãi");
            }
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi cập nhật khuyến mãi");
        }
    };

    const handleDeleteClick = (promotion) => {
        setSelectedPromotion(promotion);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await deletePromotion(selectedPromotion.promotion_id);
            if (response.success) {
                toast.success("Xóa khuyến mãi thành công");
                setShowDeleteModal(false);
                await fetchPromotions();
            } else {
                toast.error(response.message || "Không thể xóa khuyến mãi");
            }
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi xóa khuyến mãi");
        }
    };

    const handleSort = (promos = promotions, type = sortType) => {
        let sorted = [...promos];
        const now = new Date();

        switch (type) {
            case "newest":
                sorted.sort((a, b) => new Date(b.promotion_start_date) - new Date(a.promotion_start_date));
                break;
            case "oldest":
                sorted.sort((a, b) => new Date(a.promotion_start_date) - new Date(b.promotion_start_date));
                break;
            case "active":
                sorted = sorted.filter((p) => new Date(p.promotion_end_date) > now);
                break;
            case "expired":
                sorted = sorted.filter((p) => new Date(p.promotion_end_date) <= now);
                break;
        }

        setSortType(type);
        updateDisplayedPromotions(sorted, 0);
    };

    const updateDisplayedPromotions = (sortedPromotions, page) => {
        const startIndex = page * itemsPerPage;
        setDisplayedPromotions(sortedPromotions.slice(startIndex, startIndex + itemsPerPage));
        setCurrentPage(page);
    };

    const handlePageClick = (event) => {
        updateDisplayedPromotions(promotions, event.selected);
    };

    const now = new Date();
    const metrics = [
        {
            title: "Tổng khuyến mãi",
            value: promotions.length,
            bgColor: "bg-blue-100",
            textColor: "text-blue-600",
        },
        {
            title: "Khuyến mãi hết hạn",
            value: promotions.filter((p) => new Date(p.promotion_end_date) <= now).length,
            bgColor: "bg-red-100",
            textColor: "text-red-600",
        },
        {
            title: "Khuyến mãi đang chạy",
            value: promotions.filter((p) => new Date(p.promotion_end_date) > now).length,
            bgColor: "bg-green-100",
            textColor: "text-green-600",
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Quản lý khuyến mãi</h1>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {metrics.map((metric, index) => (
                    <div key={index} className={`${metric.bgColor} rounded-lg p-6 shadow-sm`}>
                        <h3 className="text-lg font-semibold">{metric.title}</h3>
                        <p className={`${metric.textColor} text-2xl font-bold`}>{metric.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Danh sách khuyến mãi</h2>
                    <select className="border rounded px-3 py-1" value={sortType} onChange={(e) => handleSort(promotions, e.target.value)}>
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="active">Còn hạn</option>
                        <option value="expired">Hết hạn</option>
                    </select>
                </div>

                {loading && <LoadingSpinner /> ? (
                    <div className="text-center py-4">Đang tải...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left">Tên khuyến mãi</th>
                                    <th className="px-4 py-2 text-left">Sản phẩm</th>
                                    <th className="px-4 py-2 text-left">Giá trị</th>
                                    <th className="px-4 py-2 text-left">Thời gian</th>
                                    <th className="px-4 py-2 text-left">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedPromotions.map((promotion) => (
                                    <tr key={promotion.promotion_id} className="border-b">
                                        <td className="px-4 py-2">{promotion.promotion_name}</td>
                                        <td className="px-4 py-2">
                                            {promotion.product_id ? productNames[promotion.product_id] || "Đang tải..." : "Tất cả sản phẩm"}
                                        </td>
                                        <td className="px-4 py-2">{promotion.promotion_value}%</td>
                                        <td className="px-4 py-2">
                                            {new Date(promotion.promotion_start_date).toLocaleDateString()} -
                                            {new Date(promotion.promotion_end_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2 space-x-2">
                                            <button
                                                onClick={() => handleUpdate(promotion)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(promotion)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Update Modal */}
                        {showUpdateModal && (
                            <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="bg-white w-full max-w-lg mx-4 rounded-lg shadow-xl">
                                    <div className="border-b px-6 py-4">
                                        <h3 className="text-xl font-medium text-gray-900">Cập nhật khuyến mãi</h3>
                                    </div>
                                    <div className="px-6 py-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khuyến mãi</label>
                                            <input
                                                type="text"
                                                value={updateForm.promotion_name}
                                                onChange={(e) => setUpdateForm({ ...updateForm, promotion_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                            <textarea
                                                value={updateForm.promotion_description}
                                                onChange={(e) => setUpdateForm({ ...updateForm, promotion_description: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                rows="3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị (%)</label>
                                            <input
                                                type="number"
                                                value={updateForm.promotion_value}
                                                onChange={(e) => setUpdateForm({ ...updateForm, promotion_value: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse">
                                        <button
                                            onClick={handleUpdateSubmit}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            Cập nhật
                                        </button>
                                        <button
                                            onClick={() => setShowUpdateModal(false)}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showDeleteModal && (
                            <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="bg-white p-6 rounded-lg max-w-sm mx-auto">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Bạn có chắc chắn muốn xóa khuyến mãi này? Hành động này không thể hoàn tác.
                                    </p>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                                        >
                                            Hủy
                                        </button>
                                        <button onClick={handleDeleteConfirm} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ReactPaginate
                            breakLabel="..."
                            nextLabel="Tiếp >"
                            onPageChange={handlePageClick}
                            pageRangeDisplayed={5}
                            pageCount={Math.ceil(promotions.length / itemsPerPage)}
                            previousLabel="< Trước"
                            renderOnZeroPageCount={null}
                            className="mt-4 flex items-center justify-center gap-2"
                            pageClassName="px-3 py-1 border rounded hover:bg-blue-400"
                            previousClassName="px-3 py-1 border rounded hover:bg-gray-100"
                            nextClassName="px-3 py-1 border rounded hover:bg-gray-100"
                            activeClassName="bg-blue-500 text-white"
                            disabledClassName="opacity-50 cursor-not-allowed"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagePromotions;
