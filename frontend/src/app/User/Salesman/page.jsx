"use client"
import { getAllSalesman, getCityById } from '@/util/adminAPI'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SalesmanList() {
  const router = useRouter()
  const [salesmen, setSalesmen] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cityNames, setCityNames] = useState({})

  const fetchSalesmen = async () => {
    try {
      const response = await getAllSalesman();
      
      if (response.success) {
        setSalesmen(response.data);
        
        const cityIds = [...new Set(response.data.map(s => s.city_id).filter(Boolean))]
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
        setError(response.message)
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalesmen()
  }, [])

  const handleSalesmanClick = (salesman) => {
    router.push(`/User/Salesman/${salesman.user_id}`)
  }



  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="text-xl">Đang tải...</div>
  </div>

  if (error) return <div className="min-h-screen flex items-center justify-center">
    <div className="text-red-500">{error}</div>
  </div>

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Danh sách người bán</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salesmen.map((salesman) => (
          <div 
            key={salesman.user_id}
            onClick={() => handleSalesmanClick(salesman)}
            className="cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="relative h-48 w-full">
              <Image
                src={`data:image/jpeg;base64,${salesman.farm_banner}`}
                alt={salesman.farm_name}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            
            <div className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative h-16 w-16">
                  <Image
                    src={`data:image/jpeg;base64,${salesman.farm_logo}`}
                    alt="Logo"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{salesman.farm_name}</h2>
                  <p className="text-gray-600">{salesman.name}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center">
                  <span className="w-20 font-medium">Địa chỉ:</span>
                  <span>{salesman.farm_address}</span>
                </p>
                <p className="flex items-center">
                  <span className="w-20 font-medium">Điện thoại:</span>
                  <span>{salesman.farm_phone}</span>
                </p>
                <p className="flex items-center">
                  <span className="w-20 font-medium">Thành phố:</span>
                  <span>{cityNames[salesman.city_id] || 'Đang tải...'}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {salesmen.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Không có người bán nào
        </div>
      )}
    </div>
  )
}