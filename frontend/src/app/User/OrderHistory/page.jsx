"use client";
import React, { useState, useEffect } from "react";
import { getOrderByCustomer, getOrderDetail } from "@/util/adminAPI";
import { getProductByID } from "@/util/userAPI";
import { getCookie } from "cookies-next";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user_info = getCookie("user_info");
      if (!user_info) {
        setError("Vui lòng đăng nhập để xem đơn hàng");
        setLoading(false);
        return;
      }

      const user = JSON.parse(user_info);
      const response = await getOrderByCustomer(user.user_id);

      if (!response.data || !Array.isArray(response.data)) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const ordersWithDetails = await Promise.all(
        response.data.map(async (order) => {
          const detailsResponse = await getOrderDetail(order.order_id);
          
          if (!detailsResponse || !detailsResponse.success) {
            return { ...order, details: [] };
          }

          const detailsWithProducts = await Promise.all(
            detailsResponse.data.map(async (detail) => {
              const productResponse = await getProductByID(detail.product_id);
              return {
                ...detail,
                product_info: productResponse?.success ? productResponse.data : null,
              };
            })
          );

          return {
            ...order,
            details: detailsWithProducts,
          };
        })
      );

      setOrders(ordersWithDetails);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'waiting':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'reject':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ thanh toán';
      case 'waiting':
        return 'Chờ xử lý';
      case 'completed':
        return 'Đã hoàn thành';
      case 'reject':
        return 'Đã bị từ chối';
      default:
        return 'Không xác định';
    }
  };

  const calculateTotal = (details) => {
    return details.reduce((sum, item) => {
      if (!item?.product_info) return sum;
      return sum + (item.product_info.product_price * item.product_quantity);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của bạn</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-lg shadow p-6">
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">Đơn hàng #{order.order_id}</h2>
                    <p className="text-sm text-gray-500">
                      Ngày đặt: {new Date(order.order_date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full ${getStatusColor(order.order_status)} bg-opacity-10`}>
                    {getStatusText(order.order_status)}
                  </div>
                </div>
                {order.order_status === 'reject' && order.rejection_reason && (
                  <div className="mt-2 p-3 bg-red-50 rounded-md">
                    <p className="text-red-600 text-sm">
                      <span className="font-medium">Lý do từ chối: </span>
                      {order.rejection_reason}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {order.details.map((item) => (
                  item.product_info && (
                    <div key={item.order_detail_id} className="flex items-center gap-4 py-2">
                      <img
                        src={`data:image/jpeg;base64,${item.product_info.product_image}`}
                        alt={item.product_info.product_name}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.product_info.product_name}</h3>
                        <p className="text-sm text-gray-500">Số lượng: {item.product_quantity}</p>
                        <p className="text-blue-600 font-medium mt-1">
                          {item.product_info.product_price.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {(item.product_info.product_price * item.product_quantity).toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                  )
                ))}
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tổng tiền:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {calculateTotal(order.details).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderPage;