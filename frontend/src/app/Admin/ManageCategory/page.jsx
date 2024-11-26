"use client";
import React, { useState, useEffect } from "react";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import {
    getAllCategoryParent,
    addCategoryParent,
    deleteCategoryParent,
    getAllCategoryChild,
    addCategoryChild,
    deleteCategoryChild,
} from "../../../util/adminAPI";
import { toast } from "react-toastify";

export default function ManageCategory() {
    const [parentCategories, setParentCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [selectedParent, setSelectedParent] = useState(null);
    const [showAddParentModal, setShowAddParentModal] = useState(false);
    const [showAddChildModal, setShowAddChildModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [loading, setLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmData, setConfirmData] = useState({ title: "", message: "", callback: null });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const parentData = await getAllCategoryParent();
            const childData = await getAllCategoryChild();
            // console.log('Parent Response:', parentData.data);
            // console.log('Child Response:', childData.data);

            if (parentData.success && childData.success) {
                setParentCategories(parentData.data);

                const transformedChildren = childData.data.map((child) => ({
                    ...child,
                    category_parent_id: child.category_parent_id,
                    category_child_id: child.category_child_id,
                    category_child_name: child.category_child_name,
                }));

                setChildCategories(transformedChildren);
            } else {
                console.error("Failed to fetch categories", {
                    parentSuccess: parentData.success,
                    childSuccess: childData.success,
                });
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddParentCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const response = await addCategoryParent(newCategoryName);
            if (response.success) {
                await fetchCategories();
                setNewCategoryName("");
                setShowAddParentModal(false);
                toast.success(response.message);
            }
        } catch (error) {
            console.error("Error adding parent category:", error);
        }
    };

    const handleAddChildCategory = async () => {
        if (!newCategoryName.trim() || !selectedParent) return;

        try {
            const response = await addCategoryChild(selectedParent.category_parent_id, newCategoryName);
            console.log("response > ", response);

            if (response.success) {
                await fetchCategories();
                setNewCategoryName("");
                setShowAddChildModal(false);
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error adding child category:", error);
        }
    };

    const handleDeleteParent = async (category_parent_id) => {
        handleShowConfirm("Xác nhận xóa", "Bạn có chắc chắn muốn xóa danh mục này và tất cả danh mục con của nó?", async () => {
            try {
                const response = await deleteCategoryParent(category_parent_id);
                if (response.success) {
                    await fetchCategories();
                    toast.success(response.message);
                }
            } catch (error) {
                console.error("Error deleting parent category:", error);
                toast.error("Có lỗi xảy ra khi xóa danh mục");
            }
        });
    };

    const handleDeleteChild = async (childId) => {
        handleShowConfirm("Xác nhận xóa", "Bạn có chắc chắn muốn xóa danh mục con này?", async () => {
            try {
                const response = await deleteCategoryChild(childId);
                if (response.success) {
                    await fetchCategories();
                    toast.success(response.message);
                }
            } catch (error) {
                console.error("Error deleting child category:", error);
                toast.error("Có lỗi xảy ra khi xóa danh mục con");
            }
        });
    };

    const toggleCategory = (categoryId) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const handleShowConfirm = (title, message, callback) => {
        setConfirmData({ title, message, callback });
        setShowConfirmModal(true);
    };

    const Modal = ({ isOpen, onClose, title, onSubmit, children }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            ×
                        </button>
                    </div>
                    <div className="space-y-4">
                        {children}
                        <div className="flex justify-end space-x-2">
                            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                Hủy
                            </button>
                            <button onClick={onSubmit} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="text-gray-600 mt-2">{message}</p>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                            Hủy
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Quản lý danh mục</h2>
                    <button
                        onClick={() => setShowAddParentModal(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                    >
                        <span>+</span>
                        Thêm danh mục
                    </button>
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <span className="text-gray-500">Đang tải...</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {parentCategories.map((parent) => (
                                <div key={parent.category_parent_id} className="border rounded-lg">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                        onClick={() => toggleCategory(parent.category_parent_id)}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {expandedCategories[parent.category_parent_id] ? (
                                                <IoMdArrowDropdown className="text-xl" />
                                            ) : (
                                                <IoMdArrowDropright className="text-xl" />
                                            )}
                                            <span className="font-medium">{parent.category_parent_name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="p-2 hover:bg-gray-100 rounded-md"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedParent(parent);
                                                    setShowAddChildModal(true);
                                                }}
                                            >
                                                +
                                            </button>
                                            {/* Delete Button */}
                                            <button
                                                className="p-2 hover:bg-gray-100 rounded-md text-red-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteParent(parent.category_parent_id);
                                                }}
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
                                        </div>
                                    </div>
                                    {expandedCategories[parent.category_parent_id] && (
                                        <div className="border-t bg-gray-50">
                                            {childCategories
                                                .filter((child) => child.category_parent_id === parent.category_parent_id)
                                                .map((child) => (
                                                    <div
                                                        key={child.category_child_id}
                                                        className="flex items-center justify-between p-3 pl-8 hover:bg-gray-100"
                                                    >
                                                        <span>{child.category_child_name}</span>
                                                {/* Delete Button */}
                                                <button
                                                    className="p-2 hover:bg-gray-100 rounded-md text-red-500"
                                                    onClick={() => handleDeleteChild(child.category_child_id)}
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
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={showAddParentModal}
                onClose={() => {
                    setShowAddParentModal(false);
                    setNewCategoryName("");
                }}
                title="Thêm danh mục mới"
                onSubmit={handleAddParentCategory}
            >
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nhập tên danh mục"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                />
            </Modal>

            <Modal
                isOpen={showAddChildModal}
                onClose={() => {
                    setShowAddChildModal(false);
                    setNewCategoryName("");
                    setSelectedParent(null);
                }}
                title={`Thêm danh mục con cho ${selectedParent?.category_parent_name || ""}`}
                onSubmit={handleAddChildCategory}
            >
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nhập tên danh mục con"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                />
            </Modal>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    confirmData.callback?.();
                    setShowConfirmModal(false);
                }}
                title={confirmData.title}
                message={confirmData.message}
            />
        </div>
    );
}
