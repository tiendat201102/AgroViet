"use client"
import { addBulkPromotion, addPromotion, getProductsByUser } from '@/util/userAPI';
import { getCookie } from 'cookies-next';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/userComponents/loadingSpinner';


// const LoadingSpinner = () => (
//   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//   </div>
// );

const AddPromotion = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    promotion_name: '',
    promotion_description: '',
    promotion_value: '',
    promotion_start_date: '',
    promotion_end_date: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const userInfo = getCookie("user_info");
      if (!userInfo) return;
      const userData = JSON.parse(userInfo);
      
      const response = await getProductsByUser(userData.user_id);
      if (response.success) {
        setProducts(response.data);
      } else {
        toast.error('Không thể tải danh sách sản phẩm');
      }
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userInfo = getCookie("user_info");
      if (!userInfo) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }
      const userData = JSON.parse(userInfo);

      if (selectedProduct) {
        const response = await addPromotion(
          selectedProduct,
          formData.promotion_name,
          formData.promotion_description,
          formData.promotion_value,
          formData.promotion_start_date,
          formData.promotion_end_date
        );

        if (response.success) {
          toast.success('Thêm khuyến mãi thành công');
          resetForm();
        } else {
          toast.error(response.message || 'Có lỗi xảy ra khi thêm khuyến mãi');
        }
      } else {
        const response = await addBulkPromotion(
          userData.user_id,
          formData.promotion_name,
          formData.promotion_description,
          formData.promotion_value,
          formData.promotion_start_date,
          formData.promotion_end_date
        );

        if (response.success) {
          toast.success('Thêm khuyến mãi hàng loạt thành công');
          resetForm();
        } else {
          toast.error(response.message || 'Có lỗi xảy ra khi thêm khuyến mãi hàng loạt');
        }
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thêm khuyến mãi');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      promotion_name: '',
      promotion_description: '',
      promotion_value: '',
      promotion_start_date: '',
      promotion_end_date: ''
    });
    setSelectedProduct('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading && <LoadingSpinner />}
      
      <h1 className="text-3xl font-bold mb-8">Thêm khuyến mãi mới</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tên khuyến mãi
            </label>
            <input
              type="text"
              name="promotion_name"
              value={formData.promotion_name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mô tả
            </label>
            <textarea
              name="promotion_description"
              value={formData.promotion_description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Giá trị khuyến mãi (%)
            </label>
            <input
              type="number"
              name="promotion_value"
              value={formData.promotion_value}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              max="100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Ngày bắt đầu
              </label>
              <input
                type="datetime-local"
                name="promotion_start_date"
                value={formData.promotion_start_date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Ngày kết thúc
              </label>
              <input
                type="datetime-local"
                name="promotion_end_date"
                value={formData.promotion_end_date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Sản phẩm (để trống nếu muốn áp dụng cho tất cả sản phẩm)
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Tất cả sản phẩm</option>
              {products.map(product => (
                <option key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Thêm khuyến mãi'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPromotion;