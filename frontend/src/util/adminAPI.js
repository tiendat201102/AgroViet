import axios from "./axiosCustomize";

const getAllUser = () => {
    const URL_API = "/v1/api/admin/getAllUser";
    return axios.get(URL_API); 
};

const putBlockUser = (email) => {
    const URL_API = "/v1/api/admin/putBlockUser";
    const data = {email}
    return axios.put(URL_API, data); 
}

const getAllFarmer = () => {
    const URL_API = "/v1/api/admin/getAllFarmerApplication";
    return axios.get(URL_API); 
}

const getAllSalesman = () => {
    const URL_API = "/v1/api/admin/getAllSalesman";
    return axios.get(URL_API); 
}

const approveFarmer = (email) => {
    const URL_API = "/v1/api/admin/approveFarmer";
    const data = {email}
    return axios.put(URL_API, data); 
} 

const rejectFarmer = (email, rejection_reason) => {
    const URL_API = "/v1/api/admin/rejectFarmer";
    const data = {email, rejection_reason}
    return axios.put(URL_API, data); 
} 

const adminLogin = (email, password) => {
    const URL_API = "/v1/api/admin/adminLogin";
    const data = { email, password}
    return axios.post(URL_API, data); 
} 

//danh muc cha
const getParentCategoryById = (category_parent_id) => {
    const URL_API = "/v1/api/admin/getParentCategoryById";
    const data = { category_parent_id}
    return axios.post(URL_API, data); 
} 

const getAllCategoryParent = () => {
    const URL_API = "/v1/api/admin/getAllCategoryParent";
    return axios.get(URL_API); 
} 

const addCategoryParent = (category_parent_name) => {
    const URL_API = "/v1/api/admin/addCategoryParent";
    const data = { category_parent_name }
    return axios.post(URL_API, data); 
} 

const deleteCategoryParent = (category_parent_id) => {
    const URL_API = "/v1/api/admin/deleteCategoryParent";
    return axios.delete(URL_API, {
        data: { category_parent_id }
    }); 
} 

//danh muc con
const getChildCategoryById = (category_child_id) => {
    const URL_API = "/v1/api/admin/getChildCategoryById";
    const data = { category_child_id}
    return axios.post(URL_API, data); 
} 

const getAllCategoryChild = () => {
    const URL_API = "/v1/api/admin/getAllCategoryChild";
    return axios.get(URL_API); 
} 

const addCategoryChild = (category_parent_id, category_child_name) => {
    const URL_API = "/v1/api/admin/addCategoryChild";
    const data = { category_parent_id, category_child_name}
    return axios.post(URL_API, data); 
} 

const deleteCategoryChild = (category_child_id) => {
    const URL_API = "/v1/api/admin/deleteCategoryChild";
    return axios.delete(URL_API, {
        data: { category_child_id }
    }); 
} 

//phương thức canh tác
const getCultivationById = (cultivation_id) => {
    const URL_API = "/v1/api/admin/getCultivationById";
    const data = { cultivation_id}
    return axios.post(URL_API, data); 
}

const getAllCultivation = () => {
    const URL_API = "/v1/api/admin/getAllCultivation";
    return axios.get(URL_API); 
}

const addCultivation = (method_name) => {
    const data = { method_name }
    const URL_API = "/v1/api/admin/addCultivation";
    return axios.post(URL_API, data); 
}

const updateCultivation = (cultivation_id, method_name) => {
    const data = {cultivation_id, method_name} 
    const URL_API = "/v1/api/admin/updateCultivation";
    return axios.put(URL_API, data); 
}

const deleteCultivation = (cultivation_id) => {
    // const data = {cultivation_id} 
    const URL_API = "/v1/api/admin/deleteCultivation";
    return axios.delete(URL_API,{
        data: { cultivation_id }
    }); 
}

//tính chất
const getFeatureById = (feature_id) => {
    const URL_API = "/v1/api/admin/getFeatureByID";
    const data = { feature_id}
    return axios.post(URL_API, data); 
} 

const getAllFeature = () => {
    const URL_API = "/v1/api/admin/getAllFeature";
    return axios.get(URL_API); 
}

const addFeature = (feature_name) => {
    const data = { feature_name }
    const URL_API = "/v1/api/admin/addFeature";
    return axios.post(URL_API, data); 
}

const updateFeature = (feature_id, feature_name) => {
    const data = {feature_id, feature_name} 
    const URL_API = "/v1/api/admin/updateFeature";
    return axios.put(URL_API, data); 
}

const deleteFeature = (feature_id) => {
    // const data = {cultivation_id} 
    const URL_API = "/v1/api/admin/deleteFeature";
    return axios.delete(URL_API,{
        data: { feature_id }
    }); 
}

//vùng miền
const getRegionById = (region_id) => {
    const data = { region_id }
    const URL_API = "/v1/api/admin/getRegionById";
    return axios.post(URL_API, data); 
}

const getAllRegion = () => {
    const URL_API = "/v1/api/admin/getAllRegion";
    return axios.get(URL_API); 
}

const addRegion = (region_name) => {
    const data = { region_name }
    const URL_API = "/v1/api/admin/addRegion";
    return axios.post(URL_API, data); 
}

const updateRegion = (region_id, region_name) => {
    const data = {region_id, region_name} 
    const URL_API = "/v1/api/admin/updateRegion";
    return axios.put(URL_API, data); 
}

const deleteRegion = (region_id) => {
    const URL_API = "/v1/api/admin/deleteRegion";
    return axios.delete(URL_API,{
        data: { region_id }
    }); 
}

//thành phố
const getCityById = (city_id) => {
    const data = { city_id }
    const URL_API = "/v1/api/admin/getCityById";
    return axios.post(URL_API, data); 
}

const getAllCity = () => {
    const URL_API = "/v1/api/admin/getAllCity";
    return axios.get(URL_API); 
}

const addCity = (region_id, city_name) => {
    const data = { region_id, city_name }
    const URL_API = "/v1/api/admin/addCity";
    return axios.post(URL_API, data); 
}

const updateCity = (city_id, region_id, city_name) => {
    const data = {city_id, region_id, city_name} 
    const URL_API = "/v1/api/admin/updateCity";
    return axios.put(URL_API, data); 
}

const deleteCity = (city_id) => {
    const URL_API = "/v1/api/admin/deleteCity";
    return axios.delete(URL_API,{
        data: { city_id }
    }); 
}

//phương thức thanh toán
const getPaymentMethodById = (payment_method_id) => {
    const data = { payment_method_id }
    const URL_API = "/v1/api/admin/getPaymentMethodById";
    return axios.post(URL_API, data); 
}

const getAllPaymentMethod = () => {
    const URL_API = "/v1/api/admin/getAllPaymentMethod";
    return axios.get(URL_API); 
}

const addPaymentMethod = (method_name) => {
    const data = { method_name }
    const URL_API = "/v1/api/admin/addPaymentMethod";
    return axios.post(URL_API, data); 
}

const updatePaymentMethod = (payment_method_id, method_name) => {
    const data = {payment_method_id, method_name} 
    const URL_API = "/v1/api/admin/updatePaymentMethod";
    return axios.put(URL_API, data); 
}

const deletePaymentMethod = (payment_method_id) => {
    const URL_API = "/v1/api/admin/deletePaymentMethod";
    return axios.delete(URL_API,{
        data: { payment_method_id }
    }); 
}

//đơn hàng
// const createOrder = (customer_id, farm_id, payment_method_id, shipping_fee_id, total_amount) => {
//     const data = { customer_id, farm_id, payment_method_id, shipping_fee_id, total_amount }
//     const URL_API = "/v1/api/admin/createOrder";
//     return axios.post(URL_API, data); 
// }

const createOrder = (customer_id, farm_id, shipping_fee_id, total_amount) => {
    const data = { customer_id, farm_id, shipping_fee_id, total_amount }
    const URL_API = "/v1/api/admin/createOrder";
    return axios.post(URL_API, data); 
}

const getOrderByCustomer = (customer_id) => {
    const data = { customer_id }
    const URL_API = "/v1/api/admin/getOrderByCustomer";
    return axios.post(URL_API, data); 
}

const getOrderByFarm = (farm_id) => {
    const data = { farm_id }
    const URL_API = "/v1/api/admin/getOrderByFarm";
    return axios.post(URL_API, data); 
}

const updateOrderStatus = (order_id) => {
    const data = { order_id }
    const URL_API = "/v1/api/admin/updateOrderStatus";
    return axios.put(URL_API, data); 
}

const payment = (order_id, payment_method_id) => {
    const data = { order_id, payment_method_id }
    const URL_API = "/v1/api/admin/payment";
    return axios.post(URL_API, data); 
}

const acceptOrder = (order_id) => {
    const data = { order_id }
    const URL_API = "/v1/api/admin/acceptOrder";
    return axios.put(URL_API, data); 
}

const rejectOrder = (order_id,rejection_reason) => {
    const data = { order_id, rejection_reason }
    const URL_API = "/v1/api/admin/rejectOrder";
    return axios.put(URL_API, data); 
}

const getOrderTotal = (order_id) => {
    const data = { order_id }
    const URL_API = "/v1/api/admin/getOrderTotal";
    return axios.post(URL_API, data); 
}

const deleteOrder = (order_id) => {
    const URL_API = "/v1/api/admin/deleteOrder";
    return axios.post(URL_API, {
        data: {order_id}
    }); 
}




//chi tiết đơn hàng
const createOrderDetail = (order_id, product_id, product_quantity, price) => {
    const data = { order_id, product_id, product_quantity, price }
    const URL_API = "/v1/api/admin/createOrderDetail";
    return axios.post(URL_API, data); 
}

const getOrderDetail = (order_id) => {
    const data = { order_id }
    const URL_API = "/v1/api/admin/getOrderDetail";
    return axios.post(URL_API, data); 
}

const getOrderDetailByProduct = (product_id) => {
    const data = { product_id }
    const URL_API = "/v1/api/admin/getOrderDetailByProduct";
    return axios.post(URL_API, data); 
}

//duyệt bài viết
const getApprovalByBlogPostID = (blog_post_id) => {
    const data = { blog_post_id }
    const URL_API = "/v1/api/admin/getApprovalByBlogPostID";
    return axios.put(URL_API, data); 
}

const approveBlogPost = (blog_post_id) => {
    const data = { blog_post_id }
    const URL_API = "/v1/api/admin/approveBlogPost";
    return axios.put(URL_API, data); 
}

const rejectBlogPost = (blog_post_id, rejection_reason) => {
    const data = { blog_post_id, rejection_reason }
    const URL_API = "/v1/api/admin/rejectBlogPost";
    return axios.put(URL_API, data); 
}

export {
    getAllUser,
    putBlockUser,
    getAllFarmer,
    approveFarmer,
    rejectFarmer,
    adminLogin,
    getAllSalesman,
    //danh mục cha
    getParentCategoryById,
    getAllCategoryParent,
    addCategoryParent,
    deleteCategoryParent,
    //danh mục con
    getChildCategoryById,
    getAllCategoryChild,
    addCategoryChild,
    deleteCategoryChild,
    //phương thức canh tác
    getCultivationById,
    getAllCultivation,
    addCultivation,
    updateCultivation,
    deleteCultivation,
    //tính chất
    getFeatureById,
    getAllFeature,
    addFeature,
    updateFeature,
    deleteFeature,
    //vùng
    getRegionById,
    getAllRegion,
    addRegion,
    updateRegion,
    deleteRegion,
    //thành phố
    getCityById,
    getAllCity,
    addCity,
    updateCity,
    deleteCity,
    //phương thức thanh toán
    getPaymentMethodById,
    getAllPaymentMethod,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,

    //đơn hàng
    createOrder,
    getOrderByCustomer,
    getOrderByFarm,
    getOrderTotal,
    updateOrderStatus,
    acceptOrder,
    rejectOrder,
    payment,
    deleteOrder,

    //chi tiết đơn hàng
    createOrderDetail,
    getOrderDetail,
    getOrderDetailByProduct,

    //duyệt bài viết
    getApprovalByBlogPostID,
    approveBlogPost,
    rejectBlogPost,
}