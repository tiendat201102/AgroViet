'use client';
import { getAllCategoryParent } from '@/util/adminAPI';
import { getAllProduct, getProductByParentCategory, getProductFavouriteById, addProductFavourite } from '@/util/userAPI';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const RescueProductListing = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState("");
  
  // States for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [favorites, setFavorites] = useState([]);
  const [dateSort, setDateSort] = useState('none');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndPaginateProducts();
  }, [searchTerm, currentPage, products, dateSort]);

  const filterAndPaginateProducts = () => {
    let filtered = [...products];

    // Chỉ lấy sản phẩm giải cứu và không bị ẩn
    filtered = filtered.filter(product => product.is_rescue && !product.is_hidden);

    // Áp dụng filter tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sắp xếp theo ngày kết thúc giải cứu
    if (dateSort !== 'none') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.rescue_end_date);
        const dateB = new Date(b.rescue_end_date);
        return dateSort === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setDisplayedProducts(filtered.slice(indexOfFirstItem, indexOfLastItem));
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategoryParent();
      if (response.success) {
        setCategories(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Lỗi khi tải danh mục');
    }
  };

  useEffect(() => {
    try {
      const res = getCookie("user_info");
      const userData = JSON.parse(res);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.log("Lỗi về không lấy được người dùng đăng nhập : ", error);
    }
  }, []);

  const fetchProducts = async (categoryId = '') => {
    setLoading(true);
    try {
      let response;
      if (categoryId) {
        response = await getProductByParentCategory(categoryId);
      } else {
        response = await getAllProduct();
      }
      
      if (response.success) {
        // Lọc chỉ lấy sản phẩm giải cứu
        const rescueProducts = response.data.filter(product => product.is_rescue);
        setProducts(rescueProducts);
        setError('');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    fetchProducts(categoryId);
  };

  const handleSort = (e) => {
    const order = e.target.value;
    setSortOrder(order);
    let sortedProducts = [...products];
    
    switch (order) {
      case 'asc':
        sortedProducts.sort((a, b) => a.product_price - b.product_price);
        break;
      case 'desc':
        sortedProducts.sort((a, b) => b.product_price - a.product_price);
        break;
      default:
        break;
    }
    
    setProducts(sortedProducts);
  };

  const handleProductClick = (productId) => {
    router.push(`/User/SaleProduct/${productId}`);
  };

  const toggleFavorite = async (userId, productId) => {
    try {
      if (!userId) {
        toast.error('Vui lòng đăng nhập để thêm sản phẩm yêu thích');
        return;
      }

      const response = await addProductFavourite(userId, productId);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.info(response.message);
      }
    } catch (error) {
      setError('Lỗi khi thêm sản phẩm vào danh sách yêu thích');
    }
  };

  const getRemainingTime = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days} ngày ${hours} giờ`;
  };

  const pageCount = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">Sản Phẩm Cần Giải Cứu</h1>
          <p className="text-gray-600 mt-2">Hãy chung tay hỗ trợ nông dân bằng cách mua sản phẩm giải cứu</p>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm giải cứu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            
            <select 
              className="px-4 py-2 border rounded-lg"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.category_parent_id} value={category.category_parent_id}>
                  {category.category_parent_name}
                </option>
              ))}
            </select>

            <select 
              className="px-4 py-2 border rounded-lg"
              value={sortOrder}
              onChange={handleSort}
            >
              <option value="none">Sắp xếp theo giá</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>

            <select 
              className="px-4 py-2 border rounded-lg"
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
            >
              <option value="none">Thời gian còn lại</option>
              <option value="asc">Ít thời gian nhất</option>
              <option value="desc">Nhiều thời gian nhất</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <div 
              key={product.product_id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img 
                  onClick={() => handleProductClick(product.product_id)}
                  src={`data:image/jpeg;base64,${product.product_image}`} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                  Cần giải cứu
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(user.user_id, product.product_id);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
                >
                  <svg 
                    className={`w-6 h-6 ${favorites.includes(product.product_id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">{product.product_name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{product.product_description}</p>
                <div className="text-sm text-red-600">
                  Thời gian còn lại: {getRemainingTime(product.rescue_end_date)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-red-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.product_price)}
                  </span>
                  <button 
                    onClick={() => handleProductClick(product.product_id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Trước
            </button>
            {[...Array(pageCount)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 border rounded-lg ${
                  currentPage === i + 1 
                    ? 'bg-red-500 text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
              disabled={currentPage === pageCount}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Sau
            </button>
          </div>
        )}

        {/* No products found */}
        {!loading && displayedProducts.length === 0 && !error && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy sản phẩm giải cứu nào
          </div>
        )}
      </div>
    </div>
  );
};

export default RescueProductListing;