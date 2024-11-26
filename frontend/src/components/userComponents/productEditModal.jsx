import React from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const EditProductModal = ({
    showModal, 
    setShowModal, 
    product, 
    selectedParent,
    handleParentChange,
    selectedChild,
    handleChildChange,
    parentCategories,
    childCategories,
    cultivations,
    features,
    image,
    setImage,
    handleImageChange 
}) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingProduct(prev => ({
            ...prev,
            [name]: ["product_price", "product_inventory"].includes(name) ? 
                Number(value) : 
                name === "is_rescue" ? value === "true" : value
        }));
    };

    const handleRescueChange = (e) => {
        const isChecked = e.target.checked;
        setEditingProduct(prev => ({
            ...prev,
            is_rescue: isChecked,
            rescue_start_date: isChecked ? prev.rescue_start_date : "",
            rescue_end_date: isChecked ? prev.rescue_end_date : ""
        }));
    };

    return (
        <>
            <div show={showModal} onClose={() => setShowModal(false)}>
                <form>
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
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Tên sản phẩm
                                        </label>
                                        <input
                                            type="text"
                                            name="product_name"
                                            value={editingProduct.product_name}
                                            onChange={handleInputChange}
                                            className="shadow border rounded w-full py-2 px-3"
                                            required
                                        />
                                    </div>

                                    {/* Phương thức canh tác */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Phương thức canh tác
                                        </label>
                                        <select
                                            name="cultivation_id"
                                            value={editingProduct.cultivation_id}
                                            onChange={handleInputChange}
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
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Đặc điểm sản phẩm
                                        </label>
                                        <select
                                            name="feature_id"
                                            value={editingProduct.feature_id}
                                            onChange={handleInputChange}
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

                                    {/* Các trường còn lại tương tự như AddModal */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Giá</label>
                                        <input
                                            type="number"
                                            name="product_price"
                                            value={editingProduct.product_price}
                                            onChange={handleInputChange}
                                            className="shadow border rounded w-full py-2 px-3"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Đơn vị sản phẩm
                                        </label>
                                        <input
                                            type="text"
                                            name="product_unit"
                                            value={editingProduct.product_unit}
                                            onChange={handleInputChange}
                                            className="shadow border rounded w-full py-2 px-3"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Tồn kho</label>
                                        <input
                                            type="number"
                                            name="product_inventory"
                                            value={editingProduct.product_inventory}
                                            onChange={handleInputChange}
                                            className="shadow border rounded w-full py-2 px-3"
                                            required
                                        />
                                    </div>

                                    {/* Danh mục sản phẩm */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Danh mục cha
                                        </label>
                                        <select
                                            value={selectedParent}
                                            onChange={handleParentChange}
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

                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Danh mục con
                                        </label>
                                        <select
                                            value={selectedChild}
                                            onChange={handleChildChange}
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

                                    {/* Dates */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Ngày thu hoạch
                                        </label>
                                        <input
                                            type="date"
                                            name="product_harvest_date"
                                            value={editingProduct.product_harvest_date}
                                            onChange={handleInputChange}
                                            className="shadow border rounded w-full py-2 px-3"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Ngày hết hạn
                                        </label>
                                        <input
                                            type="date"
                                            name="product_expired"
                                            value={editingProduct.product_expired}
                                            onChange={handleInputChange}
                                            className="shadow border rounded w-full py-2 px-3"
                                            required
                                        />
                                    </div>

                                    {/* Image */}
                                    <div className="col-span-2">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Ảnh sản phẩm
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="shadow border rounded py-2 px-3"
                                            />
                                            {image && (
                                                <img
                                                    src={`data:image/jpeg;base64,${image}`}
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
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        Ngày bắt đầu cứu trợ
                                                    </label>
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
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        Ngày kết thúc cứu trợ
                                                    </label>
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
                </form>
            </div>
        </>
    );
};

export default EditProductModal;