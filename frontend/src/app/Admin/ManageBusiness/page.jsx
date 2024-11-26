"use client";
import React, { useState, useEffect } from "react";
import { getAllFarmer, approveFarmer, rejectFarmer, getCityById, getRegionById } from "../../../util/adminAPI";
import { FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from "react-paginate";
import Modal from "react-modal";


// Modal.setAppElement('ManageBusinessPage');

export default function ManageBusinessPage() {
    const [businesses, setBusinesses] = useState([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [itemOffset, setItemOffset] = useState(0);
    const [filter, setFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [cityNames, setCityNames] = useState({});
    const [regionNames, setRegionNames] = useState({});

    const itemsPerPage = 10;


    const fetchLocationNames = async (businesses) => {
        try {
            const regionPromises = businesses.map(async (business) => {
                if (business.region_id) {
                    const regionResponse = await getRegionById(business.region_id);
                    if (regionResponse.success) {
                        return {
                            id: business.region_id,
                            name: regionResponse.data.region_name
                        };
                    }
                }
                return null;
            });
    
            const cityPromises = businesses.map(async (business) => {
                if (business.city_id) {
                    const cityResponse = await getCityById(business.city_id);
                    console.log("cityResponse > ", cityResponse);

                    if (cityResponse.success) {
                        return {
                            id: business.city_id,
                            name: cityResponse.data.city_name
                        };
                    }
                }
                return null;
            });
    
            const [regionResults, cityResults] = await Promise.all([
                Promise.all(regionPromises),
                Promise.all(cityPromises)
            ]);
            // console.log("regionResults > ", regionResults);
            // console.log("cityResults > ", cityResults);
            
    
            const newRegionNames = {};
            const newCityNames = {};
    
            regionResults.forEach(result => {
                if (result) {
                    newRegionNames[result.id] = result.name;
                }
            });
    
            cityResults.forEach(result => {
                if (result) {
                    newCityNames[result.id] = result.name;
                }
            });
    
            setRegionNames(newRegionNames);
            setCityNames(newCityNames);
        } catch (error) {
            console.error("Error fetching location names:", error);
            toast.error("Đã xảy ra lỗi khi tải thông tin địa điểm");
        }
    };



    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const result = await getAllFarmer();
                console.log("Businesses data:", result);
                
                if (result.success && result.data) {
                    setBusinesses(result.data);
                    setFilteredBusinesses(result.data);
                    setPageCount(Math.ceil(result.data.length / itemsPerPage));
                    await fetchLocationNames(result.data)
                }
            } catch (error) {
                console.error("Error fetching businesses:", error);
                toast.error("Đã xảy ra lỗi khi tải danh sách doanh nghiệp");
            }
        };

        fetchBusinesses();
    }, []);

    useEffect(() => {
        handleFilterAndSearch();
    }, [filter, searchTerm, businesses]);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % filteredBusinesses.length;
        setItemOffset(newOffset);
    };

    const handleApprove = async (email) => {
        try {
            const res = await approveFarmer(email);
            if (res.success) {
                toast.success("Phê duyệt doanh nghiệp thành công");
                setBusinesses(prevBusinesses =>
                    prevBusinesses.map(business =>
                        business.email === email
                            ? { ...business, application_status: 'approved' }
                            : business
                    )
                );
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error("Error approving business:", error);
            toast.error("Đã xảy ra lỗi khi phê duyệt doanh nghiệp");
        }
    };

    const handleReject = async (email) => {
        try {
            const res = await rejectFarmer(email, rejectionReason);
            if (res.success) {
                toast.success("Từ chối doanh nghiệp thành công");
                setBusinesses(prevBusinesses =>
                    prevBusinesses.map(business =>
                        business.email === email
                            ? { ...business, application_status: 'rejected' }
                            : business
                    )
                );
                setIsRejectModalOpen(false);
                setRejectionReason("");
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error("Error rejecting business:", error);
            toast.error("Đã xảy ra lỗi khi từ chối doanh nghiệp");
        }
    };

    const handleFilterAndSearch = () => {
        let filtered = businesses;

        if (filter) {
            filtered = businesses.filter((business) => business.application_status === filter);
        }

        if (searchTerm) {
            filtered = filtered.filter((business) =>
                business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                business.farm_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredBusinesses(filtered);
        setPageCount(Math.ceil(filtered.length / itemsPerPage));
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Đang chờ duyệt';
            case 'approved':
                return 'Đã duyệt';
            case 'rejected':
                return 'Đã từ chối';
            default:
                return 'Không xác định';
        }
    };

    const renderImage = (base64String, alt) => {
        if (!base64String) return <p className="text-gray-500 italic">Chưa có ảnh</p>;
        return (
            <img 
                src={`data:image/jpeg;base64,${base64String}`}
                alt={alt}
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            />
        );
    };

    const currentBusinesses = filteredBusinesses.slice(itemOffset, itemOffset + itemsPerPage);

    const handleOpenModal = (business) => {
        setSelectedBusiness(business);
        // console.log("check cai nao >>>> ", business);
        
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBusiness(null);
    };

    const tableRows = currentBusinesses.map((business, index) => (
        <tr key={business._id} className="bg-white hover:bg-gray-50">
            <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">{itemOffset + index + 1}</td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200">
                <button onClick={() => handleOpenModal(business)} className="text-blue-600 hover:underline">
                    {business.name}
                </button>
            </td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200">{business.farm_name}</td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200">{cityNames[business.city_id] || "Chưa có thông tin"}</td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200">{business.farm_phone}</td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusStyle(business.application_status)}`}>
                    {getStatusText(business.application_status)}
                </span>
            </td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">
                {business.application_status === 'pending' && (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => handleApprove(business.email)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Duyệt
                        </button>
                        <button
                            onClick={() => {
                                setSelectedBusiness(business);
                                setIsRejectModalOpen(true);
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Từ chối
                        </button>
                    </div>
                )}
            </td>
        </tr>
    ));

    if (currentBusinesses.length < itemsPerPage) {
        const emptyRows = Array.from({ length: itemsPerPage - currentBusinesses.length }, (_, index) => (
            <tr key={`empty-${index}`} className="bg-white">
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">{itemOffset + currentBusinesses.length + index + 1}</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
            </tr>
        ));
        tableRows.push(...emptyRows);
    }

    return (
        <div className="container mx-auto p-2 flex flex-col min-h-screen">
            <div className="flex items-center justify-between mb-4">
                <div className="relative w-1/4">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <select
                        className="px-4 py-2 border rounded"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        <option value="pending">Đang chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                    </select>
                </div>
            </div>

            <div className="flex-grow">
                <table className="min-w-full bg-white border border-gray-200 table-fixed">
                    <thead>
                        <tr>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">STT</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Họ và tên</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Tên trang trại</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Địa chỉ</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Số điện thoại</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Trạng thái</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>{tableRows}</tbody>
                </table>

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
            </div>

            {/* Modal Chi tiết doanh nghiệp */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleCloseModal}
                className="p-6 bg-white border rounded-lg w-2/3 mx-auto mt-20 max-h-[80vh] overflow-y-auto"
            >
                <h2 className="text-xl font-bold mb-6 border-b pb-2">Thông tin chi tiết doanh nghiệp</h2>
                {selectedBusiness && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>
                            <p><strong>Họ và tên:</strong> {selectedBusiness.name}</p>
                            <p><strong>Email:</strong> {selectedBusiness.email}</p>
                            <p><strong>Tên trang trại:</strong> {selectedBusiness.farm_name}</p>
                            <p><strong>Số điện thoại:</strong> {selectedBusiness.farm_phone}</p>
                            <p><strong>Vùng miền:</strong> {regionNames[selectedBusiness.region] || "Chưa có thông tin"}</p>
                            <p><strong>Thành phố:</strong> {cityNames[selectedBusiness.city]|| "Chưa có thông tin"}</p>
                            {/* <p><strong>Địa chỉ chi tiết:</strong> {selectedBusiness.farm_address}</p> */}
                            <p><strong>Trạng thái:</strong> {getStatusText(selectedBusiness.application_status)}</p>
                            {selectedBusiness.rejection_reason && (
                                <p><strong>Lý do từ chối:</strong> {selectedBusiness.rejection_reason}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Hình ảnh & Tài liệu</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium mb-2">Ảnh đại diện của cửa hàng:</p>
                                    {renderImage(selectedBusiness.farm_logo, "Logo của cửa hàng")}
                                </div>
                                <div>
                                    <p className="font-medium mb-2">Biểu ngữ của cửa hàng:</p>
                                    {renderImage(selectedBusiness.farm_banner, "Biểu ngữ của cửa hàng")}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex justify-end mt-6 pt-4 border-t">
                    <button
                        onClick={handleCloseModal}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </Modal>

            {/* Modal Từ chối doanh nghiệp */}
            <Modal
                isOpen={isRejectModalOpen}
                onRequestClose={() => setIsRejectModalOpen(false)}
                className="p-6 bg-white border rounded-lg w-1/3 mx-auto mt-20"
            >
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Lý do từ chối</h2>
                <textarea
                    className="w-full p-2 border rounded-lg mb-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Nhập lý do từ chối..."
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setIsRejectModalOpen(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => handleReject(selectedBusiness?.email)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        disabled={!rejectionReason.trim()}
                    >
                        Xác nhận
                    </button>
                </div>
            </Modal>

            {/* <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            /> */}
        </div>
    );
}