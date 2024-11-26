"use client";
import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";
import { acceptOrder, getOrderByFarm, getOrderDetail, rejectOrder } from "@/util/adminAPI";
import { getProductByID, getUserByID } from "@/util/userAPI";

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [customerNames, setCustomerNames] = useState({});
    const [sortOrder, setSortOrder] = useState('newest');
    const [statusFilter, setStatusFilter] = useState('all');
    const ordersPerPage = 5;

    // Pagination logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    // Order metrics
    const metrics = [
        { 
            title: "Tổng đơn hàng", 
            value: orders.length, 
            bgColor: "bg-blue-100", 
            textColor: "text-blue-600" 
        },
        { 
            title: "Đơn hàng đã duyệt", 
            value: orders.filter((o) => o.order_status === 'accept').length, 
            bgColor: "bg-green-100", 
            textColor: "text-green-600" 
        },
        { 
            title: "Đơn hàng chưa duyệt", 
            value: orders.filter((o) => o.order_status === 'waiting').length, 
            bgColor: "bg-yellow-100", 
            textColor: "text-yellow-600" 
        },
        { 
            title: "Đơn hàng từ chối", 
            value: orders.filter((o) => o.order_status === 'reject').length, 
            bgColor: "bg-red-100", 
            textColor: "text-red-600" 
        },
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        // Apply sorting and filtering
        let result = [...orders];
        
        // Sort orders
        if (sortOrder === 'newest') {
            result.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
        } else if (sortOrder === 'oldest') {
            result.sort((a, b) => new Date(a.order_date) - new Date(b.order_date));
        }

        // Filter by status
        if (statusFilter !== 'all') {
            result = result.filter(order => order.order_status === statusFilter);
        }

        setFilteredOrders(result);
        setCurrentPage(1);
    }, [orders, sortOrder, statusFilter]);

    useEffect(() => {
        // Fetch customer names whenever orders change
        const fetchCustomerNames = async () => {
            const newCustomerNames = {};
            for (const order of orders) {
                try {
                    if (!customerNames[order.customer_id]) {
                        const response = await getUserByID(order.customer_id);
                        
                        if (response.success) {
                            newCustomerNames[order.customer_id] = response.data.name;
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching customer name for ID ${order.customer_id}:`, error);
                    newCustomerNames[order.customer_id] = "Unknown";
                }
            }
            setCustomerNames(prev => ({ ...prev, ...newCustomerNames }));
        };

        fetchCustomerNames();
    }, [orders]);

    const fetchOrders = async () => {
        try {
            const userInfo = getCookie("user_info");
            if (!userInfo) return;
            const userData = JSON.parse(userInfo);
            const response = await getOrderByFarm(userData.user_id);

            if (response.success) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Lỗi khi tải danh sách đơn hàng");
        }
    };

    const handleAccept = async (orderId) => {
        try {
            const response = await acceptOrder(orderId);
            if (response.success) {
                toast.success("Đã chấp nhận đơn hàng");
                await fetchOrders();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error accepting order:", error);
            toast.error("Lỗi khi chấp nhận đơn hàng");
        }
    };

    const handleReject = async () => {
        try {
            if (!selectedOrder || !rejectionReason.trim()) {
                toast.error("Vui lòng nhập lý do từ chối");
                return;
            }

            const response = await rejectOrder(selectedOrder.order_id, rejectionReason);
            if (response.success) {
                toast.success("Đã từ chối đơn hàng");
                setShowRejectModal(false);
                setRejectionReason("");
                setSelectedOrder(null);
                await fetchOrders();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error rejecting order:", error);
            toast.error("Lỗi khi từ chối đơn hàng");
        }
    };

    const openRejectModal = (order) => {
        setSelectedOrder(order);
        setShowRejectModal(true);
    };

    const getStatusColor = (status) => {
        const statusColors = {
            pending: "bg-blue-100 text-blue-800",
            waiting: "bg-yellow-100 text-yellow-800",
            accept: "bg-green-100 text-green-800",
            reject: "bg-red-100 text-red-800"
        };
        return statusColors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusText = (status) => {
        const statusTexts = {
            pending: "Sản phẩm chờ thanh toán",
            waiting: "Đang chờ duyệt",
            accept: "Đã chấp nhận",
            reject: "Đã từ chối"
        };
        return statusTexts[status] || status;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Đơn Hàng</h1>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {metrics.map((metric, index) => (
                    <div 
                        key={index} 
                        className={`${metric.bgColor} p-4 rounded-lg shadow-md`}
                    >
                        <div className={`${metric.textColor} text-2xl font-bold`}>
                            {metric.value}
                        </div>
                        <div className="text-sm text-gray-600">{metric.title}</div>
                    </div>
                ))}
            </div>

            {/* Filters and Sorting */}
            <div className="flex justify-between mb-4">
                <div className="flex space-x-2">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="all">Tất cả đơn hàng</option>
                        <option value="waiting">Chưa duyệt</option>
                        <option value="accept">Đã duyệt</option>
                        <option value="reject">Từ chối</option>
                    </select>

                    <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mã đơn hàng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Khách hàng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tổng tiền
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ngày đặt
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentOrders.map((order) => (
                            <tr key={order.order_id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">#{order.order_id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {customerNames[order.customer_id] || "Đang tải..."}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{formatPrice(order.total_amount)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {new Date(order.order_date).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                                        {getStatusText(order.order_status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-normal">
                                    {order.order_status === 'waiting' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAccept(order.order_id)}
                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                                            >
                                                Chấp nhận
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(order)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    )}
                                    {order.order_status === 'reject' && (
                                        <div className="text-sm text-gray-500 whitespace-pre-line">
                                            Lý do: {order.rejection_reason}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center space-x-2 mt-4">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                        currentPage === 1 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    Trước
                </button>
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 rounded ${
                            currentPage === index + 1
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                        currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    Sau
                </button>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Lý do từ chối đơn hàng</h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md mb-4"
                            rows="4"
                            placeholder="Nhập lý do từ chối..."
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason("");
                                    setSelectedOrder(null);
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;