import React, { useEffect } from 'react';
import { BiSolidHide } from "react-icons/bi";

const ProductRow = ({ product, handleEditClick, handleToggleVisibility, handleDeleteClick }) => {
    // Automatically hide product when inventory is 0
    useEffect(() => {
        if (product.product_inventory === 0 && !product.is_hidden) {
            handleToggleVisibility(product.product_id);
        }
    }, [product.product_inventory]);

    return (
        <tr 
            key={product.product_id}
            className={`${product.is_hidden ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}
        >
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center">
                    <div className="w-20 h-20 flex-shrink-0">
                        <img
                            className="w-20 h-20 object-cover"
                            src={product.product_image ? `data:image/png;base64,${product.product_image}` : "/placeholder.png"}
                            alt={product.product_name}
                        />
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm font-medium text-gray-900">
                    {product.product_name}
                    {product.product_inventory === 0 && (
                        <span className="ml-2 text-xs text-red-500">(Hết hàng)</span>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-gray-900">{product.product_price.toLocaleString()} đ</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className={`text-sm ${product.product_inventory === 0 ? 'text-red-500 font-medium' : 'text-gray-900'}`}>
                    {product.product_inventory}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <button
                    onClick={() => handleToggleVisibility(product.product_id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.is_hidden || product.product_inventory === 0
                            ? "bg-red-100 text-red-800 hover:bg-red-200"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    }`}
                >
                    {product.is_hidden || product.product_inventory === 0 ? "Bị ẩn" : "Đang hiển thị"}
                </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <span
                    className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        product.is_rescue ? "bg-green-100 text-black-500" : "bg-blue-100 text-blue-800"
                    }`}
                >
                    {product.is_rescue ? "Sản phẩm cứu trợ" : "Sản phẩm bình thường"}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => handleEditClick(product.product_id)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>

                    <button
                        onClick={() => handleToggleVisibility(product.product_id)}
                        className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-50"
                    >
                        <BiSolidHide />
                    </button>

                    <button
                        onClick={() => handleDeleteClick(product.product_id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ProductRow;