"use client";
import React, { useState, useEffect } from "react";
import { getAllPaymentMethod, getOrderByCustomer, getOrderDetail, getOrderTotal, payment, updateOrderStatus } from "@/util/adminAPI";
import { getProductByID, getPromotionsByProduct } from "@/util/userAPI";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';

const ShoppingCart = () => {
  const router = useRouter();
  const [customerID, setCustomerID] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [orderTotals, setOrderTotals] = useState({});

  useEffect(() => {
    fetchOrders();
    fetchPaymentMethods ();
  }, []);


  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user_info = getCookie("user_info");
      if (!user_info) {
        setError("Vui lòng đăng nhập để xem giỏ hàng");
        setLoading(false);
        return;
      }

      const user = JSON.parse(user_info);
      setCustomerID(user.user_id);

      const response = await getOrderByCustomer(user.user_id);

      if (!response.data || !Array.isArray(response.data)) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const ordersWithDetails = await Promise.all(
        response.data.map(async (order) => {
          try {
            const detailsResponse = await getOrderDetail(order.order_id);
            
            if (!detailsResponse || !detailsResponse.success) {
              console.error("Error fetching order details:", detailsResponse?.message);
              return {
                ...order,
                details: [],
              };
            }

            const detailsWithProducts = await Promise.all(
              (detailsResponse.data || []).map(async (detail) => {
                try {
                  const productResponse = await getProductByID(detail.product_id);
                  let promotionResponse = null;
                  
                  if (productResponse && productResponse.success) {
                    promotionResponse = await getPromotionsByProduct(detail.product_id);
                  }
                  
                  if (!productResponse || !productResponse.success) {
                    console.error("Error fetching product:", productResponse?.message);
                    return {
                      ...detail,
                      product_info: null,
                      promotion_info: null,
                    };
                  }

                  return {
                    ...detail,
                    product_info: productResponse.data,
                    promotion_info: promotionResponse?.success ? promotionResponse.data : null,
                  };
                } catch (err) {
                  console.error("Error processing product details:", err);
                  return {
                    ...detail,
                    product_info: null,
                    promotion_info: null,
                  };
                }
              })
            );

            return {
              ...order,
              details: detailsWithProducts,
            };
          } catch (err) {
            console.error("Error processing order details:", err);
            return {
              ...order,
              details: [],
            };
          }
        })
      );

      setOrders(ordersWithDetails);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Có lỗi xảy ra khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await getAllPaymentMethod();
      if (response.success) {
        setPaymentMethods(response.data);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Không thể tải phương thức thanh toán");
    }
  };

  const fetchOrderTotal = async (orderId) => {
    try {
      const response = await getOrderTotal(orderId);
      if (response.success) {
        setOrderTotals(prev => ({
          ...prev,
          [orderId]: response.data.total
        }));
      }
    } catch (error) {
      console.error("Error fetching order total:", error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await ServiceDeleteOrder(orderId);
      if (response.success) {
        toast.success("Xóa đơn hàng thành công");
        fetchOrders(); // Refresh orders list
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Không thể xóa đơn hàng");
    }
  };

  const calculateDiscountedPrice = (originalPrice, promotionValue) => {
    if (!promotionValue) return originalPrice;
    return originalPrice * (1 - promotionValue / 100);
  };

  const calculateTotal = (details) => {
    if (!Array.isArray(details) || !details) {
      return 0;
    }
    
    return details.reduce((sum, item) => {
      if (!item || !item.product_info) {
        return sum;
      }
      const originalPrice = item.product_info.product_price || 0;
      const promotionValue = item?.promotion_info?.promotion_value || 0;
      const discountedPrice = calculateDiscountedPrice(originalPrice, promotionValue);
      const quantity = item.product_quantity || 0;
      return sum + (discountedPrice * quantity);
    }, 0);
  };

  const handleCheckboxChange = (orderId) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(orderId)) {
        newSelected.delete(orderId);
      } else {
        newSelected.add(orderId);
      }
      return newSelected;
    });
  };

  // Array.from(selectedItems).map(orderId => updateOrderStatus(orderId))
  const handleCheckout = async () => {
    try {
      if (selectedItems.size === 0) {
        toast.error("Vui lòng chọn ít nhất một đơn hàng để thanh toán");
        return;
      }

      if (!selectedPaymentMethod) {
        toast.error("Vui lòng chọn phương thức thanh toán");
        return;
      }
      
      setProcessingCheckout(true);
      
      const paymentResults = await Promise.all(
        Array.from(selectedItems).map(orderId => 
          payment(orderId, selectedPaymentMethod)
        )
      );
      console.log("paymentResults > ", paymentResults);
      
      
      const successfulPayment = paymentResults.find(result => 
        result?.momo?.resultCode === 0 && result?.momo?.payUrl
      );
  
      if (successfulPayment) {
        toast.success("Đang chuyển đến trang thanh toán");
        window.location.href = successfulPayment.momo.payUrl;
      } else {
        toast.success("Thanh toán bằng tiền mặt thành công");
        router.push("/User")
      }
  
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xử lý thanh toán");
    } finally {
      setProcessingCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Giỏ hàng trống</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <label key={method.payment_method_id} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.payment_method_id}
                    checked={selectedPaymentMethod === method.payment_method_id}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="form-radio h-4 w-4 text-green-600"
                  />
                  <span>{method.method_name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {orders
          .filter(order => order.order_status === 'pending')
          .map((order) => (
            <div key={order.order_id} className="bg-white rounded-lg shadow-md p-6">
                <div className="border-b pb-4 mb-4 flex justify-between items-center">
              <div>
                  <h2 className="text-lg font-semibold">Đơn hàng #{order.order_id}</h2>
                  <p className="text-sm text-gray-500">
                    Ngày đặt: {new Date(order.order_date).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-sm mt-1">
                    Trạng thái: {" "}
                    <span className={`font-medium ${
                      order.order_status === 'pending' ? 'text-yellow-600' :
                      order.order_status === 'waiting' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {order.order_status === 'pending' ? 'Chờ thanh toán' :
                       order.order_status === 'waiting' ? 'Chờ xử lý' :
                       'Đã xử lý'}
                    </span>
                  </p>
                  <button
                    onClick={() => handleDeleteOrder(order.order_id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Xóa đơn hàng
                  </button>
                </div>
                
                {/* Cải thiện phần checkbox */}
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(order.order_id)}
                      onChange={() => handleCheckboxChange(order.order_id)}
                      disabled={order.order_status !== 'pending'}
                      className="form-checkbox h-5 w-5 text-green-600 rounded border-gray-300 focus:ring-green-500 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className={`text-sm ${
                      order.order_status === 'pending' 
                        ? 'text-gray-700' 
                        : 'text-gray-400'
                    }`}>
                      {order.order_status === 'pending' 
                        ? 'Chọn để thanh toán'
                        : 'Không thể chọn'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                {order.details.map((item) =>
                  item.product_info && (
                    <div
                      key={item.order_detail_id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={`data:image/jpeg;base64,${item.product_info.product_image}`}
                          alt={item.product_info.product_name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-medium">
                            {item.product_info.product_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Số lượng: {item.product_quantity}
                          </p>
                          <div className="flex items-center gap-2">
                            {item.promotion_info ? (
                              <>
                                <span className="line-through text-gray-400">
                                  {item.product_info.product_price.toLocaleString("vi-VN")}đ
                                </span>
                                <span className="text-green-600 font-semibold">
                                  {calculateDiscountedPrice(
                                    item.product_info.product_price,
                                    item.promotion_info.promotion_value
                                  ).toLocaleString("vi-VN")}đ
                                </span>
                                <span className="text-red-500 text-sm">
                                  (-{item.promotion_info.promotion_value}%)
                                </span>
                              </>
                            ) : (
                              <span className="text-green-600">
                                {item.product_info.product_price.toLocaleString("vi-VN")}đ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Tổng tiền:</span>
                    <span className="text-xl font-bold text-green-600">
                      {orderTotals[order.order_id]?.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>
            ))}

          {/* Phần thanh toán */}
          <div className="sticky bottom-0 bg-white shadow-lg border-t p-4 mt-8">
            <div className="container mx-auto flex justify-between items-center">
              <div className="text-gray-600">
                <div>Đã chọn {selectedItems.size} đơn hàng để thanh toán</div>
                {!selectedPaymentMethod && (
                  <div className="text-red-500 text-sm">
                    *Vui lòng chọn phương thức thanh toán
                  </div>
                )}
              </div>
              <button 
                className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  selectedItems.size > 0 && !processingCheckout && selectedPaymentMethod
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handleCheckout}
                disabled={selectedItems.size === 0 || processingCheckout || !selectedPaymentMethod}
              >
                {processingCheckout ? (
                  <>
                    <span>Đang xử lý</span>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </>
                ) : (
                  <>
                    <span>Thanh toán</span>
                    <span>({selectedItems.size} đơn hàng)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;