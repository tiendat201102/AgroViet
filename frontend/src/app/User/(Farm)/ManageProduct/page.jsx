"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { getProductsByUser, getProductByID, updateProduct, isHiddenProduct, deleteProduct } from "@/util/userAPI";
import { toast } from "react-toastify";
import {
    getAllCategoryChild,
    getAllCategoryParent,
    getAllCultivation,
    getAllFeature,
    getCultivationById,
    getFeatureById,
    getParentCategoryById,
    getOrderDetailByProduct,
} from "@/util/adminAPI";
import ProductRow from "@/components/userComponents/ProductRow";

const ProductManagement = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [relatedOrders, setRelatedOrders] = useState([]);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5;

    // state select box
    const [parentCategories, setParentCategories] = useState([]);
    const [categoryParentDetails, setCategoryParentDetails] = useState(null);
    const [editSelectedParent, setEditSelectedParent] = useState("");
    const [editSelectedChild, setEditSelectedChild] = useState("");
    const [childCategories, setChildCategories] = useState([]);
    const [editImage, setEditImage] = useState(null);
    const [cultivations, setCultivations] = useState([]);
    const [features, setFeatures] = useState([]);

    // Pagination logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const userInfo = getCookie("user_info");
            if (!userInfo) {
                toast.error("Không tìm thấy thông tin người dùng");
                return;
            }
            const userData = JSON.parse(userInfo);
            const response = await getProductsByUser(userData.user_id);
            if (response.success) {
                setProducts(response.data);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Lỗi khi tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const fetchCultivations = async () => {
        try {
            const response = await getAllCultivation();
            if (response.success) {
                setCultivations(response.data);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Lỗi khi tải phương thức canh tác");
        }
    };

    const fetchFeatures = async () => {
        try {
            const response = await getAllFeature();
            if (response.success) {
                setFeatures(response.data);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Lỗi khi tải đặc điểm sản phẩm");
        }
    };

    useEffect(() => {
        fetchCultivations();
        fetchFeatures();
    }, []);

    useEffect(() => {
        const fetchParentCategories = async () => {
            try {
                const response = await getAllCategoryParent();
                if (response.success) {
                    setParentCategories(response.data);
                } else {
                    toast.error("Không thể tải danh mục cha");
                }
            } catch (error) {
                console.error("Error fetching parent categories:", error);
                toast.error("Lỗi khi tải danh mục cha");
            }
        };

        fetchParentCategories();
    }, []);

    const handleEditClick = async (productId) => {
        setLoading(true);
        try {
            const response = await getProductByID(productId);
            if (response.success) {
                const harvestDate = response.data.product_harvest_date
                    ? new Date(response.data.product_harvest_date).toISOString().split("T")[0]
                    : "";
                const expiredDate = response.data.product_expired 
                    ? new Date(response.data.product_expired).toISOString().split("T")[0] 
                    : "";
                const rescueStartDate = response.data.rescue_start_date 
                    ? new Date(response.data.rescue_start_date).toISOString().split("T")[0] 
                    : "";
                const rescueEndDate = response.data.rescue_end_date 
                    ? new Date(response.data.rescue_end_date).toISOString().split("T")[0] 
                    : "";

                setEditingProduct({
                    ...response.data,
                    cultivation_id: response.data.form_of_cultivation,
                    feature_id: response.data.feature,
                    product_harvest_date: harvestDate,
                    product_expired: expiredDate,
                    rescue_start_date: rescueStartDate,
                    rescue_end_date: rescueEndDate,
                });

                setEditSelectedParent(response.data.product_category_parent);
                setEditSelectedChild(response.data.product_category);

                const childResponse = await getAllCategoryChild();
                if (childResponse.success) {
                    const filteredChildren = childResponse.data.filter(
                        (child) => child.category_parent_id === response.data.product_category_parent
                    );
                    setChildCategories(filteredChildren);
                } else {
                    toast.error(childResponse.message);
                }

                if (response.data.product_image) {
                    setEditImage(`data:image/png;base64,${response.data.product_image}`);
                }
                setShowEditModal(true);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Lỗi khi tải thông tin sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showEditModal) {
            fetchCultivations();
            fetchFeatures();
        }
    }, [showEditModal]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userInfo = getCookie("user_info");
            if (!userInfo) {
                toast.error("Không tìm thấy thông tin người dùng");
                return;
            }
            const userData = JSON.parse(userInfo);
            const response = await updateProduct({
                ...editingProduct,
                farm_id: userData.user_id,
            });

            if (response.success) {
                toast.success(response.message);
                await fetchProducts();
                setShowEditModal(false);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const processedValue = type === "checkbox" ? checked : ["product_price", "product_inventory"].includes(name) ? Number(value) : value;

        setEditingProduct((prev) => ({
            ...prev,
            [name]: processedValue,
        }));
    };

    const handleRescueChange = (e) => {
        setEditingProduct((prev) => ({
            ...prev,
            is_rescue: e.target.checked,
        }));
    };

    const handleEditParentChange = async (e) => {
        const parentId = e.target.value;
        setEditSelectedParent(parentId);

        // Fetch child categories based on parent
        const childResponse = await getAllCategoryChild();
        if (childResponse.success) {
            const filteredChildren = childResponse.data.filter((child) => child.category_parent_id === parentId);
            setChildCategories(filteredChildren);
        }
    };

    const handleEditChildChange = (e) => {
        setEditSelectedChild(e.target.value);
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImage(reader.result);
                setEditingProduct((prev) => ({
                    ...prev,
                    product_image: reader.result.split(",")[1],
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleToggleVisibility = async (productId, farmId) => {
        setLoading(true);
        try {
            const userInfo = getCookie("user_info");
            if (!userInfo) {
                toast.error("Không tìm thấy thông tin người dùng");
                return;
            }
            const userData = JSON.parse(userInfo);
            const response = await isHiddenProduct(productId, userData.farmId);
            
            if (response.success) {
                toast.success(response.message);
                await fetchProducts();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Lỗi khi thay đổi trạng thái ẩn/hiện sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = async (productId) => {
        setLoading(true);
        try {
            const response = await getOrderDetailByProduct(productId);
            if (response.success) {
                setRelatedOrders(response.data);
                setDeleteId(productId);
                setShowDeleteModal(true);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Lỗi khi kiểm tra đơn hàng liên quan");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitDelete = async () => {
        setLoading(true);
        try {
            const userInfo = getCookie("user_info");
            if (!userInfo) {
                toast.error("Không tìm thấy thông tin người dùng");
                return;
            }
            const userData = JSON.parse(userInfo);

            if (relatedOrders.length > 0 && !showDeleteConfirmation) {
                setShowDeleteConfirmation(true);
                setLoading(false);
                return;
            }

            const response = await deleteProduct(deleteId, userData.user_id);
            if (response.success) {
                toast.success(response.message);
                await fetchProducts();
                setShowDeleteModal(false);
                setShowDeleteConfirmation(false);
                setRelatedOrders([]);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Lỗi khi xóa sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const metrics = [
        { title: "Tổng sản phẩm", value: products.length, bgColor: "bg-blue-100", textColor: "text-blue-600" },
        { title: "Sản phẩm ẩn", value: products.filter((p) => p.is_hidden).length, bgColor: "bg-red-100", textColor: "text-red-600" },
        { title: "Sản phẩm cứu trợ", value: products.filter((p) => p.is_rescue).length, bgColor: "bg-green-100", textColor: "text-green-600" },
        {
            title: "Hết hàng",
            value: products.filter((p) => p.product_inventory === 0).length,
            bgColor: "bg-yellow-100",
            textColor: "text-yellow-600",
        },
    ];
    //paginate
    const Pagination = () => {
        return (
            <div className="flex justify-center space-x-2 mt-4 mb-8">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                        currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    Trước
                </button>

                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-1 rounded ${
                            currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}

                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                        currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    Sau
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Sản Phẩm</h1>
                <button
                    onClick={() => router.push("/User/AddProduct")}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                    Thêm Sản Phẩm
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map((metric, index) => (
                    <div key={index} className={`${metric.bgColor} rounded-lg p-6`}>
                        <div className={`text-2xl font-bold ${metric.textColor}`}>{metric.value}</div>
                        <div className="text-gray-600 text-sm mt-1">{metric.title}</div>
                    </div>
                ))}
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm cứu trợ</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentProducts.map((product) => (
                            <ProductRow
                                key={product.product_id}
                                product={product}
                                handleEditClick={handleEditClick}
                                handleToggleVisibility={handleToggleVisibility}
                                handleDeleteClick={handleDeleteClick}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showEditModal && editingProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                            <form onSubmit={handleEditSubmit}>
                                <div className="bg-white px-6 py-4 sm:p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa sản phẩm</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        {/* Tên sản phẩm */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                                            <input
                                                type="text"
                                                name="product_name"
                                                value={editingProduct.product_name}
                                                onChange={handleEditInputChange}
                                                className="w-full px-3 py-2 border rounded-md"
                                            />
                                        </div>

                                        {/* Phương thức canh tác */}
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Phương thức canh tác</label>
                                            <select
                                                name="cultivation_id"
                                                value={editingProduct.cultivation_id || ""}
                                                onChange={handleEditInputChange}
                                                className="shadow border rounded w-full py-2 px-3"
                                                required
                                            >
                                                <option value="">Chọn phương thức canh tác</option>
                                                {cultivations.map((cult) => (
                                                    <option key={cult.cultivation_id} value={cult.cultivation_id}>
                                                        {cult.method_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Đặc điểm */}
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Đặc điểm</label>
                                            <select
                                                name="feature_id"
                                                value={editingProduct.feature_id || ""}
                                                onChange={handleEditInputChange}
                                                className="shadow border rounded w-full py-2 px-3"
                                                required
                                            >
                                                <option value="">Chọn đặc điểm</option>
                                                {features.map((feat) => (
                                                    <option key={feat.feature_id} value={feat.feature_id}>
                                                        {feat.feature_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Giá */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Giá</label>
                                            <input
                                                type="number"
                                                name="product_price"
                                                value={editingProduct.product_price}
                                                onChange={handleEditInputChange}
                                                className="w-full px-3 py-2 border rounded-md"
                                            />
                                        </div>

                                        {/* Đơn vị sản phẩm */}
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Đơn vị sản phẩm</label>
                                            <input
                                                type="text"
                                                name="product_unit"
                                                value={editingProduct.product_unit}
                                                onChange={handleEditInputChange}
                                                className="shadow border rounded w-full py-2 px-3"
                                                required
                                            />
                                        </div>

                                        {/* Tồn kho */}
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Tồn kho</label>
                                            <input
                                                type="number"
                                                name="product_inventory"
                                                value={editingProduct.product_inventory}
                                                onChange={handleEditInputChange}
                                                className="shadow border rounded w-full py-2 px-3"
                                                required
                                            />
                                        </div>

                                        {/* Danh mục cha */}
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Danh mục cha</label>
                                            <select
                                                value={editSelectedParent}
                                                onChange={handleEditParentChange}
                                                className="shadow border rounded w-full py-2 px-3"
                                                required
                                            >
                                                <option value="">Chọn danh mục cha</option>
                                                {parentCategories.map((parent) => (
                                                    <option key={parent.category_parent_id} value={parent.category_parent_id}>
                                                        {parent.category_parent_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Danh mục con */}
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Danh mục con</label>
                                            <select
                                                value={editSelectedChild}
                                                onChange={handleEditChildChange}
                                                className="shadow border rounded w-full py-2 px-3"
                                                required
                                            >
                                                <option value="">Chọn danh mục con</option>
                                                {childCategories.map((child) => (
                                                    <option key={child.category_child_id} value={child.category_child_id}>
                                                        {child.category_child_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Ngày thu hoạch */}
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Ngày thu hoạch</label>
                                            <input
                                                type="date"
                                                name="product_harvest_date"
                                                value={editingProduct.product_harvest_date}
                                                onChange={handleEditInputChange}
                                                className="shadow border rounded w-full py-2 px-3"
                                                required
                                            />
                                        </div>

                                        {/* Ngày hết hạn */}
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Ngày hết hạn</label>
                                            <input
                                                type="date"
                                                name="product_expired"
                                                value={editingProduct.product_expired}
                                                onChange={handleEditInputChange}
                                                className="shadow border rounded w-full py-2 px-3"
                                                required
                                            />
                                        </div>

                                        {/* Image - Moved to its own row */}
                                        <div className="col-span-3">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Ảnh sản phẩm</label>
                                            <div className="flex items-center space-x-4">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleEditImageChange}
                                                    className="shadow border rounded py-2 px-3"
                                                />
                                                {editImage && <img src={editImage} alt="Preview" className="w-24 h-24 object-cover rounded" />}
                                            </div>
                                        </div>

                                        {/* Rescue Product */}
                                        <div className="col-span-3">
                                            <div className="flex items-center mb-4">
                                                <input
                                                    type="checkbox"
                                                    id="is_rescue"
                                                    checked={editingProduct.is_rescue}
                                                    onChange={handleRescueChange}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <label htmlFor="is_rescue" className="ml-2 text-sm font-medium text-gray-700">
                                                    Sản phẩm cứu trợ
                                                </label>
                                            </div>

                                            {editingProduct.is_rescue && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-bold mb-2">Ngày bắt đầu cứu trợ</label>
                                                        <input
                                                            type="date"
                                                            name="rescue_start_date"
                                                            value={editingProduct.rescue_start_date}
                                                            onChange={handleEditInputChange}
                                                            className="shadow border rounded w-full py-2 px-3"
                                                            required={editingProduct.is_rescue}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-bold mb-2">Ngày kết thúc cứu trợ</label>
                                                        <input
                                                            type="date"
                                                            name="rescue_end_date"
                                                            value={editingProduct.rescue_end_date}
                                                            onChange={handleEditInputChange}
                                                            className="shadow border rounded w-full py-2 px-3"
                                                            required={editingProduct.is_rescue}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cập nhật
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-lg mx-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa sản phẩm</h3>
                        
                        {relatedOrders.length > 0 ? (
                            <>
                                <p className="text-sm text-red-500 mb-4">
                                    Sản phẩm này đang liên quan đến {relatedOrders.length} đơn hàng:
                                </p>
                                <div className="max-h-60 overflow-y-auto mb-4">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Mã đơn hàng</th>
                                                <th className="px-4 py-2 text-xs font-medium text-gray-500 text-center">Số lượng</th>
                                                {/* <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Giá</th> */}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {relatedOrders.map((order) => (
                                                <tr key={order.order_id}>
                                                    <td className="px-4 py-2 text-sm text-gray-900">#{order.order_id}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 text-center">{order.product_quantity}</td>
                                                    {/* <td className="px-4 py-2 text-sm text-gray-900">
                                                        {order.price.toLocaleString("vi-VN")} VNĐ
                                                    </td> */}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {!showDeleteConfirmation ? (
                                    <p className="text-sm text-gray-500 mb-4">
                                        Xóa sản phẩm này sẽ ảnh hưởng đến lịch sử đơn hàng. Bạn có muốn tiếp tục?
                                    </p>
                                ) : (
                                    <p className="text-sm text-red-500 font-medium mb-4">
                                        Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-gray-500 mb-4">
                                Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
                            </p>
                        )}

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setShowDeleteConfirmation(false);
                                    setRelatedOrders([]);
                                }}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleSubmitDelete} 
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                {relatedOrders.length > 0 && !showDeleteConfirmation ? "Tiếp tục" : "Xóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Pagination />
        </div>
    );
};

export default ProductManagement;
