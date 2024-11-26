"use client";
import { getAllPaymentMethod, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "@/util/adminAPI";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const PaymentMethodManagement = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [newMethod, setNewMethod] = useState("");
    const [editingMethod, setEditingMethod] = useState(null);
    const [editName, setEditName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        setIsLoading(true);
        try {
            const response = await getAllPaymentMethod();
            if (response.success) {
                setPaymentMethods(response.data);
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            toast.error("Không thể tải dữ liệu");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPaymentMethod = async (e) => {
        e.preventDefault();
        if (!newMethod.trim()) return;

        try {
            const response = await addPaymentMethod(newMethod);
            if (response.success) {
                await fetchPaymentMethods();
                setNewMethod("");
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            toast.error("Không thể thêm phương thức thanh toán");
        }
    };

    const handleUpdatePaymentMethod = async (e) => {
        e.preventDefault();
        if (!editName.trim() || !editingMethod) return;

        try {
            const response = await updatePaymentMethod(editingMethod.payment_method_id, editName);
            console.log("check >>> ", response);
            
            if (response.success) {
                await fetchPaymentMethods();
                setEditingMethod(null);
                setEditName("");
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            toast.error("Không thể cập nhật phương thức thanh toán");
        }
    };

    const openDeleteModal = (payment_method_id) => {
        setDeletingId(payment_method_id);
        setShowDeleteModal(true);
    };

    const handleDeletePaymentMethod = async () => {
        try {
            const response = await deletePaymentMethod(deletingId);
            if (response.success) {
                await fetchPaymentMethods();
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            toast.error("Không thể xóa phương thức thanh toán");
        } finally {
            setShowDeleteModal(false);
            setDeletingId(null);
        }
    };

    const DeleteConfirmationModal = () => {
        if (!showDeleteModal) return null;

        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
                        <p className="text-gray-500">Bạn có chắc chắn muốn xóa phương thức thanh toán này? Hành động này không thể hoàn tác.</p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeletingId(null);
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleDeletePaymentMethod}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Quản lý phương thức thanh toán</h1>

            {/* Form thêm mới */}
            <form onSubmit={handleAddPaymentMethod} className="mb-8">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newMethod}
                        onChange={(e) => setNewMethod(e.target.value)}
                        placeholder="Nhập tên phương thức thanh toán mới"
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Thêm mới
                    </button>
                </div>
            </form>

            {/* Danh sách phương thức thanh toán */}
            {isLoading ? (
                <div className="text-center">Đang tải...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên phương thức</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paymentMethods.map((method) => (
                                <tr key={method.payment_method_id}>
                                    <td className="px-6 py-4">
                                        {editingMethod?.payment_method_id === method.payment_method_id ? (
                                            <form onSubmit={handleUpdatePaymentMethod} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="flex-1 p-1 border rounded"
                                                />
                                                <button type="submit" className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                                                    Lưu
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingMethod(null);
                                                        setEditName("");
                                                    }}
                                                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                >
                                                    Hủy
                                                </button>
                                            </form>
                                        ) : (
                                            method.method_name
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingMethod?.payment_method_id !== method.payment_method_id && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setEditingMethod(method);
                                                        setEditName(method.method_name);
                                                    }}
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
                                                    onClick={() => openDeleteModal(method.payment_method_id)}
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal />
        </div>
    );
};

export default PaymentMethodManagement;