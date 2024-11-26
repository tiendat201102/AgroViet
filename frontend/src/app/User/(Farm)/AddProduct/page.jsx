"use client";
import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { getAllCategoryChild, getAllCategoryParent, getAllCultivation, getAllFeature } from "@/util/adminAPI";
import { toast } from "react-toastify";
import { addProduct } from "@/util/userAPI";
import { useRouter } from "next/navigation";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from 'draftjs-to-html';
import dynamic from 'next/dynamic';
import "@/../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const DraftEditor = dynamic(
    () => import('@/components/userComponents/DraftEditor'),
    { 
        ssr: false,
        loading: () => <div>Loading Editor...</div>
    }
);

const AddProductPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [parentCategories, setParentCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [cultivations, setCultivations] = useState([]);
    const [features, setFeatures] = useState([]);
    const [image, setImage] = useState("");
    const [fileKey, setFileKey] = useState(0); 
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

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

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [parentRes, childRes, cultivationRes, featureRes] = await Promise.all([
                    getAllCategoryParent(),
                    getAllCategoryChild(),
                    getAllCultivation(),
                    getAllFeature(),
                ]);

                if (parentRes.success === true) {
                    setParentCategories(parentRes.data);
                }
                if (childRes.success === true) {
                    setChildCategories(childRes.data);
                }
                if (cultivationRes.success === true) {
                    setCultivations(cultivationRes.data);
                }
                if (featureRes.success === true) {
                    setFeatures(featureRes.data);
                }
            } catch (err) {
                setError(err.message);
                toast.error("Lỗi khi tải dữ liệu: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const getFilteredChildCategories = () => {
        if (!newProduct.product_category_parent) return [];
        return childCategories.filter((child) => child.category_parent_id.toString() === newProduct.product_category_parent.toString());
    };

    useEffect(() => {
        const fetchChildCategories = async () => {
            if (!newProduct.product_category_parent) {
                setChildCategories([]);
                return;
            }

            try {
                const response = await getAllCategoryChild();
                if (response.success === true) {
                    const filteredChildren = response.data.filter((child) => child.category_parent_id === newProduct.product_category_parent);
                    setChildCategories(filteredChildren);
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetchChildCategories();
    }, [newProduct.product_category_parent]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const processedValue = type === "checkbox" ? checked : ["product_price", "product_inventory"].includes(name) ? Number(value) : value;

        setNewProduct((prev) => ({
            ...prev,
            [name]: processedValue,
            // Reset child category when parent category changes
            ...(name === "product_category_parent" ? { product_category: "" } : {}),
        }));
    };

    const handleImageChange = (e) => {
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

    const handleRescueChange = (e) => {
        const isChecked = e.target.checked;
        setNewProduct((prev) => ({
            ...prev,
            is_rescue: isChecked,
            rescue_start_date: isChecked ? prev.rescue_start_date : "",
            rescue_end_date: isChecked ? prev.rescue_end_date : "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user_info = getCookie("user_info");
            if (!user_info) throw new Error("Không tìm thấy thông tin người dùng");

            const userData = JSON.parse(user_info);

            // Validation
            if (!newProduct.product_category_parent || !newProduct.product_category) {
                toast.error("Vui lòng chọn danh mục sản phẩm");
                return;
            }

            if (newProduct.product_price < 0 || newProduct.product_inventory < 0) {
                toast.error("Giá và hàng tồn phải lớn hơn 0");
                return;
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
                product_image: image,
            };

            const response = await addProduct(productData);

            if (response.success === true) {
                toast.success("Thêm sản phẩm thành công!");
                // Reset form
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
                setImage("");
                setFileKey(prev => prev + 1);
                router.push("/User/ManageProduct");
            } else {
                toast.error(response.message || "Có lỗi xảy ra khi thêm sản phẩm");
            }
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi thêm sản phẩm");
        }
    };

    const onEditorStateChange = (newEditorState) => {
        setEditorState(newEditorState);
        const htmlContent = draftToHtml(convertToRaw(newEditorState.getCurrentContent()));
        setNewProduct(prev => ({
            ...prev,
            product_description: htmlContent
        }));
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Có lỗi xảy ra: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8 shadow-lg rounded-lg bg-white">
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Thêm Sản Phẩm Mới</h1>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Tên sản phẩm</label>
                        <input
                            type="text"
                            name="product_name"
                            value={newProduct.product_name}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Phương thức canh tác</label>
                        <select
                            name="cultivation_id"
                            value={newProduct.cultivation_id}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
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

                    <div>
                        <label className="block text-sm font-medium mb-2">Đặc điểm sản phẩm</label>
                        <select
                            name="feature_id"
                            value={newProduct.feature_id}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
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

                    <div>
                        <label className="block text-sm font-medium mb-2">Giá</label>
                        <input
                            type="number"
                            name="product_price"
                            value={newProduct.product_price}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Đơn vị</label>
                        <input
                            type="text"
                            name="product_unit"
                            value={newProduct.product_unit}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Tồn kho</label>
                        <input
                            type="number"
                            name="product_inventory"
                            value={newProduct.product_inventory}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Danh mục cha</label>
                        <select
                            name="product_category_parent"
                            value={newProduct.product_category_parent}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
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


                    <div>
                        <label className="block text-sm font-medium mb-2">Danh mục con</label>
                        <select
                            name="product_category"
                            value={newProduct.product_category}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                            disabled={!newProduct.product_category_parent}
                        >
                            <option value="">Chọn danh mục con</option>
                            {getFilteredChildCategories().map((child) => (
                                <option key={child.category_child_id} value={child.category_child_id}>
                                    {child.category_child_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* <div className="col-span-full">
                        <label className="block text-sm font-medium mb-2">Mô tả sản phẩm</label>
                        <textarea
                            name="product_description"
                            value={newProduct.product_description}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            rows="3"
                            required
                        />
                    </div> */}
                    <div className="col-span-full">
                        <label className="block text-sm font-medium mb-2">Mô tả sản phẩm</label>
                        <div className="border rounded">
                            <DraftEditor
                                editorState={editorState}
                                onEditorStateChange={onEditorStateChange}
                                wrapperClassName="wrapper-class"
                                editorClassName="editor-class p-2 min-h-[200px]"
                                toolbarClassName="toolbar-class"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Ngày thu hoạch</label>
                        <input
                            type="date"
                            name="product_harvest_date"
                            value={newProduct.product_harvest_date}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Ngày hết hạn</label>
                        <input
                            type="date"
                            name="product_expired"
                            value={newProduct.product_expired}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="col-span-full">
                        <label className="block text-sm font-medium mb-2">Ảnh sản phẩm</label>
                        <div className="flex items-center gap-4">
                            <input key={fileKey} type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 border rounded" />
                            {image && <img src={`data:image/jpeg;base64,${image}`} alt="Preview" className="w-24 h-24 object-cover rounded" />}
                        </div>
                    </div>

                    <div className="col-span-full">
                        <div className="flex items-center gap-2 mb-4">
                            <input type="checkbox" id="is_rescue" checked={newProduct.is_rescue} onChange={handleRescueChange} className="w-4 h-4" />
                            <label htmlFor="is_rescue">Sản phẩm cứu trợ</label>
                        </div>

                        {newProduct.is_rescue && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Ngày bắt đầu cứu trợ</label>
                                    <input
                                        type="date"
                                        name="rescue_start_date"
                                        value={newProduct.rescue_start_date}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required={newProduct.is_rescue}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Ngày kết thúc cứu trợ</label>
                                    <input
                                        type="date"
                                        name="rescue_end_date"
                                        value={newProduct.rescue_end_date}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required={newProduct.is_rescue}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-span-full">
                        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                            Thêm sản phẩm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductPage;
