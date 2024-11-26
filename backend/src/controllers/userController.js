const {ServiceRegisterUser, ServiceLoginUser, ServiceSalesRegistration, ServiceUpdateUser, ServiceGetUser, ServiceAddProduct, ServiceGetProductByUser, ServiceGetProductCategory, ServiceAddProductFavourite, ServiceRemoveProductFavourite, ServiceAddReview, ServiceUpdateReview, ServiceDeleteReview, ServiceAddPromotion, ServiceUpdatePromotion, ServiceDeletePromotion, ServiceGetAllProducts, ServiceGetProductById, ServiceUpdateProduct, ServiceGetProductParentCategory, ServiceGetProductByParentCategory, ServiceHideProduct, ServiceDeleteProduct, ServiceGetProductFavouriteById, ServiceGetProductID, ServiceCreateShippingFee, ServiceGetShippingFeeByFarm, ServiceGetShippingFeeByVendor, ServiceUpdateShippingFee, ServiceDeleteShippingFee, ServiceGetShippingFeeByVendorAndCity, ServiceGetRevỉewByProduct, ServiceGetUserByID, ServiceSetShippingFeeForAllCities, ServiceGetPromotionsByFarmId, ServiceAddBulkPromotion, ServiceGetPromotionsByProduct, ServiceGetUserBlogPosts, ServiceGetAllBlogPosts, ServiceAddBlogPost, ServiceUpdateBlogPost, ServiceDeleteBlogPost, ServiceGetBlogPostByID, ServiceGetPromotionById, ServiceGetAcceptedBlogPosts, ServiceGetProductByChildCategory, ServiceGetAllProductsIncludeIsHidden, ServiceUpdatePassword} = require("../service/userService")


const ControllerRegisterUser = async (req, res) => {
    const  {name, email, password, gender, phone} = req.body;

    const data = await ServiceRegisterUser(name, email, password, gender, phone)
    // console.log(">> test data", req.body);
    
    return res.status(200).json(data); 
    // return res.status(200).json("Dang ky thanh cong")
}

const ControllerLoginUser = async (req, res) => {
    const {email, password} = req.body;

    const data = await ServiceLoginUser(email, password);
    return res.status(200).json(data);
}

const ControllerSalesRegistration = async (req, res) => {
    const {
        user_id,
        farm_name, 
        farm_logo, 
        farm_phone, 
        region_id, 
        city_id, 
        farm_detail, 
        farm_banner
    } = req.body;

    const data = await ServiceSalesRegistration(
        user_id,
        farm_name, 
        farm_logo, 
        farm_phone, 
        region_id, 
        city_id, 
        farm_detail, 
        farm_banner);
    return res.status(200).json(data);
}

// const ControllerUpdateUser = async (req, res) => {
//     const { email, name, oldPassword, newPassword, gender, phone, image, address } = req.body;
    
//     const data = await ServiceUpdateUser(email, name, oldPassword, newPassword, gender, phone, image, address);
//     return res.status(200).json(data);
// };

const ControllerUpdatePassword = async (req, res) => {
    const { email, newPassword } = req.body;
    
    const data = await ServiceUpdatePassword(email, newPassword);
    return res.status(200).json(data);
};

const ControllerUpdateUser = async (req, res) => {
    const { email, name, oldPassword, newPassword, gender, phone, image, region_id, city_id } = req.body;
    
    const data = await ServiceUpdateUser(email, name, oldPassword, newPassword, gender, phone, image, region_id, city_id);
    return res.status(200).json(data);
};

const ControllerGetUser = async (req, res) => {
    const { email} = req.body;
    
    const data = await ServiceGetUser(email);
    return res.status(200).json(data);
};

const ControllerGetUserByID = async (req, res) => {
    const { user_id} = req.body;
    
    const data = await ServiceGetUserByID(user_id);
    return res.status(200).json(data);
};


const ControllerGetProductCategory = async (req, res) => {
    const data = await ServiceGetProductCategory();
    return res.status(200).json(data);
}

//san pham yeu thích
const ControllerGetProductFavouriteById = async (req, res) => {
    const { user_id, product_id } = req.body;
    const data = await ServiceGetProductFavouriteById(user_id, product_id);
    return res.status(200).json(data);
}

const ControllerAddProductFavourite = async (req, res) => {
    const { user_id, product_id } = req.body;
    const data = await ServiceAddProductFavourite(user_id, product_id);
    return res.status(200).json(data);
}

const ControllerRemoveProductFavourite = async (req, res) => {
    const { user_id, product_id } = req.body;
    const data = await ServiceRemoveProductFavourite(user_id, product_id);
    return res.status(200).json(data);
}

//đánh giá

const ControllerGetReviewByProduct = async (req, res) => {
    const { product_id } = req.body;
    const data = await ServiceGetRevỉewByProduct( product_id);
    return res.status(200).json(data);
}

const ControllerAddReview = async (req, res) => {
    const { user_id, product_id, rating, content } = req.body;
    const data = await ServiceAddReview(user_id, product_id, rating, content);
    return res.status(200).json(data);
}

const ControllerUpdateReview = async (req, res) => {
    const { user_id, review_id, rating, content } = req.body;
    const data = await ServiceUpdateReview(user_id, review_id, rating, content);
    return res.status(200).json(data);
}

const ControllerDeleteReview = async (req, res) => {
    const { user_id, review_id } = req.body;
    const data = await ServiceDeleteReview(user_id, review_id);
    return res.status(200).json(data);
}

//mã giảm giá
const ControllerGetPromotionsByFarmId = async (req, res) => {
    const { farm_id } = req.body;
    const data = await ServiceGetPromotionsByFarmId(farm_id);
    return res.status(200).json(data);
}

const ControllerGetPromotionsByProduct = async (req, res) => {
    const {product_id} = req.body;

    const data = await ServiceGetPromotionsByProduct(product_id);
    return res.status(200).json(data);
}

const ControllerGetPromotionByID = async (req, res) => {
    const { promotion_id } = req.body;
    const data = await ServiceGetPromotionById(promotion_id);
    return res.status(200).json(data);
}

const ControllerAddBulkPromotion = async (req, res) => {
    const { product_id, promotion_name, promotion_description, promotion_value, promotion_start_date, promotion_end_date } = req.body;
    const data = await ServiceAddBulkPromotion(product_id, promotion_name, promotion_description, promotion_value, promotion_start_date, promotion_end_date);
    return res.status(200).json(data);
}

const ControllerAddPromotion = async (req, res) => {
    const { product_id, promotion_name, promotion_description, promotion_value, promotion_start_date, promotion_end_date } = req.body;
    const data = await ServiceAddPromotion(product_id, promotion_name, promotion_description, promotion_value, promotion_start_date, promotion_end_date);
    return res.status(200).json(data);
}

const ControllerUpdatePromotion = async (req, res) => {
    const { promotion_id, promotion_name, promotion_description, promotion_value } = req.body;
    const data = await ServiceUpdatePromotion(promotion_id, promotion_name, promotion_description, promotion_value);
    return res.status(200).json(data);
}

const ControllerDeletePromotion = async (req, res) => {
    const { promotion_id } = req.body;
    const data = await ServiceDeletePromotion(promotion_id);
    return res.status(200).json(data);
}

//san pham

// const ControllerGetAllProduct = async (req, res) => {
//     const { page = 1, limit = 10 } = req.query;
//     const data = await ServiceGetAllProducts(page, limit);
//     return res.status(200).json(data);
// }

const ControllerGetAllProduct = async (req, res) => {
    const data = await ServiceGetAllProducts();
    return res.status(200).json(data);
}

const ControllerGetAllProductsIncludeIsHidde = async (req, res) => {
    const data = await ServiceGetAllProductsIncludeIsHidden();
    return res.status(200).json(data);
}

const ControllerGetProductByParentCategory = async (req, res) => {
    const { category_parent_id } = req.body;
    const data = await ServiceGetProductByParentCategory(category_parent_id);
    return res.status(200).json(data);
}

const ControllerGetProductByChildCategory = async (req, res) => {
    const { category_child_id } = req.body;
    const data = await ServiceGetProductByChildCategory(category_child_id);
    return res.status(200).json(data);
}

const ControllerGetProductByUser = async (req, res) => {
    const { product_id } = req.body; 
    
    const data = await ServiceGetProductID(product_id);
    return res.status(200).json(data);
};


const ControllerGetProductByID = async (req, res) => {
    // const { product_id } = req.query; 
    const product_id = req.query.product_id || req.params.product_id;
    
    const data = await ServiceGetProductById(product_id);
    return res.status(200).json(data);
};

const ControllerAddProduct = async (req, res) => {
    const { user_id,
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
        rescue_start_date,
        rescue_end_date} = req.body;
    
    const data = await ServiceAddProduct(user_id,
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
        rescue_start_date,
        rescue_end_date);
    return res.status(200).json(data);
};

const ControllerUpdateProduct = async (req, res) => {
    const { 
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
        rescue_end_date
    } = req.body;
    
    const data = await ServiceUpdateProduct(
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
        rescue_end_date);
    return res.status(200).json(data);
};

const ControllerGetProductsByUser = async (req, res) => {
    const {user_id} = req.body;

    const data = await ServiceGetProductByUser(user_id);
    return res.status(200).json(data);
}

const ControllerHideProduct = async (req, res) => {
    const { product_id, farm_id } = req.body;
    const data = await ServiceHideProduct(product_id, farm_id);
    return res.status(200).json(data);
}

const ControllerDeleteProduct = async (req, res) => {
    const { product_id, farm_id } = req.body;
    const data = await ServiceDeleteProduct(product_id, farm_id);
    return res.status(200).json(data);
}

//phí giao hàng
const ControllerCreateShippingFee = async (req, res) => {
    const { vendor_id, city_id, shipping_cost } = req.body;
    const data = await ServiceCreateShippingFee(vendor_id, city_id, shipping_cost);
    return res.status(200).json(data);
}

const ControllerUpdateShippingFee = async (req, res) => {
    const { shipping_fee_id, shipping_cost } = req.body;
    const data = await ServiceUpdateShippingFee(shipping_fee_id, shipping_cost);
    return res.status(200).json(data);
}

const ControllerDeleteShippingFee = async (req, res) => {
    const { shipping_fee_id } = req.body;
    const data = await ServiceDeleteShippingFee(shipping_fee_id);
    return res.status(200).json(data);
}

const ControllerGetShippingFeeByVendor = async (req, res) => {
    const { vendor_id } = req.body;
    const data = await ServiceGetShippingFeeByVendor(vendor_id);
    return res.status(200).json(data);
}

const ControllerGetShippingFeeByVendorAndCity = async (req, res) => {
    const { vendor_id, city_id } = req.body;
    const data = await ServiceGetShippingFeeByVendorAndCity(vendor_id, city_id);
    return res.status(200).json(data);
}

const ControllerSetShippingFeeForAllCities = async (req, res) => {
    const { vendor_id, shipping_cost } = req.body;
    const data = await ServiceSetShippingFeeForAllCities(vendor_id, shipping_cost);
    return res.status(200).json(data);
}

//bài viết
const ControllerGetAllBlogPosts = async (req, res) => {
    const data = await ServiceGetAllBlogPosts();
    return res.status(200).json(data);
}

const ControllerGetAcceptedBlogs = async (req, res) => {
    const data = await ServiceGetAcceptedBlogPosts();
    return res.status(200).json(data);
};

const ControllerGetUserBlogPosts = async (req, res) => {
    const { user_id } = req.body;
    const data = await ServiceGetUserBlogPosts(user_id);
    return res.status(200).json(data);
}

const ControllerGetBlogPostByID = async (req, res) => {
    const { blog_post_id } = req.body;
    const data = await ServiceGetBlogPostByID(blog_post_id);
    return res.status(200).json(data);
}

const ControllerAddBlogPost = async (req, res) => {
    const { 
        user_id,
        blog_title,
        blog_content,
        blog_image 
    } = req.body;
    const data = await ServiceAddBlogPost(
        user_id,
        blog_title,
        blog_content,
        blog_image
    );
    return res.status(200).json(data);
}

const ControllerUpdateBlogPost = async (req, res) => {
    const {  
        blog_post_id,
        user_id,
        blog_title,
        blog_content,
        blog_image
     } = req.body;
    const data = await ServiceUpdateBlogPost(
        blog_post_id,
        user_id,
        blog_title,
        blog_content,
        blog_image
    );
    return res.status(200).json(data);
}

const ControllerDeleteBlogPost = async (req, res) => {
    const { blog_post_id, user_id } = req.body;
    const data = await ServiceDeleteBlogPost(blog_post_id, user_id);
    return res.status(200).json(data);
}

module.exports = {
    ControllerRegisterUser,
    ControllerLoginUser,
    ControllerSalesRegistration,
    ControllerUpdateUser,
    ControllerGetUser,
    ControllerGetUserByID,
    ControllerUpdatePassword,

    ControllerAddProduct,
    ControllerGetProductsByUser,
    ControllerGetProductCategory,

    //sản phẩm yêu thích
    ControllerGetProductFavouriteById,
    ControllerAddProductFavourite,
    ControllerRemoveProductFavourite,
    //danh gia
    ControllerGetReviewByProduct,
    ControllerAddReview,
    ControllerUpdateReview,
    ControllerDeleteReview,
    //ma giam gia
    ControllerGetPromotionsByFarmId,
    ControllerGetPromotionsByProduct,
    ControllerGetPromotionByID,
    ControllerAddBulkPromotion,
    ControllerAddPromotion,
    ControllerUpdatePromotion,
    ControllerDeletePromotion,
    //san pham
    ControllerGetProductByID,
    ControllerGetAllProduct,
    ControllerGetAllProductsIncludeIsHidde,
    ControllerUpdateProduct,
    ControllerGetProductByParentCategory,
    ControllerGetProductByChildCategory,
    ControllerHideProduct,
    ControllerDeleteProduct,
    
    //phí giao hàng
    ControllerCreateShippingFee,
    ControllerUpdateShippingFee,
    ControllerDeleteShippingFee,
    ControllerGetShippingFeeByVendor,
    ControllerGetShippingFeeByVendorAndCity,
    ControllerSetShippingFeeForAllCities,

    //bài viết
    ControllerGetAcceptedBlogs,
    ControllerGetAllBlogPosts,
    ControllerGetUserBlogPosts,
    ControllerGetBlogPostByID,
    ControllerAddBlogPost,
    ControllerUpdateBlogPost,
    ControllerDeleteBlogPost,
}