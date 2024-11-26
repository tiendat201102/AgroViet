"use client"
import { createOrder, createOrderDetail, getAllPaymentMethod, getPaymentMethodById } from '@/util/adminAPI';
import { getProductByID, getPromotionsByProduct, getReviewByProduct, getShippingFeeByVendorAndCity, GetUserAPI } from '@/util/userAPI';
import { getCookie } from 'cookies-next';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';

const ProductDetail = () => {
  const params = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingFee, setShippingFee] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [discountedPrice, setDiscountedPrice] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewUsers, setReviewUsers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const itemsPerPage = 3;

  const similarProducts = [
    {
      id: 1,
      name: "Khô gà lá chanh",
      price: "65,000 VND",
      image: "/api/placeholder/200/200"
    },
    {
      id: 2,
      name: "Khô gà cay",
      price: "70,000 VND",
      image: "/api/placeholder/200/200"
    },
    {
      id: 3,
      name: "Khô gà sả ớt",
      price: "68,000 VND",
      image: "/api/placeholder/200/200"
    }
  ];

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const fetchReviews = async () => {
    try {
      const reviewResponse = await getReviewByProduct(params.slug);
      console.log("reviewResponse > ",reviewResponse);
      
      if (reviewResponse.success) {
        const reviewsData = reviewResponse.data;
        setReviews(reviewsData);
        // Đặt itemsPerPage là 2 để hiển thị 2 reviews mỗi trang
        const calculatedPageCount = Math.ceil(reviewsData.length / itemsPerPage);
        setPageCount(calculatedPageCount);
        setTotalReviews(reviewsData.length);
        
        // Calculate average rating
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(reviewsData.length > 0 ? (totalRating / reviewsData.length).toFixed(1) : 0);

        // Fetch user data for all reviews
        const userIds = [...new Set(reviewsData.map(review => review.user_id))];
        const userPromises = userIds.map(async (userId) => {
          try {
            const userResponse = await GetUserAPI(userId);
            return userResponse;
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return { success: false };
          }
        });
        
        const userResponses = await Promise.all(userPromises);
        
        const userMap = {};
        userResponses.forEach(userResponse => {
          if (userResponse.success) {
            userMap[userResponse.data.user_id] = userResponse.data;
          }
        });
        
        setReviewUsers(userMap);
      } else {
        console.error('Failed to fetch reviews:', reviewResponse.message);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const getCurrentPageReviews = () => {
    const offset = currentPage * itemsPerPage;
    return reviews.slice(offset, offset + itemsPerPage);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // useEffect(() => {
  //   const fetchProductDetail = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await getProductByID(params.slug);
        
  //       if (response.success) {
  //         setProduct(response.data);
  //         setError(null);

  //         await fetchReviews();
  //       } else {
  //         setError(response.message || 'Không thể tải thông tin sản phẩm');
  //       }
  //     } catch (error) {
  //       setError('Có lỗi xảy ra khi tải thông tin sản phẩm');
  //       console.error('Error fetching product:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (params.slug) {
  //     fetchProductDetail();
  //   }
  // }, [params.slug]);


  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await getProductByID(params.slug);
        console.log("response > ", response);
        
        if (response.success) {
          setProduct(response.data);
          setError(null);

          // Fetch promotions
          const promotionsResponse = await getPromotionsByProduct(params.slug);
          
          if (promotionsResponse.success) {
            setPromotions(promotionsResponse.data);
            
            console.log("promotionsResponse > ", promotionsResponse);
            const discounted = response.data.product_price * (1 - promotionsResponse.data.product_value/100);
            setDiscountedPrice(discounted);
            // const gia = response.product_price * promotionsResponse.product_value / 100
            console.log("discounted > ", discounted);
          }

          await fetchReviews();
        } else {
          setError(response.message || 'Không thể tải thông tin sản phẩm');
        }
      } catch (error) {
        setError('Có lỗi xảy ra khi tải thông tin sản phẩm');
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchProductDetail();
    }
  }, [params.slug]);


  const fetchShippingFee = async () => {
    try {
      const userInfoStr = getCookie('user_info');
      if (!userInfoStr) {
        toast.error('Vui lòng đăng nhập để tiếp tục');
        return;
      }
  
      const userInfo = JSON.parse(userInfoStr);
      const userEmail = await GetUserAPI(userInfo.email);
      
      if (!userEmail.success) {
        toast.error('Không thể lấy thông tin người dùng');
        return;
      }
  
      const vendor = await getProductByID(params.slug);
      console.log("vendor.data.farm_id > ",vendor.data.farm_id);
      console.log("userEmail.data > ", userEmail.data.city_id);
      
      
      if (vendor.success) {
        const shippingResponse = await getShippingFeeByVendorAndCity(
          vendor.data.farm_id, 
          userEmail.data.city_id
        );
        console.log("shippingResponse > ", shippingResponse);
        
        
        if (shippingResponse.success) {
          setShippingFee(shippingResponse.data);
          return shippingResponse.data;
        } else {
          toast.error('Vui lòng cập nhật địa chỉ giao hàng ở trang cá nhân.');
          return null;
        }
      } else {
        toast.error('Không thể lấy thông tin người bán');
        return null;
      }
    } catch (error) {
      console.error('Error fetching shipping fee:', error);
      toast.error('Lỗi khi tính phí vận chuyển');
      return null;
    }
  };

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      
      const userInfoStr = getCookie('user_info');
      if (!userInfoStr) {
        toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
        return;
      }

      const shippingFeeData = await fetchShippingFee();
      if (!shippingFeeData) {
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      const productDetails = await getProductByID(params.slug);
      
      if (!productDetails.success) {
        toast.error('Không thể lấy thông tin sản phẩm');
        return;
      }

      // const defaultPaymentMethodId = "6736afd3666338c0208f33ca";
      
      // const defaultPaymentMethodId = "6743ff2097df4fd44c40f9e5"; //momo

      
      console.log("user_id",userInfo);
      console.log("productDetails.data.farm_id > ",productDetails.data.farm_id);
      // console.log(defaultPaymentMethodId);
      console.log("shippingFeeData.shipping_fee_id > ",shippingFeeData.shipping_fee_id);
      
      const orderResponse  = await createOrder(
        userInfo.user_id,
        productDetails.data.farm_id,
        // defaultPaymentMethodId,
        shippingFeeData.shipping_fee_id,
        Number(productDetails.data.product_price * quantity) + Number(shippingFeeData.shipping_cost)
      );

     if (orderResponse.success) {
        // Create order detail
        const orderDetailResponse = await createOrderDetail(
          orderResponse.data.order_id,
          productDetails.data.product_id,
          quantity,
          productDetails.data.product_price
        );

        if (orderDetailResponse.success) {
          toast.success('Thêm vào giỏ hàng thành công');
        } else {
          toast.error('Thêm chi tiết đơn hàng thất bại');
        }
      } else {
        toast.error(orderResponse.message || 'Thêm vào giỏ hàng thất bại');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Không tìm thấy sản phẩm</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-2/5">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`data:image/jpeg;base64,${product.product_image}`}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="w-full md:w-3/5">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {product.product_name}
              </h1>
              
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
                <span className="text-gray-500 ml-2">({reviews.length} đánh giá)</span>
              </div>

              {/* <div className="text-2xl font-bold text-red-500 mb-6">
                {product.product_price}
              </div> */}

<div className="mb-6">
          {discountedPrice ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-red-500">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountedPrice)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.product_price)}
                </span>
              </div>
              <div className="text-sm text-green-600 mt-1">
                {promotions.map((promo, index) => (
                  <div key={index} className="bg-green-50 text-green-700 px-2 py-1 rounded mt-1">
                    Giảm {promo.discount_percent}% từ {new Date(promo.promotion_start_date).toLocaleDateString('vi-VN')} 
                    đến {new Date(promo.promotion_end_date).toLocaleDateString('vi-VN')}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-2xl font-bold text-gray-800">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.product_price)}
            </div>
          )}
        </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-600">Số lượng:</span>
                <div className="flex items-center border rounded">
                  <button
                    className="px-3 py-1 hover:bg-gray-100"
                    onClick={decreaseQuantity}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-x">{quantity}</span>
                  <button
                    className="px-3 py-1 hover:bg-gray-100"
                    onClick={increaseQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  onClick={handleAddToCart}
                  disabled={loading}
                >
                  Thêm vào giỏ hàng
                </button>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Mua ngay
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-bold mb-4">Mô tả sản phẩm</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600">
                {product.product_description}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Đánh giá sản phẩm</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-yellow-500 mr-2">{averageRating}</span>
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <span className="text-gray-500">({totalReviews} đánh giá)</span>
        </div>
      </div>

      <div className="space-y-6">
        {getCurrentPageReviews().map((review) => (
          <div key={review.review_id} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-4">
              {reviewUsers[review.user_id]?.image ? (
                <img
                  src={reviewUsers[review.user_id].image}
                  alt={reviewUsers[review.user_id]?.name || 'User'}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <img
                  src="/defaultUserImage.webp"
                  alt="Default user"
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {reviewUsers[review.user_id]?.name || 'Người dùng ẩn danh'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.review_date)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="mt-2 text-gray-600">
                  {review.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(
        <ReactPaginate
          breakLabel="..."
          nextLabel="Tiếp >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="< Trước"
          renderOnZeroPageCount={null}
          className="mt-6 flex items-center justify-center gap-2"
          pageClassName="px-3 py-1 border rounded hover:bg-gray-100"
          previousClassName="px-3 py-1 border rounded hover:bg-gray-100"
          nextClassName="px-3 py-1 border rounded hover:bg-gray-100"
          activeClassName="bg-blue-500 text-white hover:bg-blue-600"
          disabledClassName="opacity-50 cursor-not-allowed"
        />
      )}
    </div>

          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-bold mb-4">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="aspect-square mb-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
                  <p className="text-red-500 font-bold">{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;