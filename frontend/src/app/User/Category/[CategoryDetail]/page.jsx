"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getProductByChildCategory, getProductByParentCategory } from '@/util/userAPI';

const CategoryDetail = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const parentId = searchParams.get('parent');
    const childId = searchParams.get('child');
    const params = useParams();
    const [originalProducts, setOriginalProducts] = useState([]); // Thêm state mới để lưu data gốc
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState('all');
    const [view, setView] = useState('grid');
    const [error, setError] = useState('');
    const categorySlug = params.CategoryDetail;
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let response;
                
                if (parentId) {
                    response = await getProductByParentCategory(parentId);
                } else if (childId) {
                    response = await getProductByChildCategory(childId);
                } else {
                    console.log('No category ID provided');
                }

                if (response.success) {
                    setOriginalProducts(response.data); // Lưu data gốc
                    setProducts(response.data); // Khởi tạo products với data gốc
                } else {
                    setError(response.message);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Có lỗi xảy ra khi tải sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        if (parentId || childId) {
            fetchProducts();
        }
    }, [parentId, childId]);

    // Xử lý sắp xếp và lọc sản phẩm
    useEffect(() => {
        let filteredProducts = [...originalProducts];
        
        // Lọc theo khoảng giá
        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            filteredProducts = filteredProducts.filter(product => {
                if (max) {
                    return product.product_price >= min && product.product_price < max;
                } else {
                    return product.product_price >= min;
                }
            });
        }

        // Sắp xếp sau khi lọc
        switch (sortBy) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.product_price - b.product_price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.product_price - a.product_price);
                break;
            default:
                break;
        }

        setProducts(filteredProducts);
    }, [sortBy, priceRange, originalProducts]);

    const handleProductClick = (productId) => {
        router.push(`/User/SaleProduct/${productId}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
                <a href="/" className="hover:text-blue-500">Trang chủ</a>
                <span>/</span>
                <a href="/categories" className="hover:text-blue-500">Danh mục</a>
                <span>/</span>
                <span className="text-gray-900 font-medium">{categorySlug}</span>
            </div>

            {/* Filters and Sort */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 pr-8 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {/* <option value="newest">Mới nhất</option> */}
                                <option value="price-asc">Giá tăng dần</option>
                                <option value="price-desc">Giá giảm dần</option>
                                {/* <option value="popular">Phổ biến nhất</option> */}
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <div className="relative">
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 pr-8 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tất cả giá</option>
                                <option value="0-100000">Dưới 100,000₫</option>
                                <option value="100000-200000">100,000₫ - 200,000₫</option>
                                <option value="200000-500000">200,000₫ - 500,000₫</option>
                                <option value="500000">Trên 500,000₫</option>
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-lg ${view === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg ${view === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Grid/List */}
            {products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    Không tìm thấy sản phẩm nào trong danh mục này
                </div>
            ) : (
                <div className={`grid ${view === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
                    {products.map((product) => (
                        <div
                            key={product.product_id}
                            className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer
                                ${view === 'list' ? 'flex space-x-4' : 'flex flex-col'}`}
                            onClick={() => handleProductClick(product.product_id)}
                        >
                            <div className={`relative ${view === 'list' ? 'w-48 h-48' : 'w-full pt-[100%]'}`}>
                                <img
                                    src={`data:image/jpeg;base64,${product.product_image}`}
                                    alt={product.product_name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                {product.is_rescue && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                                        Cần giải cứu
                                    </div>
                                )}
                            </div>

                            <div className={`p-4 flex flex-col ${view === 'list' ? 'flex-1' : ''}`}>
                                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                                    {product.product_name}
                                </h3>
                                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                                    {product.product_description}
                                </h3>

                                <div className="mt-auto">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="text-red-600 font-semibold">
                                            {formatPrice(product.product_price)}
                                        </span>
                                    </div>

                                    <button 
                                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Chi tiết
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

export default CategoryDetail;