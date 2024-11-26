"use client"
import { getProductsByUser, getUserByID } from '@/util/userAPI'
import { getCityById } from '@/util/adminAPI'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function SalesmanDetail() {
  const params = useParams()
  const router = useRouter()
  const userId = params.SalesmanDetail
  
  const [salesman, setSalesman] = useState(null)
  const [cityName, setCityName] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // States for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [displayedProducts, setDisplayedProducts] = useState([])
  const [sortOrder, setSortOrder] = useState('none')

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return
      
      try {
        // Fetch salesman info
        const response = await getUserByID(userId)
        if (response.success) {
          setSalesman(response.data)
          
          if (response.data.city_id) {
            const cityResponse = await getCityById(response.data.city_id)
            if (cityResponse.success) {
              setCityName(cityResponse.data.city_name)
            }
          }

          // Fetch salesman's products
          const productsResponse = await getProductsByUser(userId)
          if (productsResponse.success) {
            setProducts(productsResponse.data)
          }
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  useEffect(() => {
    filterAndPaginateProducts()
  }, [searchTerm, currentPage, products, sortOrder])

  const filterAndPaginateProducts = () => {
    let filtered = [...products]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply price sorting
    if (sortOrder !== 'none') {
      filtered.sort((a, b) => {
        return sortOrder === 'asc' 
          ? a.product_price - b.product_price 
          : b.product_price - a.product_price
      })
    }

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    setDisplayedProducts(filtered.slice(indexOfFirstItem, indexOfLastItem))
  }

  const handleProductClick = (productId) => {
    router.push(`/User/SaleProduct/${productId}`)
  }

  const handleSort = (e) => {
    setSortOrder(e.target.value)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="text-xl">Đang tải...</div>
  </div>

  if (error) return <div className="min-h-screen flex items-center justify-center">
    <div className="text-red-500">{error}</div>
  </div>

  if (!salesman) return <div className="min-h-screen flex items-center justify-center">
    <div className="text-xl">Không tìm thấy thông tin người bán</div>
  </div>

  const pageCount = Math.ceil(products.length / itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        href="/User/Salesman" 
        className="inline-block mb-8 text-blue-600 hover:text-blue-800"
      >
        ← Quay lại danh sách
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="relative h-64 w-full">
          <Image
            src={`data:image/jpeg;base64,${salesman.farm_banner}`}
            alt="Farm banner"
            fill
            className="object-cover"
          />
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative h-24 w-24">
              <Image
                src={`data:image/jpeg;base64,${salesman.farm_logo}`}
                alt="Farm logo"
                fill
                className="rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{salesman.farm_name}</h1>
              <p className="text-xl text-gray-600">{salesman.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Thông tin liên hệ</h2>
              <p className="flex items-center space-x-2">
                <span className="font-medium w-32">Email:</span>
                <span>{salesman.email}</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="font-medium w-32">Số điện thoại:</span>
                <span>{salesman.phone}</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="font-medium w-32">Điện thoại farm:</span>
                <span>{salesman.farm_phone}</span>
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Địa chỉ farm</h2>
              <p className="flex items-center space-x-2">
                <span className="font-medium w-32">Địa chỉ:</span>
                <span>{salesman.farm_address}</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="font-medium w-32">Thành phố:</span>
                <span>{cityName || 'Đang tải...'}</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="font-medium w-32">Khu vực:</span>
                <span>{salesman.region}</span>
              </p>
            </div>
          </div>

          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Chi tiết về farm</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">
                {salesman.farm_detail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Sản Phẩm Của Farm</h2>
        </div>
        
        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select 
            className="px-4 py-2 border rounded-lg"
            value={sortOrder}
            onChange={handleSort}
          >
            <option value="none">Sắp xếp theo giá</option>
            <option value="asc">Giá tăng dần</option>
            <option value="desc">Giá giảm dần</option>
          </select>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <div 
              key={product.product_id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleProductClick(product.product_id)}
            >
              <div className="relative">
                <img 
                  src={`data:image/jpeg;base64,${product.product_image}`} 
                  alt={product.product_name}
                  className="w-full h-48 object-cover"
                />
                {product.is_rescue && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                    Cần giải cứu
                  </div>
                )}
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
        {!loading && displayedProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy sản phẩm nào
          </div>
        )}
      </div>
    </div>
  )
}