import axios from "./axiosCustomize";

const RegisterUserAPI = (name, email, password, gender, phone) => {
    const URL_API = "/v1/api/user/register";
    const data = { name, email, password, gender, phone };
    return axios.post(URL_API, data);
};

const LoginUserAPI = (email, password) => {
    const URL_API = "/v1/api/user/login";
    const data = { email, password };
    return axios.post(URL_API, data);
};

const updatePassword = (email, newPassword) => {
    const URL_API = "/v1/api/user/updatePassword";
    const data = { email, newPassword };
    return axios.post(URL_API, data);
};


const SalesRegistrationAPI = (user_id, farm_name, farm_logo, farm_phone, region_id, city_id, farm_detail, farm_banner) => {
    const URL_API = "/v1/api/user/salesRegistration"
    const data = {user_id, farm_name, farm_logo, farm_phone, region_id, city_id, farm_detail, farm_banner};
    return axios.post(URL_API, data)
}

// const UpdateUserAPI = async (email, name, oldPassword, newPassword, gender, phone, image, address) => {
//     const URL_API = "/v1/api/user/updateUser"
//     const data = {email, name, oldPassword, newPassword, gender, phone, image, address};
//     return axios.put(URL_API, data)
// }

const UpdateUserAPI = async (email, name, oldPassword, newPassword, gender, phone, image, region_id, city_id) => {
    const URL_API = "/v1/api/user/updateUser"
    const data = {email, name, oldPassword, newPassword, gender, phone, image, region_id, city_id};
    return axios.put(URL_API, data)
}

const GetUserAPI = async (email) => {
    const URL_API = "/v1/api/user/getUser"
    const data = {email};
    return axios.post(URL_API, data)
}

const getUserByID = async (user_id) => {
    const URL_API = "/v1/api/user/getUserByID"
    const data = {user_id};
    return axios.post(URL_API, data)
}

const getProductsByUser = async (user_id) => {
    const URL_API = "/v1/api/user/getProductsByUser"
    const data = {user_id};
    return axios.post(URL_API, data)
}

const addProduct = async (user_id,product_name,
    product_price,
    product_image,
    product_category_parent,
    product_category,
    product_description,
    product_inventory,
    product_unit,
    product_harvest_date,
    product_expired,
    cultivation_id,
    feature_id,
    is_rescue,
    rescue_start_date,
    rescue_end_date) => {
    const URL_API = "/v1/api/user/addProduct"
    const data = {user_id,
        product_name,
        product_price,
        product_image,
        product_category_parent,
        product_category,
        product_description,
        product_inventory,
        product_unit,
        product_harvest_date,
        product_expired,
        cultivation_id,
        feature_id,
        is_rescue,
        rescue_start_date,
        rescue_end_date
    };
    return axios.post(URL_API, data)
}

const getAllProduct = async () => {
    const URL_API = "/v1/api/user/getAllProduct"
    return axios.get(URL_API)
};

const getAllProductIncludeIsHidden = async () => {
    const URL_API = "/v1/api/user/getAllProductIncludeIsHidden"
    return axios.get(URL_API)
};

const getProductByID = async (product_id) => {
    const response = await axios.get(`/v1/api/user/getProductByID/${product_id}`);
        return response.data;
}

const getProductByParentCategory = async (category_parent_id) => {
    const URL_API = "/v1/api/user/getProductByParentCategory"
    const data = {category_parent_id};
    return axios.post(URL_API, data)
}

const getProductByChildCategory = async (category_child_id) => {
    const URL_API = "/v1/api/user/getProductByChildCategory"
    const data = {category_child_id};
    return axios.post(URL_API, data)
}

const updateProduct = async (
    product_id,
    farm_id,
    product_name,
    product_price,
    product_image,
    product_category_parent,
    product_category,
    product_description,
    product_inventory,
    product_unit,
    product_harvest_date,
    product_expired,
    cultivation_id,
    feature_id,
    is_rescue,
    rescue_start_date,
    rescue_end_date) => {
    const URL_API = "/v1/api/user/updateProduct"
    const data = {
        product_id,
        farm_id,
        product_name,
        product_price,
        product_image,
        product_category_parent,
        product_category,
        product_description,
        product_inventory,
        product_unit,
        product_harvest_date,
        product_expired,
        cultivation_id,
        feature_id,
        is_rescue,
        rescue_start_date,
        rescue_end_date};
    return axios.put(URL_API, data)
}

const isHiddenProduct = async (product_id, farm_id) => {
    const URL_API = "/v1/api/user/hideProduct"
    const data = {product_id, farm_id};
    return axios.put(URL_API, data)
}

const deleteProduct = async (product_id, farm_id) => {
    const URL_API = "/v1/api/user/deleteProduct"
    // const data = {product_id, farm_id}

    return axios.delete(URL_API,{
        data: { product_id, farm_id }
    }); 
}

//sản phẩm yêu thích
const getProductFavouriteById = async (user_id) => {
    const URL_API = "/v1/api/user/getProductFavouriteById"
    const data = {user_id};
    return axios.post(URL_API, data)
}

const addProductFavourite = async (user_id, product_id) => {
    const URL_API = "/v1/api/user/addProductFavourite"
    const data = {user_id, product_id};
    return axios.post(URL_API, data)
}

const deleteProductFavourite = async (user_id, product_id) => {
    const URL_API = "/v1/api/user/deleteProductFavourite"
    return axios.delete(URL_API,{
        data: { user_id, product_id }
    }); 
}

//đánh giá
const getReviewByProduct = async (product_id) => {
    const URL_API = "/v1/api/user/getReviewByProduct"
    const data = {product_id};
    return axios.post(URL_API, data)
}


//phí ship
const createShippingFee = async (vendor_id, city_id, shipping_cost) => {
    const URL_API = "/v1/api/user/createShippingFee"
    const data = {vendor_id, city_id, shipping_cost};
    return axios.post(URL_API, data)
}

const updateShippingFeeByVendor = async (shipping_fee_id, shipping_cost) => {
    const URL_API = "/v1/api/user/updateShippingFeeByVendor"
    const data = {shipping_fee_id, shipping_cost};
    return axios.put(URL_API, data)
}

const deleteShippingFeeByVendor = async (shipping_fee_id) => {
    const URL_API = "/v1/api/user/deleteShippingFeeByVendor"
    const data = {shipping_fee_id};
    return axios.delete(URL_API, {
        data: {shipping_fee_id}
    })
}

const getShippingFeeByVendor = async (vendor_id) => {
    const URL_API = "/v1/api/user/getShippingFeeByVendor"
    const data = {vendor_id};
    return axios.post(URL_API, data)
}

const getShippingFeeByVendorAndCity = async (vendor_id, city_id) => {
    const URL_API = "/v1/api/user/getShippingFeeByVendorAndCity"
    const data = {vendor_id, city_id};
    return axios.post(URL_API, data)
}

const setShippingFeeForAllCities = async (vendor_id, shipping_cost) => {
    const URL_API = "/v1/api/user/setShippingFeeForAllCities"
    const data = {vendor_id, shipping_cost};
    return axios.post(URL_API, data)
}

//mã giảm giá
const getPromotionsByFarmId = async (farm_id) => {
    const URL_API = "/v1/api/user/getPromotionsByFarmId"
    const data = {farm_id};
    return axios.post(URL_API, data)
}

const getPromotionsByID = async (promotion_id) => {
    const URL_API = "/v1/api/user/getPromotionsByID"
    const data = {promotion_id};
    return axios.post(URL_API, data)
}

const getPromotionsByProduct = async (product_id) => {
    const URL_API = "/v1/api/user/getPromotionsByProduct"
    const data = {product_id};
    return axios.post(URL_API, data)
}

const addBulkPromotion = async (
    farm_id,
    promotion_name,
    promotion_description,
    promotion_value,
    promotion_start_date,
    promotion_end_date
) => {
    const URL_API = "/v1/api/user/addBulkPromotion"
    const data = {
        farm_id,
        promotion_name,
        promotion_description,
        promotion_value,
        promotion_start_date,
        promotion_end_date
    };
    return axios.post(URL_API, data)
}

const addPromotion = async (
    product_id,
    promotion_name,
    promotion_description,
    promotion_value,
    promotion_start_date,
    promotion_end_date
) => {
    const URL_API = "/v1/api/user/addPromotion"
    const data = {
        product_id,
        promotion_name,
        promotion_description,
        promotion_value,
        promotion_start_date,
        promotion_end_date
    };
    return axios.post(URL_API, data)
}

const updatePromotion = async (
    promotion_id,
    promotion_name,
    promotion_description,
    promotion_value,
    // promotion_start_date,
    // promotion_end_date
) => {
    const URL_API = "/v1/api/user/updatePromotion"
    const data = {
        promotion_id,
        promotion_name,
        promotion_description,
        promotion_value,
        // promotion_start_date,
        // promotion_end_date
    };
    return axios.put(URL_API, data)
}

const deletePromotion = async (promotion_id) => {
    const URL_API = "/v1/api/user/deletePromotion"
    // const data = {promotion_id};
    return axios.delete(URL_API, {
        data: {promotion_id}
    })
}

//bài viết
const getAllBlogPosts = async () => {
    const URL_API = "/v1/api/user/getAllBlogPosts"
    return axios.get(URL_API)
}
const getAcceptedBlogs = async () => {
    const URL_API = "/v1/api/user/getAcceptedBlogs"
    return axios.get(URL_API)
}

const getUserBlogPosts = async (user_id) => {
    const URL_API = "/v1/api/user/getUserBlogPosts"
    const data = {user_id};
    return axios.post(URL_API, data)
}

const getBlogPostByID = async (blog_post_id) => {
    const URL_API = "/v1/api/user/getBlogPostByID"
    const data = {blog_post_id};
    return axios.post(URL_API, data)
}

const addBlogPost = async (
    user_id,
    blog_title,
    blog_content,
    blog_image
) => {
    const URL_API = "/v1/api/user/addBlogPost"
    const data = {
        user_id,
        blog_title,
        blog_content,
        blog_image
    };
    return axios.post(URL_API, data)
}

const updateBlogPost = async (
    blog_post_id,
    user_id,
    blog_title,
    blog_content,
    blog_image
) => {
    const URL_API = "/v1/api/user/updateBlogPost"
    const data = {
        blog_post_id,
        user_id,
        blog_title,
        blog_content,
        blog_image
    };
    return axios.put(URL_API, data)
}

const deleteBlogPost = async (blog_post_id, user_id) => {
    const URL_API = "/v1/api/user/deleteBlogPost"
    // const data = {promotion_id};
    return axios.delete(URL_API, {
        data: {blog_post_id, user_id}
    })
}
export {
    RegisterUserAPI,
    LoginUserAPI,
    SalesRegistrationAPI,
    UpdateUserAPI,
    GetUserAPI,
    getUserByID,
    updatePassword,

    //sản phẩm
    getAllProduct,
    getAllProductIncludeIsHidden,
    getProductsByUser,
    getProductByID,
    getProductByParentCategory,
    getProductByChildCategory,
    addProduct,
    updateProduct,
    isHiddenProduct,
    deleteProduct,

    //sản phẩm yêu thích
    getProductFavouriteById,
    addProductFavourite,
    deleteProductFavourite,

    //đánh giá
    getReviewByProduct,

    //phí ship
    createShippingFee,
    updateShippingFeeByVendor,
    deleteShippingFeeByVendor,
    getShippingFeeByVendor,
    getShippingFeeByVendorAndCity,
    setShippingFeeForAllCities,

    //mã giảm giá
    getPromotionsByFarmId,
    getPromotionsByProduct,
    getPromotionsByID,
    addBulkPromotion,
    addPromotion,
    updatePromotion,
    deletePromotion,

    //bài viết
    getAllBlogPosts,
    getAcceptedBlogs,
    getUserBlogPosts,
    getBlogPostByID,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
}