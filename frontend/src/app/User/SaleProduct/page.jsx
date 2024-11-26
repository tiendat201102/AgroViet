'use client';
import { getAllCategoryParent } from '@/util/adminAPI';
import { getAllProduct, getProductByParentCategory, getProductFavouriteById, addProductFavourite, deleteProductFavourite } from '@/util/userAPI';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ProductListing = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user,setUser] = useState("");
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 10000000]); // VND
  const [itemsPerPage] = useState(12);
  const [favorites, setFavorites] = useState([]);
  const [harvestDateSort, setHarvestDateSort] = useState('none');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndPaginateProducts();
  }, [searchTerm, currentPage, priceRange, products, harvestDateSort]);

  const filterAndPaginateProducts = () => {
    let filtered = [...products];

    filtered = filtered.filter(product => !product.is_hidden);

    // Thanh search
    if (searchTerm) {
        filtered = filtered.filter(product =>
            product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Thanh giá
    filtered = filtered.filter(product =>
        product.product_price >= priceRange[0] && product.product_price <= priceRange[1]
    );

    // Select box ngày thu hoạch
    if (harvestDateSort !== 'none') {
        filtered.sort((a, b) => {
            const dateA = new Date(a.product_harvest_date);
            const dateB = new Date(b.product_harvest_date);
            return harvestDateSort === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }

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

  useEffect (() => {
    try {
      const res = getCookie("user_info");
      const userData = JSON.parse(res);
      
      if(userData) {
        setUser(userData);
      }
      
    } catch (error) {
      console.log("Lỗi về không lấy được người dùng đăng nhập : ", error);
      
    }
  }, [])

  const fetchProducts = async (categoryId = '') => {
    setLoading(true);
    try {
      let response;
      if (categoryId) {
        response = await getProductByParentCategory(categoryId);
      } else {
        response = await getAllProduct();
      }
      // console.log("check phat >>> ", response.data);
      
      if (response.success) {
        setProducts(response.data);
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

  const handlePriceRangeChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = Number(value);
    setPriceRange(newRange);
    setCurrentPage(1);
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
        console.log('Đã thêm vào danh sách yêu thích');
      } else {
        toast.info(response.message);
      }
    } catch (error) {
      setError('Lỗi khi thêm sản phẩm vào danh sách yêu thích >>> ', error);
    }
  };

  const pageCount = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Danh sách sản phẩm</h1>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Category filter */}
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

            {/* Price sort */}
            <select 
              className="px-4 py-2 border rounded-lg"
              value={sortOrder}
              onChange={handleSort}
            >
              <option value="none">Sắp xếp theo giá</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>

            {/* Harvest date sort */}
            <select 
              className="px-4 py-2 border rounded-lg"
              value={harvestDateSort}
              onChange={(e) => setHarvestDateSort(e.target.value)}
            >
              <option value="none">Ngày thu hoạch</option>
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>

          </div>

          {/* Price range slider */}
          {/* <div className="space-y-2">
            <p className="text-sm text-gray-600">Khoảng giá</p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10000000"
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="10000000"
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceRange[0])}</span>
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceRange[1])}</span>
            </div>
          </div> */}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(user.user_id ,product.product_id);
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
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.product_price)}
                  </span>
                  <button 
                    onClick={() => handleProductClick(product.product_id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                    ? 'bg-blue-500 text-white' 
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
        {/* {!loading && displayedProducts.length === 0 && !error && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy sản phẩm nào
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ProductListing;