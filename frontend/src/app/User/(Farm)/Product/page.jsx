"use client";
import React, { useState, useEffect } from "react";

import { getCookie } from "cookies-next";
import { getProductsByUser, addProduct, getProductByID, UpdateUserAPI, updateProduct } from "../../../../util/userAPI";
import {
    getAllCategoryChild,
    getAllCategoryParent,
    getAllCultivation,
    getAllFeature,
    getParentCategoryById,
    getChildCategoryById,
    getCultivationById,
    getFeatureById
} from "../../../../util/adminAPI";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ProductPage = () => {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [parentCategories, setParentCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);

    const [cultivations, setCultivations] = useState([]);
    const [features, setFeatures] = useState([]);

    const [newProduct, setNewProduct] = useState({
        product_name: "",
        product_price: "",
        product_image: "",
        product_category_parent: "",
        product_category: "",
        product_description: "",
        product_inventory: "",
        product_unit: "",
        product_harvest_date: "",
        product_expired: "",
        cultivation_id: "",
        feature_id: "",
        is_rescue: false,
        rescue_start_date: "",
        rescue_end_date: "",
    });
    const [selectedParent, setSelectedParent] = useState("");
    const [selectedChild, setSelectedChild] = useState("");
    const [editSelectedParent, setEditSelectedParent] = useState("");
    const [editSelectedChild, setEditSelectedChild] = useState("");
    const [image, setImage] = useState("");
    const [editImage, setEditImage] = useState("");

    const handleAddInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const processedValue = type === "checkbox" ? checked : ["product_price", "product_inventory"].includes(name) ? Number(value) : value;

        setNewProduct((prev) => ({
            ...prev,
            [name]: processedValue,
        }));
    };

    const handleAddParentChange = (e) => {
        setSelectedParent(e.target.value);
        setSelectedChild("");
    };

    const handleAddChildChange = (e) => {
        const childId = e.target.value;
        setSelectedChild(childId);
        setNewProduct((prev) => ({
            ...prev,
            product_category: childId,
        }));
    };

    const handleAddImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(",")[1];
                setImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCloseAddModal = () => {
        setShowModal(false);
        setNewProduct({
            product_name: "",
            product_price: "",
            product_image: "",
            product_category_parent: "",
            product_category: "",
            product_description: "",
            product_inventory: "",
            product_unit: "",
            product_harvest_date: "",
            product_expired: "",
            cultivation_id: "",
            feature_id: "",
            is_rescue: false,
            rescue_start_date: "",
            rescue_end_date: "",
        });
        setSelectedParent("");
        setSelectedChild("");
        setImage("");
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingProduct(null);
        setEditSelectedParent("");
        setEditSelectedChild("");
        setEditImage("");
    };

    const handleEditInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const processedValue = type === "checkbox" ? checked : ["product_price", "product_inventory"].includes(name) ? Number(value) : value;

        setEditingProduct((prev) => ({
            ...prev,
            [name]: processedValue,
        }));
    };

    const handleEditParentChange = (e) => {
        setEditSelectedParent(e.target.value);
        setEditSelectedChild("");
    };

    const handleEditChildChange = (e) => {
        const childId = e.target.value;
        setEditSelectedChild(childId);
        setEditingProduct((prev) => ({
            ...prev,
            product_category: childId,
        }));
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(",")[1];
                setEditImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    // Add state for storing fetched category details
    const [categoryParentDetails, setCategoryParentDetails] = useState(null);
    const [categoryChildDetails, setCategoryChildDetails] = useState(null);
    const [cultivationDetails, setCultivationDetails] = useState(null);
    const [featureDetails, setFeatureDetails] = useState(null);
    

    // Fetch category details when component mounts or editingProduct changes
    useEffect(() => {
        const fetchDetails = async () => {
            if (editingProduct) {
                const parentResponse = await getParentCategoryById(editingProduct.product_category_parent);
            
            if (parentResponse.success) {
                setCategoryParentDetails(parentResponse.data);
                setEditSelectedParent(parentResponse.data.category_parent_id);
                
                // Fetch và set child categories dựa trên parent
                const childResponse = await getAllCategoryChild();
                if (childResponse.success) {
                    const filteredChildren = childResponse.data.filter(
                        child => child.category_parent_id === parentResponse.data.category_parent_id
                    );
                    // setChildCategories(filteredChildren);
                    setEditSelectedChild(editingProduct.product_category);
                }
            }

                const cultivationResponse = await getCultivationById(editingProduct.form_of_cultivation);
                if (cultivationResponse.success) {
                    setCultivationDetails(cultivationResponse.data);
                    setEditingProduct(prev => ({
                        ...prev,
                        cultivation_id: cultivationResponse.data.cultivation_id,
                        method_name: cultivationResponse.data.method_name
                    }));
                }

                const featureResponse = await getFeatureById(editingProduct.feature);
                if (featureResponse.success) {
                    setFeatureDetails(featureResponse.data);
                    setEditingProduct(prev => ({
                        ...prev,
                        feature_id: featureResponse.data.feature_id,
                        feature_name: featureResponse.data.feature_name
                    }));
                }
            }
        };

        fetchDetails();
    }, [editingProduct]);

    const handleEditRescueChange = (e) => {
        const isChecked = e.target.checked;
        handleEditInputChange({
            target: {
                name: "is_rescue",
                type: "checkbox",
                checked: isChecked,
            },
        });
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

    // Danh muc san pham
    useEffect(() => {
        const fetchParentCategories = async () => {
            try {
                const response = await getAllCategoryParent();
                if (!response.success) {
                    // throw new Error(response.message);
                    console.log();
                }
                setParentCategories(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchParentCategories();
    }, []);

    // Fetch child categories when parent category is selected
    useEffect(() => {
        const fetchChildCategories = async () => {
            if (!selectedParent) {
                setChildCategories([]);
                return;
            }

            setLoading(true);
            try {
                const response = await getAllCategoryChild();
                if (!response.success) {
                    toast.error(response.message);
                }

                const filteredChildren = response.data.filter((child) => child.category_parent_id.toString() === selectedParent.toString());
                setChildCategories(filteredChildren);
                setSelectedChild("");
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChildCategories();
    }, [selectedParent]);

    const fetchCultivations = async () => {
        try {
            const response = await getAllCultivation();
            // console.log("phan hoi cua cultivation >>> ", response);

            if (response.success) {
                setCultivations(response.data);
            } else {
                toast.error("Không thể tải phương thức canh tác");
            }
        } catch (error) {
            console.error("Error fetching cultivations:", error);
            toast.error("Lỗi khi tải phương thức canh tác");
        }
    };

    const fetchFeatures = async () => {
        try {
            const response = await getAllFeature();
            if (response.success) {
                setFeatures(response.data);
            } else {
                toast.error("Không thể tải đặc điểm sản phẩm");
            }
        } catch (error) {
            console.error("Error fetching features:", error);
            toast.error("Lỗi khi tải đặc điểm sản phẩm");
        }
    };

    useEffect(() => {
        fetchCultivations();
        fetchFeatures();
    }, []);

    //het danh muc san pham

    useEffect(() => {
        const user_info = getCookie("user_info");
        if (user_info) {
            const parsed = JSON.parse(user_info);
            fetchProducts(parsed.user_id);
        }
    }, []);

    const fetchProducts = async (userId) => {
        try {
            const response = await getProductsByUser(userId);
            console.log("check response >>>>>>>>>>>>>> ", response);

            if (response.success) {
                setProducts(response.data);
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user_info = getCookie("user_info");
            if (!user_info) throw new Error("Không tìm thấy thông tin người dùng");

            const userData = JSON.parse(user_info);

            // Validation
            if (newProduct.product_price < 0 || newProduct.product_inventory < 0) {
                toast.error("Giá và hàng tồn phải lớn hơn 0");
                return;
            }

            if (newProduct.product_harvest_date && newProduct.product_expired) {
                const harvestDate = new Date(newProduct.product_harvest_date);
                const expiredDate = new Date(newProduct.product_expired);

                if (expiredDate < harvestDate) {
                    toast.error("Vui lòng kiểm tra lại ngày hết hạn của sản phẩm");
                    return;
                }
            }

            if (newProduct.is_rescue) {
                if (!newProduct.rescue_start_date || !newProduct.rescue_end_date) {
                    toast.error("Vui lòng nhập đầy đủ thông tin ngày cứu trợ");
                    return;
                }

                const startDate = new Date(newProduct.rescue_start_date);
                const endDate = new Date(newProduct.rescue_end_date);
                const currentDate = new Date();

                if (endDate < startDate) {
                    toast.error("Ngày kết thúc cứu trợ không thể sớm hơn ngày bắt đầu");
                    return;
                }

                if (endDate < currentDate) {
                    toast.error("Ngày kết thúc cứu trợ phải lớn hơn thời gian hiện tại");
                    return;
                }
            }

            const productData = {
                user_id: userData.user_id,
                ...newProduct,
                product_category_parent: selectedParent,
                product_category: selectedChild,
                product_image: image || "",
            };

            const response = await addProduct(productData);

            if (response.success) {
                toast.success("Thêm sản phẩm thành công!");
                handleCloseAddModal();
                fetchProducts(userData.user_id);
            } else {
                toast.error(response.message || "Có lỗi xảy ra khi thêm sản phẩm");
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleDeleteProduct = async (productId) => {};

    const handleRescueChange = (e) => {
        const isChecked = e.target.checked;
        setNewProduct((prev) => ({
            ...prev,
            is_rescue: isChecked,
            rescue_start_date: isChecked ? prev.rescue_start_date : "",
            rescue_end_date: isChecked ? prev.rescue_end_date : "",
        }));
    };
    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
    };

    // const handleEditClick = async (product) => {
    //     try {
    //         const response = await getProductByID(product.product_id);

    //         if (response.success) {
    //             const productData = response.data;

    //             const formattedProduct = {
    //                 ...productData,
    //                 product_harvest_date: formatDateForInput(productData.product_harvest_date),
    //                 product_expired: formatDateForInput(productData.product_expired),
    //                 rescue_start_date: formatDateForInput(productData.rescue_start_date),
    //                 rescue_end_date: formatDateForInput(productData.rescue_end_date),
    //             };
    //             // Cập nhật state
    //             setEditingProduct(formattedProduct);

    //             // Nếu muốn log dữ liệu, log trực tiếp formattedProduct
    //             console.log("Dữ liệu sản phẩm >>> ", formattedProduct);

    //             setEditSelectedParent(productData.category_parent_id?.toString());
    //             setEditSelectedChild(productData.category_child_id?.toString());
    //             setEditImage(productData.product_image || "");
    //             setShowEditModal(true);
    //         } else {
    //             toast.error("Không thể tải thông tin sản phẩm");
    //         }
    //     } catch (error) {
    //         console.error("Error fetching product:", error);
    //         toast.error("Có lỗi xảy ra khi tải thông tin sản phẩm");
    //     }
    // };

    const [allChildCategories, setAllChildCategories] = useState([]);

// Fetch danh sách child category khi component được render
useEffect(() => {
  const fetchChildCategories = async () => {
    try {
      const response = await getAllCategoryChild();
      if (response.success) {
        setAllChildCategories(response.data);
      } else {
        toast.error("Không thể tải danh mục con");
      }
    } catch (error) {
      console.error("Error fetching child categories:", error);
      toast.error("Lỗi khi tải danh mục con");
    }
  };

  fetchChildCategories();
}, []);

// Khi mở modal chỉnh sửa sản phẩm
const handleEditClick = async (product) => {
    try {
      const response = await getProductByID(product.product_id);
      if (response.success) {
        const productData = response.data;
  
        const formattedProduct = {
          ...productData,
          product_harvest_date: formatDateForInput(productData.product_harvest_date),
          product_expired: formatDateForInput(productData.product_expired),
          rescue_start_date: formatDateForInput(productData.rescue_start_date),
          rescue_end_date: formatDateForInput(productData.rescue_end_date),
        };
  
        // Cập nhật state
        setEditingProduct(formattedProduct);
        setEditSelectedParent(productData.category_parent_id?.toString());
        setEditSelectedChild(productData.category_child_id?.toString());
        // setEditImage(productData.product_image || "");
        // setEditImage( `data:image/png;base64,${productData.product_image}`);
        const imageUrl = `data:image/png;base64,${productData.product_image}`;
        setEditImage(imageUrl);
        setShowEditModal(true);
      } else {
        toast.error("Không thể tải thông tin sản phẩm");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Có lỗi xảy ra khi tải thông tin sản phẩm");
    }
  };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const user_info = getCookie("user_info");
            if (!user_info) console.log("Không tim thấy người dùng");
            

            const userData = JSON.parse(user_info);

            // Validation
            if (editingProduct.product_price < 0 || editingProduct.product_inventory < 0) {
                toast.error("Giá và hàng tồn phải lớn hơn 0");
                return;
            }

            if (editingProduct.product_harvest_date && editingProduct.product_expired) {
                const harvestDate = new Date(editingProduct.product_harvest_date);
                const expiredDate = new Date(editingProduct.product_expired);

                if (expiredDate < harvestDate) {
                    toast.error("Vui lòng kiểm tra lại ngày hết hạn của sản phẩm");
                    return;
                }
            }

            if (editingProduct.is_rescue) {
                if (!editingProduct.rescue_start_date || !editingProduct.rescue_end_date) {
                    toast.error("Vui lòng nhập đầy đủ thông tin ngày cứu trợ");
                    return;
                }

                const startDate = new Date(editingProduct.rescue_start_date);
                const endDate = new Date(editingProduct.rescue_end_date);
                const currentDate = new Date();

                if (endDate < startDate) {
                    toast.error("Ngày kết thúc cứu trợ không thể sớm hơn ngày bắt đầu");
                    return;
                }

                if (endDate < currentDate) {
                    toast.error("Ngày kết thúc cứu trợ phải lớn hơn thời gian hiện tại");
                    return;
                }
            }
            console.log("Trước khi gọi updateProduct:", {
                product_id: editingProduct.product_id,
                farm_id: editingProduct.farm_id,
                product_name: editingProduct.product_name,
            });

            const response = await updateProduct(
                editingProduct.product_id,
                editingProduct.farm_id,
                editingProduct.product_name,
                editingProduct.product_price,
                editingProduct.product_description,
                editImage || editingProduct.product_image,
                editingProduct.product_inventory,
                editingProduct.product_unit,
                editingProduct.product_harvest_date,
                editingProduct.product_expired,
                editingProduct.cultivation_id,
                editingProduct.feature_id,
                editingProduct.is_rescue,
                editingProduct.rescue_start_date,
                editingProduct.rescue_end_date
            );

            console.log("trong userData.user_id co gi >>>> ", userData.user_id);
            console.log("trong editingProduct.product_id co gi >>>> ",  editingProduct.product_id);
            

            if (response.success) {
                toast.success("Cập nhật sản phẩm thành công!");
                setShowEditModal(false);
                fetchProducts(userData.user_id); 
            } else {
                console.log("trong day co gi >>>> ", response);
                toast.error(response.message || "Có lỗi xảy ra khi cập nhật sản phẩm");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Có lỗi xảy ra khi cập nhật sản phẩm");
        }
    };

    useEffect(() => {
        if (editingProduct) {
            // Set parent category first
            setSelectedParent(editingProduct.category_parent_id?.toString() || "");

            // Fetch child categories based on parent
            const fetchChildCategoriesForEdit = async () => {
                try {
                    const response = await getAllCategoryChild();
                    if (response.success) {
                        const filteredChildren = response.data.filter(
                            (child) => child.category_parent_id.toString() === editingProduct.category_parent_id?.toString()
                        );
                        setChildCategories(filteredChildren);
                        // Set child category after fetching children
                        setSelectedChild(editingProduct.category_child_id?.toString() || "");
                    }
                } catch (error) {
                    console.error("Error fetching child categories:", error);
                }
            };

            fetchChildCategoriesForEdit();

            // Set other dropdown values
            if (editingProduct.cultivation_id) {
                setNewProduct((prev) => ({
                    ...prev,
                    cultivation_id: editingProduct.cultivation_id.toString(),
                }));
            }

            if (editingProduct.feature_id) {
                setNewProduct((prev) => ({
                    ...prev,
                    feature_id: editingProduct.feature_id.toString(),
                }));
            }
        }
    }, [editingProduct?.product_id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        const processedValue = type === "checkbox" ? checked : ["product_price", "product_inventory"].includes(name) ? Number(value) : value;

        if (showEditModal) {
            setEditingProduct((prev) => ({
                ...prev,
                [name]: processedValue,
            }));
        } else {
            // If we're adding new product, update newProduct state
            setNewProduct((prev) => ({
                ...prev,
                [name]: processedValue,
            }));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Sản Phẩm</h1>
                <button onClick={() => setShowModal(true)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                    {/* Add icon here - Plus icon */}
                    Thêm Sản Phẩm
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <div key={index} className={`${metric.bgColor} rounded-lg p-6 transition-transform hover:scale-105`}>
                        <div className={`text-2xl font-bold ${metric.textColor}`}>{metric.value}</div>
                        <div className="text-gray-600 text-sm mt-1">{metric.title}</div>
                    </div>
                ))}
            </div>
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-6 py-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {/* Tên sản phẩm */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Tên sản phẩm</label>
                                        <input
                                            type="text"
                                            name="product_name"
                                            value={newProduct.product_name}
                                            onChange={handleAddInputChange}
                                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                        />
                                    </div>

                                    {/* Phương thức canh tác */}
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Phương thức canh tác</label>
                                        <select
                                            name="cultivation_id"
                                            className="w-full p-2 border rounded-md text-[15px] "
                                            value={newProduct.cultivation_id}
                                            onChange={(e) => setNewProduct({ ...newProduct, cultivation_id: e.target.value })}
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

                                    {/* Đặc điểm sản phẩm */}
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Đặc điểm sản phẩm</label>
                                        <select
                                            name="feature_id"
                                            className="w-full p-2 border rounded-md"
                                            value={newProduct.feature_id}
                                            onChange={(e) => setNewProduct({ ...newProduct, feature_id: e.target.value })}
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
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Giá</label>
                                        <input
                                            type="number"
                                            name="product_price"
                                            value={newProduct.product_price}
                                            onChange={handleAddInputChange}
                                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                        />
                                    </div>

                                    {/* Đơn vị sản phẩm */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Đơn vị sản phẩm</label>
                                        <input
                                            type="text"
                                            name="product_unit"
                                            value={newProduct.product_unit}
                                            onChange={handleAddInputChange}
                                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                        />
                                    </div>

                                    {/* Tồn kho */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Tồn kho</label>
                                        <input
                                            type="number"
                                            name="product_inventory"
                                            value={newProduct.product_inventory}
                                            onChange={handleAddInputChange}
                                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                        />
                                    </div>

                                    {/* Danh mục sản phẩm cha*/}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Danh mục sản phẩm cha</label>
                                        <select
                                            type="text"
                                            name="product_category_parent"
                                            value={selectedParent}
                                            onChange={handleAddParentChange}
                                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

                                    {/* Danh mục sản phẩm con */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Danh mục sản phẩm con</label>
                                        <select
                                            type="text"
                                            name="product_category_child"
                                            value={selectedChild}
                                            onChange={handleAddChildChange}
                                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

                                    {/* Mô tả sản phẩm */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Mô tả sản phẩm</label>
                                        <textarea
                                            name="product_description"
                                            value={newProduct.product_description}
                                            onChange={handleAddInputChange}
                                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                        />
                                    </div>

                                    {/* Ngày thu hoạch */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Ngày thu hoạch</label>
                                        <input
                                            type="date"
                                            name="product_harvest_date"
                                            value={newProduct.product_harvest_date}
                                            onChange={handleAddInputChange}
                                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                        />
                                    </div>

                                    {/* Ngày hết hạn */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Ngày hết hạn</label>
                                        <input
                                            type="date"
                                            name="product_expired"
                                            value={newProduct.product_expired}
                                            onChange={handleAddInputChange}
                                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>

                                    {/* Ảnh sản phẩm */}
                                    <div className="col-span-2">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Ảnh sản phẩm</label>
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAddImageChange}
                                                className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                required
                                            />
                                            {image && (
                                                <div className="relative">
                                                    <img
                                                        src={`data:image/jpeg;base64,${image}`}
                                                        alt="Preview"
                                                        className="w-24 h-24 object-cover rounded"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImage("");
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sản phẩm cứu trợ */}
                                    <div className="col-span-2">
                                        <div className="flex items-center mb-4">
                                            <input
                                                type="checkbox"
                                                id="is_rescue"
                                                checked={newProduct.is_rescue}
                                                onChange={handleRescueChange}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="is_rescue" className="ml-2 text-sm font-medium text-gray-700">
                                                Sản phẩm cứu trợ
                                            </label>
                                        </div>

                                        {newProduct.is_rescue && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">Ngày bắt đầu cứu trợ</label>
                                                    <input
                                                        type="date"
                                                        name="rescue_start_date"
                                                        value={newProduct.rescue_start_date}
                                                        onChange={handleAddInputChange}
                                                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        required={newProduct.is_rescue}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">Ngày kết thúc cứu trợ</label>
                                                    <input
                                                        type="date"
                                                        name="rescue_end_date"
                                                        value={newProduct.rescue_end_date}
                                                        onChange={handleAddInputChange}
                                                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        required={newProduct.is_rescue}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Các nút hành động */}
                                <div className="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse">
                                    <button
                                        // onClick={handleCloseAddModal}
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Thêm sản phẩm
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                            <form onSubmit={handleEditSubmit}>
                                <div className="bg-white px-6 py-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {/* Tên sản phẩm */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Tên sản phẩm</label>
                                        <input
                                            type="text"
                                            name="product_name"
                                            value={editingProduct.product_name}
                                            onChange={handleEditInputChange}
                                            className="shadow border rounded w-full py-2 px-3"
                                            required
                                        />
                                    </div>

                                    {/* Phương thức canh tác */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Phương thức canh tác</label>
                                        <select
                                            name="cultivation_id"
                                            value={editingProduct.cultivation_id}
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

                                    {/* Đặc điểm sản phẩm */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Đặc điểm sản phẩm</label>
                                        <select
                                            name="feature_id"
                                            value={editingProduct.feature_id}
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
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Giá</label>
                                        <input
                                            type="number"
                                            name="product_price"
                                            value={editingProduct.product_price}
                                            onChange={handleEditInputChange}
                                            className="shadow border rounded w-full py-2 px-3"
                                            required
                                        />
                                    </div>

                                    {/* Đơn vị sản phẩm */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Đơn vị sản phẩm</label>
                                        <input
                                            type="text"
                                            name="product_unit"
                                            value={editingProduct.product_unit}
                                            onChange={handleInputChange}
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

                                    {/* Danh mục sản phẩm */}
                                    {/* <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Danh mục cha</label>
                                        <select
                                            value={editSelectedParent || ""}
                                            onChange={handleEditParentChange}
                                            className="shadow border rounded w-full py-2 px-3"
                                            required
                                        >
                                            <option value="">Chọn danh mục cha</option>
                                            {parentCategories.map((parent) => (
                                                <option
                                                    key={parent.category_parent_id}
                                                    value={parent.category_parent_id}
                                                    defaultValue={parent.category_parent_id === editSelectedParent}
                                                >
                                                    {parent.category_parent_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div> */}

                                    {/* Danh mục sản phẩm con */}
                                    {/* <div>
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
                                    </div> */}

                                    {/* Dates */}
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

                                    {/* Image */}
                                    <div className="col-span-2">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Ảnh sản phẩm</label>
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleEditImageChange}
                                                className="shadow border rounded py-2 px-3"
                                            />
                                            {editImage  && (
                                                <img
                                                    src={editImage}
                                                    alt="Preview"
                                                    className="w-24 h-24 object-cover rounded"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Rescue Product */}
                                    <div className="col-span-2">
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
                                                        onChange={handleInputChange}
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
                                                        onChange={handleInputChange}
                                                        className="shadow border rounded w-full py-2 px-3"
                                                        required={editingProduct.is_rescue}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer buttons */}
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

            {/* Main Content*/}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-5">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Chưa có sản phẩm nào</p>
                        <button onClick={() => setShowModal(true)} className="mt-4 text-blue-500 hover:text-blue-600 underline">
                            Thêm sản phẩm mới
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sản phẩm cứu trợ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.product_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                src={`data:image/jpeg;base64,${product.product_image}`}
                                                alt={product.product_name || "Product image"}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(product.product_price)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{product.product_inventory}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    product.is_hidden ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                                                }`}
                                            >
                                                {product.is_hidden ? "Đã ẩn" : "Đang hiển thị"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    product.is_rescue ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                                                }`}
                                            >
                                                {product.is_rescue ? "Sản phẩm cứu trợ" : "Sản phẩm bình thường"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleEditClick(product)}
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

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteProduct(product.product_id)}
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
