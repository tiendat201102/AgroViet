"use client";
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaSearch } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import Modal from "react-modal";
import { deleteProduct, getAllProduct,getAllProductIncludeIsHidden } from "@/util/userAPI";
import { toast } from "react-toastify";
import { FaTrashCan } from "react-icons/fa6";
import { getAllCategoryChild, getAllCategoryParent } from "@/util/adminAPI";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, productName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
                <p className="mb-6">Bạn có chắc chắn muốn xóa sản phẩm "{productName}" không?</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                        Hủy
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                        Xác nhận xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ManageProductPage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [itemOffset, setItemOffset] = useState(0);
    const [filter, setFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [parentCategories, setParentCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [selectedParentCategory, setSelectedParentCategory] = useState("");
    const [selectedChildCategory, setSelectedChildCategory] = useState("");
    const [filteredChildCategories, setFilteredChildCategories] = useState([]);

    const itemsPerPage = 10;

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [productsRes, parentRes, childRes] = await Promise.all([getAllProductIncludeIsHidden(), getAllCategoryParent(), getAllCategoryChild()]);
                console.log();
                
                if (productsRes.success) {
                    setProducts(productsRes.data);
                    setFilteredProducts(productsRes.data);
                    setPageCount(Math.ceil(productsRes.data.length / itemsPerPage));
                }

                if (parentRes.success) {
                    setParentCategories(parentRes.data);
                }

                if (childRes.success) {
                    setChildCategories(childRes.data);
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast.error("Không thể tải dữ liệu ban đầu");
            }
        };

        fetchInitialData();
    }, []);

    //fetch dữ liệu danh mục cha và con
    useEffect(() => {
        const filteredChildCategories = selectedParentCategory
            ? childCategories.filter((child) => child.category_parent_id === selectedParentCategory)
            : [];
        setFilteredChildCategories(filteredChildCategories);
    }, [selectedParentCategory, childCategories]);

    //fetch sản phẩm
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getAllProduct();
                console.log(response.data);

                if (response.success) {
                    setProducts(response.data);
                    setFilteredProducts(response.data);
                    setPageCount(Math.ceil(response.data.length / itemsPerPage));
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Không thể tải danh sách sản phẩm");
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        handleFilterAndSearch();
    }, [filter, searchTerm, selectedParentCategory, selectedChildCategory, products]);

    const handlePageClick = ({ selected }) => setItemOffset(selected * itemsPerPage);

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            const response = await deleteProduct(productToDelete.product_id, productToDelete.farm_id);
            if (response.success) {
                const updatedProducts = products.filter((p) => p.product_id !== productToDelete.product_id);
                setProducts(updatedProducts);
                setFilteredProducts(updatedProducts);
                toast.success("Xóa sản phẩm thành công");
            } else {
                toast.error("Xóa sản phẩm thất bại");
            }
        } catch {
            toast.error("Đã xảy ra lỗi khi xóa sản phẩm");
        } finally {
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        }
    };

    const handleFilterAndSearch = () => {
        let filtered = [...products];

        // Apply visibility filter
        if (filter) {
            filtered = filtered.filter((p) => (filter === "hidden" ? p.is_hidden : !p.is_hidden));
        }

        // Apply category filters
        if (selectedParentCategory) {
            filtered = filtered.filter((p) => p.product_category_parent.toString() === selectedParentCategory.toString());
        }
        if (selectedChildCategory) {
            filtered = filtered.filter((p) => p.product_category.toString() === selectedChildCategory.toString());
        }

        // Apply search term
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (p) => p.product_name.toLowerCase().includes(lowerSearch) || p.product_description.toLowerCase().includes(lowerSearch)
            );
        }

        setFilteredProducts(filtered);
        setPageCount(Math.ceil(filtered.length / itemsPerPage));
        setItemOffset(0); // Reset to first page when filters change
    };

    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const currentProducts = filteredProducts.slice(itemOffset, itemOffset + itemsPerPage);

    //table
    const tableRows = currentProducts.map((product, index) => (
        <tr key={product.product_id} className={product.is_hidden ? "bg-gray-100" : "bg-white"}>
            <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">{itemOffset + index + 1}</td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200">
                <button onClick={() => handleOpenModal(product)} className="text-left w-full">
                    {product.product_name}
                </button>
            </td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200 text-right">{product.product_unit}</td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200 text-right">{formatPrice(product.product_price)}</td>

            <td className="px-2 py-1.5 border-r border-b border-gray-200">
                <div className="flex justify-center items-center h-12">
                    {product.product_image ? (
                        <img
                            src={`data:image/jpeg;base64,${product.product_image}`}
                            alt={product.product_name}
                            className="max-h-12 max-w-full object-contain"
                        />
                    ) : (
                        <span className="text-gray-400">Không có ảnh</span>
                    )}
                </div>
            </td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">{product.product_inventory}</td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">
                <button className="flex items-center justify-center w-full h-full">
                    {product.is_hidden ? (
                        <FaEyeSlash className="text-red-500 text-xl cursor-pointer" />
                    ) : (
                        <FaEye className="text-green-500 text-xl cursor-pointer" />
                    )}
                </button>
            </td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">
                {/* Delete Button */}
                <button onClick={() => handleDeleteClick(product)} className="text-red-500 hover:text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                </button>
            </td>
        </tr>
    ));

    //empty table
    if (currentProducts.length < itemsPerPage) {
        const emptyRows = Array.from({ length: itemsPerPage - currentProducts.length }, (_, index) => (
            <tr key={`empty-${index}`} className="bg-white">
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">{itemOffset + currentProducts.length + index + 1}</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
            </tr>
        ));
        tableRows.push(...emptyRows);
    }

    return (
        <div className="container mx-auto p-2 flex flex-col min-h-screen">
            <div className="flex items-center justify-between mb-4">
                <div className="relative w-1/4">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên sản phẩm"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <select
                        className="px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                        value={selectedParentCategory}
                        onChange={(e) => setSelectedParentCategory(e.target.value)}
                    >
                        <option value="">Tất cả danh mục cha</option>
                        {parentCategories.map((category) => (
                            <option key={category._id} value={category.category_parent_id}>
                                {category.category_parent_name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                        value={selectedChildCategory}
                        onChange={(e) => setSelectedChildCategory(e.target.value)}
                        disabled={!selectedParentCategory}
                    >
                        <option value="">Tất cả danh mục con</option>
                        {filteredChildCategories.map((category) => (
                            <option key={category._id} value={category.category_child_id}>
                                {category.category_child_name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="hidden">Sản phẩm bị ẩn</option>
                        <option value="visible">Sản phẩm đang hiển thị</option>
                    </select>
                </div>
            </div>

            <div className="flex-grow">
                <table className="min-w-full bg-white border border-gray-200 table-fixed">
                    <thead>
                        <tr>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">STT</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Tên sản phẩm</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Đơn vị tính</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Giá</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Ảnh sản phẩm</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Số lượng</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Trạng thái</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>{tableRows}</tbody>
                </table>

                <ReactPaginate
                    breakLabel="..."
                    nextLabel="Tiếp >"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={5}
                    pageCount={pageCount}
                    previousLabel="< Trước"
                    renderOnZeroPageCount={null}
                    className="mt-4 flex items-center justify-center gap-2"
                    pageClassName="px-3 py-1 border rounded hover:bg-gray-100"
                    previousClassName="px-3 py-1 border rounded hover:bg-gray-100"
                    nextClassName="px-3 py-1 border rounded hover:bg-gray-100"
                    activeClassName="bg-blue-500 text-white"
                    disabledClassName="opacity-50 cursor-not-allowed"
                />
                <DeleteConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    productName={productToDelete?.product_name}
                />
            </div>

            {selectedProduct && (
                <Modal isOpen={isModalOpen} onRequestClose={handleCloseModal} className="p-6 bg-white border rounded-lg w-1/3 mx-auto mt-20">
                    <h2 className="text-xl font-bold mb-4">Thông tin sản phẩm</h2>
                    <div className="mb-4">
                        {selectedProduct.product_image && (
                            <img
                                src={`data:image/jpeg;base64,${selectedProduct.product_image}`}
                                alt={selectedProduct.product_name}
                                className="max-w-full h-auto mb-4"
                            />
                        )}
                    </div>
                    <p>
                        <strong>Tên sản phẩm:</strong> {selectedProduct.product_name}
                    </p>
                    <p>
                        <strong>Giá:</strong> {formatPrice(selectedProduct.product_price)}
                    </p>
                    <p>
                        <strong>Số lượng:</strong> {selectedProduct.product_quantity}
                    </p>
                    <p>
                        <strong>Mô tả:</strong> {selectedProduct.description}
                    </p>
                    <p>
                        <strong>Trạng thái:</strong> {selectedProduct.is_hidden ? "Đang ẩn" : "Đang hiển thị"}
                    </p>
                    <button onClick={handleCloseModal} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                        Đóng
                    </button>
                </Modal>
            )}
        </div>
    );
}
