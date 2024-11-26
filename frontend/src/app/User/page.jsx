"use client"
import { getAllSalesman, getCityById } from '@/util/adminAPI'
import { getAllProduct } from "@/util/userAPI";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from 'next/image';
import ReactPaginate from "react-paginate";

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [currentProductPage, setCurrentProductPage] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [salesmen, setSalesmen] = useState([]);
  const [displaySalesmen, setDisplaySalesmen] = useState([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cityNames, setCityNames] = useState({})

  const productsPerPage = 10;
  const salesmenPerPage = 4;

  const fetchSalesmen = async () => {
    try {
      const response = await getAllSalesman();
      
      if (response.success) {
        setSalesmen(response.data);
        
        // Randomly select 4 salesmen
        const randomSalesmen = response.data
          .sort(() => 0.5 - Math.random())
          .slice(0, salesmenPerPage);
        setDisplaySalesmen(randomSalesmen);
        
        const cityIds = [...new Set(randomSalesmen.map(s => s.city_id).filter(Boolean))]
        const cityNamesMap = {}
        
        await Promise.all(
          cityIds.map(async (cityId) => {
            const cityResponse = await getCityById(cityId)
            if (cityResponse.success) {
              cityNamesMap[cityId] = cityResponse.data.city_name
            }
          })
        )
        
        setCityNames(cityNamesMap)
      } else {
        console.log(response.message)
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await getAllProduct();
      if (response.success === true) {
        // Randomly select 8 products
        const randomProducts = response.data
          .sort(() => 0.5 - Math.random())
          .slice(0, productsPerPage);
        
        setProducts(response.data);
        setDisplayProducts(randomProducts);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleProductPageClick = (event) => {
    const selectedPage = event.selected;
    setCurrentProductPage(selectedPage);
    
    const startIndex = selectedPage * productsPerPage;
    const selectedProducts = products
      .sort(() => 0.5 - Math.random())
      .slice(startIndex, startIndex + productsPerPage);
    
    setDisplayProducts(selectedProducts);
  };

  useEffect(() => {
    fetchProducts();
    fetchSalesmen();
  }, []);

  const bannerSlides = [
    "/banner1.jpg",
    "/banner3.jpg",
    "/banner2.webp",
    // "/banner4.jpg",
    // "/banner5.jpeg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === bannerSlides.length - 1 ? 0 : prevSlide + 1
      );
    }, 10000); 

    return () => clearInterval(timer);
  }, []);

  // Hàm chuyển đến slide trước
  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? bannerSlides.length - 1 : prev - 1
    );
  };

  // Hàm chuyển đến slide kế tiếp
  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === bannerSlides.length - 1 ? 0 : prev + 1
    );
  };

  const featuredStores = [
    { name: "Hạt Điều Cennuts", rating: 5 },
    { name: "CAFÉ STORE", rating: 4 },
    { name: "Hải Măn - Đặc sản Thiên Nhiên", rating: 5 },
    { name: "Ben Yogurt", rating: 4 },
    { name: "Vita Granola", rating: 5 },
    { name: "Thái Trang OrgaTea", rating: 4 },
  ];

  const categories = [
    "Xuất", "Thanh long", "Mãng cầu", "Ổi", "Dâu tằm", "Nhãn lồng"
  ];

  const brands = [
    "Trà Mộng Chờ Sen Nghìn", "Lê Bách Tráng Cổ Sáu", "Sasin Tráng Sen", "Beauty Food"
  ];

  const handleProductClick = (productId) => {
    router.push(`/User/SaleProduct/${productId}`);
  };

  const handleViewProducts = () => {
    router.push('/User/SaleProduct');
  };

  const handleSalesmanClick = (salesman) => {
    router.push(`/User/Salesman/${salesman.user_id}`)
  }

  const handleViewAllSalesmen = () => {
    router.push('/User/Salesman');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Carousel */}
      <div className="relative h-[480px] overflow-hidden">
        <div className="object-cover ">
          <Image
            src={bannerSlides[currentSlide]}
            alt={`Banner ${currentSlide + 1}`}
            fill
            className="w-full h-full object-fill "
          />
          {/* <div className="absolute inset-0 flex items-center justify-center text-white text-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">ĐỒNG HÀNH</h1>
              <h2 className="text-3xl font-bold mb-4">CHUYỂN ĐỔI SỐ</h2>
              <p className="text-xl">cùng nông dân Việt</p>
            </div>
          </div> */}
          
          {/* Navigation Buttons */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index ? 'bg-white w-4' : 'bg-white bg-opacity-50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Thực Phẩm</h2>
          <button 
            className="text-red-500"
            onClick={handleViewProducts}
          >
            Xem tất cả
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {displayProducts.map((product) => (
            <div
              key={product.product_id}
              onClick={() => handleProductClick(product.product_id)}
              className="bg-white shadow-sm rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={`data:image/jpeg;base64,${product.product_image}`}
                  alt={product.product_name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm line-clamp-2">{product.product_name}</h3>
                <p className="text-red-500 font-bold mt-2">{product.product_price.toLocaleString()} VNĐ</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <ReactPaginate
            breakLabel="..."
            nextLabel="Tiếp >"
            onPageChange={handleProductPageClick}
            pageRangeDisplayed={5}
            pageCount={Math.ceil(products.length / productsPerPage)}
            previousLabel="< Trước"
            renderOnZeroPageCount={null}
            className="flex items-center justify-center gap-2"
            pageClassName="px-3 py-1 border rounded hover:bg-gray-100"
            previousClassName="px-3 py-1 border rounded hover:bg-gray-100"
            nextClassName="px-3 py-1 border rounded hover:bg-gray-100"
            activeClassName="bg-blue-500 text-white"
            disabledClassName="opacity-50 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Featured Stores Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Người bán nổi bật</h2>
          <button 
            className="text-red-500"
            onClick={handleViewAllSalesmen}
          >
            Xem tất cả
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-12">{error}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displaySalesmen.map((salesman) => (
              <div 
                key={salesman.user_id}
                onClick={() => handleSalesmanClick(salesman)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={`data:image/jpeg;base64,${salesman.farm_banner}`}
                    alt={salesman.farm_name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                
                <div className="p-3">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="relative h-12 w-12">
                      <Image
                        src={`data:image/jpeg;base64,${salesman.farm_logo}`}
                        alt="Logo"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{salesman.farm_name}</h3>
                      <p className="text-xs text-gray-600">{salesman.name}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Thành phố:</span> {cityNames[salesman.city_id] || 'Đang tải...'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}