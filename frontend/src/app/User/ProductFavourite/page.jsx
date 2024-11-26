"use client"
import { getProductFavouriteById, deleteProductFavourite, getProductByID } from '@/util/userAPI';
import { getCookie } from 'cookies-next';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const FavoriteProductsPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const userInfoCookie = getCookie("user_info");
      if (!userInfoCookie) {
        setError("Vui lòng đăng nhập để xem sản phẩm yêu thích");
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userInfoCookie);
      
      const favoritesResponse = await getProductFavouriteById(userData.user_id);
      
      if (favoritesResponse.success && favoritesResponse.data) {
        const productsWithDetails = await Promise.all(
          favoritesResponse.data.map(async (favorite) => {
            try {
              const productResponse = await getProductByID(favorite.product_id);
              if (productResponse.success) {
                // console.log("check loi: >>> ",productResponse);
                return {
                  favorite_id: favorite.product_favourite_id,
                  product_id: favorite.product_id,
                  product: productResponse.data
                };
              }
              
              return null;
            } catch (err) {
              console.error("Error fetching product details:", err);
              return null;
            }
          })
        );

        const validProducts = productsWithDetails.filter(item => item !== null);
        setFavorites(validProducts);
      } else {
        setError(favoritesResponse.message || "Không thể lấy danh sách sản phẩm yêu thích");
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Không thể tải danh sách sản phẩm yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (item) => {
    try {
      const userInfoCookie = getCookie("user_info");
      if (!userInfoCookie) {
        toast.error("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      const userData = JSON.parse(userInfoCookie);
      
      const result = await deleteProductFavourite(userData.user_id, item.product_id);
      
      if (result.success) {
        setFavorites(prevFavorites => 
          prevFavorites.filter(fav => fav.favorite_id !== item.favorite_id)
        );
        toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích");
      } else {
        toast.error(result.message || "Không thể xóa sản phẩm");
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
      toast.error("Không thể xóa sản phẩm khỏi danh sách yêu thích");
    }
  };

  const handlePurchase = (product_id) => {
    toast.info(`Chuyển đến trang thanh toán cho sản phẩm ${product_id}`);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sản phẩm yêu thích</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Chưa có sản phẩm nào trong danh sách yêu thích
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((item) => (
            <div 
              key={item.favorite_id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img 
                  src={`data:image/jpeg;base64,${item.product.product_image}`}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{item.product.product_name}</h3>
                <p className="text-red-600 text-xl font-bold mb-2">
                  {item.product.product_price?.toLocaleString('vi-VN')} đ
                </p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.product.description}
                </p>

                <div className="flex justify-between gap-2">
                  <button 
                    onClick={() => handleRemoveFavorite(item)}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors duration-200"
                  >
                    <svg 
                      className="w-5 h-5 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Xóa
                  </button>
                  
                  <button 
                    onClick={() => handlePurchase(item.product.product_id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    <svg 
                      className="w-5 h-5 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteProductsPage;