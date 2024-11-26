"use client";
import { getAllRegion, addRegion, updateRegion, deleteRegion, getAllCity, addCity, updateCity, deleteCity } from "@/util/adminAPI";
import React, { useState, useEffect } from "react";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { toast } from "react-toastify";

export default function ManageRegions() {
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [showAddRegionModal, setShowAddRegionModal] = useState(false);
    const [showAddCityModal, setShowAddCityModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [loading, setLoading] = useState(false);
    const [expandedRegions, setExpandedRegions] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmData, setConfirmData] = useState({ title: "", message: "", callback: null });
    const [showEditRegionModal, setShowEditRegionModal] = useState(false);
    const [showEditCityModal, setShowEditCityModal] = useState(false);
    const [editingRegion, setEditingRegion] = useState(null);
    const [editingCity, setEditingCity] = useState(null);
    const [editName, setEditName] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [regionsResponse, citiesResponse] = await Promise.all([getAllRegion(), getAllCity()]);

            if (regionsResponse.success && citiesResponse.success) {
                setRegions(regionsResponse.data);
                setCities(citiesResponse.data);
            } else {
                console.error("Failed to fetch data", {
                    regionsSuccess: regionsResponse.success,
                    citiesSuccess: citiesResponse.success,
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleAddRegion = async () => {
        if (!newName.trim()) return;

        try {
            const response = await addRegion(newName);

            if (response.success) {
                await fetchData();
                setNewName("");
                setShowAddRegionModal(false);
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error adding region:", error);
            toast.error("Có lỗi xảy ra khi thêm vùng");
        }
    };

    const handleAddCity = async () => {
        if (!newName.trim() || !selectedRegion) return;

        try {
            const response = await addCity(selectedRegion.region_id, newName);

            if (response.success) {
                await fetchData();
                setNewName("");
                setShowAddCityModal(false);
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error adding city:", error);
            toast.error("Có lỗi xảy ra khi thêm thành phố");
        }
    };

    const handleUpdateRegion = async () => {
        if (!editName.trim() || !editingRegion) return;

        try {
            const response = await updateRegion(editingRegion.region_id, editName);

            if (response.success) {
                await fetchData();
                setEditName("");
                setEditingRegion(null);
                setShowEditRegionModal(false);
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error updating region:", error);
            toast.error("Có lỗi xảy ra khi cập nhật vùng");
        }
    };

    const handleUpdateCity = async () => {
        if (!editName.trim() || !editingCity) return;

        try {
            const response = await updateCity(editingCity.city_id, editingCity.region_id, editName);

            if (response.success) {
                await fetchData();
                setEditName("");
                setEditingCity(null);
                setShowEditCityModal(false);
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error updating city:", error);
            toast.error("Có lỗi xảy ra khi cập nhật thành phố");
        }
    };

    const handleDeleteRegion = async (region_id) => {
        handleShowConfirm("Xác nhận xóa", "Bạn có chắc chắn muốn xóa vùng này và tất cả thành phố thuộc vùng này?", async () => {
            try {
                const response = await deleteRegion(region_id);

                if (response.success) {
                    await fetchData();
                    toast.success(response.message);
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                console.error("Error deleting region:", error);
                toast.error("Có lỗi xảy ra khi xóa vùng");
            }
        });
    };

    const handleDeleteCity = async (city_id) => {
        handleShowConfirm("Xác nhận xóa", "Bạn có chắc chắn muốn xóa thành phố này?", async () => {
            try {
                const response = await deleteCity(city_id);

                if (response.success) {
                    await fetchData();
                    toast.success(response.message);
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                console.error("Error deleting city:", error);
                toast.error("Có lỗi xảy ra khi xóa thành phố");
            }
        });
    };

    const toggleRegion = (regionId) => {
        setExpandedRegions((prev) => ({
            ...prev,
            [regionId]: !prev[regionId],
        }));
    };

    const handleShowConfirm = (title, message, callback) => {
        setConfirmData({ title, message, callback });
        setShowConfirmModal(true);
    };

    const Modal = ({ isOpen, onClose, title, onSubmit, children, submitText = "Thêm" }) => {
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
                                {submitText}
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
                    <h2 className="text-xl font-semibold">Quản lý vùng miền</h2>
                    <button
                        onClick={() => setShowAddRegionModal(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                    >
                        <span>+</span>
                        Thêm vùng
                    </button>
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <span className="text-gray-500">Đang tải...</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {regions.map((region) => (
                                <div key={region.region_id} className="border rounded-lg">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                        onClick={() => toggleRegion(region.region_id)}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {expandedRegions[region.region_id] ? (
                                                <IoMdArrowDropdown className="text-xl" />
                                            ) : (
                                                <IoMdArrowDropright className="text-xl" />
                                            )}
                                            <span className="font-medium">{region.region_name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="p-2 hover:bg-gray-100 rounded-md"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedRegion(region);
                                                    setShowAddCityModal(true);
                                                }}
                                            >
                                                +
                                            </button>
                                            {/* Edit Button */}
                                            <button
                                                className="p-2 hover:bg-gray-100 rounded-md text-blue-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingRegion(region);
                                                    setEditName(region.region_name);
                                                    setShowEditRegionModal(true);
                                                }}
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
                                            {/* Delete Button */}
                                            <button
                                                className="p-2 hover:bg-gray-100 rounded-md text-red-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteRegion(region.region_id);
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
                                    {expandedRegions[region.region_id] && (
                                        <div className="border-t bg-gray-50">
                                            {cities
                                                .filter((city) => city.region_id === region.region_id)
                                                .map((city) => (
                                                    <div key={city.city_id} className="flex items-center justify-between p-3 pl-8 hover:bg-gray-100">
                                                        <span>{city.city_name}</span>
                                                        <div className="flex items-center space-x-2">
                                                            {/* Edit Button */}
                                                            <button
                                                                className="p-2 hover:bg-gray-100 rounded-md text-blue-500"
                                                                onClick={() => {
                                                                    setEditingCity(city);
                                                                    setEditName(city.city_name);
                                                                    setShowEditCityModal(true);
                                                                }}
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
                                                            {/* Delete Button */}
                                                            <button
                                                                className="p-2 hover:bg-gray-100 rounded-md text-red-500"
                                                                onClick={() => handleDeleteCity(city.city_id)}
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
                isOpen={showAddRegionModal}
                onClose={() => {
                    setShowAddRegionModal(false);
                    setNewName("");
                }}
                title="Thêm vùng mới"
                onSubmit={handleAddRegion}
            >
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nhập tên vùng"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                />
            </Modal>

            <Modal
                isOpen={showAddCityModal}
                onClose={() => {
                    setShowAddCityModal(false);
                    setNewName("");
                    setSelectedRegion(null);
                }}
                title={`Thêm thành phố cho ${selectedRegion?.region_name || ""}`}
                onSubmit={handleAddCity}
            >
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nhập tên thành phố"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                />
            </Modal>

            <Modal
                isOpen={showEditRegionModal}
                onClose={() => {
                    setShowEditRegionModal(false);
                    setEditName("");
                    setEditingRegion(null);
                }}
                title="Chỉnh sửa vùng"
                onSubmit={handleUpdateRegion}
                submitText="Cập nhật"
            >
                <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nhập tên vùng mới"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                />
            </Modal>

            <Modal
                isOpen={showEditCityModal}
                onClose={() => {
                    setShowEditCityModal(false);
                    setEditName("");
                    setEditingCity(null);
                }}
                title="Chỉnh sửa thành phố"
                onSubmit={handleUpdateCity}
                submitText="Cập nhật"
            >
                <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nhập tên thành phố mới"
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
