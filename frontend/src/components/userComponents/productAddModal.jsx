import React from 'react';

const ProductModal = ({ 
    showModal, 
    setShowModal, 
    newProduct, 
    setNewProduct, 
    handleSubmit,
    handleInputChange,
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
    handleImageChange,
    handleRescueChange 
}) => {
    if (!showModal) return null;

    return (
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
                                    onChange={handleInputChange}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-2">Phương thức canh tác</label>
                                <select
                                    name="cultivation_id"
                                    className="w-full p-2 border rounded-md text-[15px]"
                                    value={newProduct.cultivation_id}
                                    onChange={(e) => setNewProduct({...newProduct, cultivation_id: e.target.value})}
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
                                <label className="block font-medium text-gray-700 mb-2">Đặc điểm sản phẩm</label>
                                <select
                                    name="feature_id"
                                    className="w-full p-2 border rounded-md"
                                    value={newProduct.feature_id}
                                    onChange={(e) => setNewProduct({...newProduct, feature_id: e.target.value})}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>

                            {/* Category selections */}
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Danh mục sản phẩm cha</label>
                                <select
                                    name="product_category_parent"
                                    value={selectedParent}
                                    onChange={handleParentChange}
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

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Danh mục sản phẩm con</label>
                                <select
                                    name="product_category_child"
                                    value={selectedChild}
                                    onChange={handleChildChange}
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
                                    onChange={handleInputChange}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>

                            {/* Dates */}
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Ngày thu hoạch</label>
                                <input
                                    type="date"
                                    name="product_harvest_date"
                                    value={newProduct.product_harvest_date}
                                    onChange={handleInputChange}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Ngày hết hạn</label>
                                <input
                                    type="date"
                                    name="product_expired"
                                    value={newProduct.product_expired}
                                    onChange={handleInputChange}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>

                            {/* Image upload */}
                            <div className="col-span-2">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Ảnh sản phẩm</label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
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
                                                onClick={() => setImage("")}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rescue product section */}
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
                                                onChange={handleInputChange}
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
                                                onChange={handleInputChange}
                                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                required={newProduct.is_rescue}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse">
                            <button
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
    );
};

export default ProductModal;