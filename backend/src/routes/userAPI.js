const express = require('express');
const { getHomepage } = require ("../controllers/homeController");
const { ControllerRegisterUser, ControllerLoginUser, ControllerSalesRegistration, ControllerUpdateUser, ControllerGetUser, ControllerAddProduct, ControllerGetProductsByUser, ControllerGetProductCategory, ControllerAddProductFavourite, ControllerRemoveProductFavourite, ControllerAddReview, ControllerUpdateReview, ControllerDeleteReview, ControllerAddPromotion, ControllerDeletePromotion, ControllerUpdatePromotion, ControllerGetAllProduct, ControllerGetProductByID, ControllerUpdateProduct, ControllerGetProductByParentId, ControllerGetProductByParentCategory, ControllerHideProduct, ControllerDeleteProduct, ControllerGetProductFavouriteById, ControllerCreateShippingFee, ControllerGetShippingFeeByFarm, ControllerGetShippingFeeByVendor, ControllerDeleteShippingFee, ControllerUpdateShippingFee, ControllerGetShippingFeeByVendorAndCity, ControllerGetReviewByProduct, ControllerGetUserByID, ControllerSetShippingFeeForAllCities, ControllerAddBulkPromotion, ControllerGetPromotionsByFarmId, ControllerGetPromotionsByProduct, ControllerGetAllBlogPosts, ControllerGetUserBlogPosts, ControllerAddBlogPost, ControllerUpdateBlogPost, ControllerDeleteBlogPost, ControllerGetBlogPostByID, ControllerGetPromotionByID, ControllerGetAcceptedBlogs, ControllerGetProductByChildCategory, ControllerGetAllProductsIncludeIsHidde, ControllerUpdatePassword } = require('../controllers/userController');

// const multer = require('multer');
// const upload = multer({ storage: multer.memoryStorage() });


const userRouterAPI = express.Router();

userRouterAPI.get("/", getHomepage);
// userRouterAPI.get("/", (req, res) => {
//     return res.status(200).json("hello")
// });




userRouterAPI.post("/register", ControllerRegisterUser);
userRouterAPI.post("/login", ControllerLoginUser);
userRouterAPI.post("/addProduct", ControllerAddProduct);
userRouterAPI.post("/updatePassword", ControllerUpdatePassword);


userRouterAPI.post("/getUser", ControllerGetUser);
userRouterAPI.post("/getUserByID", ControllerGetUserByID);


userRouterAPI.post("/salesRegistration", ControllerSalesRegistration);
userRouterAPI.put("/updateUser", ControllerUpdateUser);

//san pham yeu thich
userRouterAPI.post("/getProductFavouriteById", ControllerGetProductFavouriteById);
userRouterAPI.post("/addProductFavourite", ControllerAddProductFavourite);
userRouterAPI.delete("/deleteProductFavourite", ControllerRemoveProductFavourite);

//danh gia
userRouterAPI.post("/getReviewByProduct", ControllerGetReviewByProduct);
userRouterAPI.post("/addReview", ControllerAddReview);
userRouterAPI.put("/updateReview", ControllerUpdateReview);
userRouterAPI.delete("/deleteReview", ControllerDeleteReview);

//ma giam gia
userRouterAPI.post("/getPromotionsByFarmId", ControllerGetPromotionsByFarmId);
userRouterAPI.post("/getPromotionsByProduct", ControllerGetPromotionsByProduct);
userRouterAPI.post("/getPromotionsByID", ControllerGetPromotionByID);
userRouterAPI.post("/addBulkPromotion", ControllerAddBulkPromotion);
userRouterAPI.post("/addPromotion", ControllerAddPromotion);
userRouterAPI.put("/updatePromotion", ControllerUpdatePromotion);
userRouterAPI.delete("/deletePromotion", ControllerDeletePromotion);

//san pham
// userRouterAPI.get("/getProductById", ControllerGetProductById);
userRouterAPI.get("/getProductByID/:product_id", ControllerGetProductByID);
userRouterAPI.get("/getAllProduct", ControllerGetAllProduct);
userRouterAPI.get("/getAllProductIncludeIsHidden", ControllerGetAllProductsIncludeIsHidde);
userRouterAPI.put("/updateProduct", ControllerUpdateProduct);
userRouterAPI.post("/getProductByParentCategory", ControllerGetProductByParentCategory);
userRouterAPI.post("/getProductByChildCategory", ControllerGetProductByChildCategory);
userRouterAPI.post("/getProductsByUser", ControllerGetProductsByUser);
// userRouterAPI.get("/getProductCategory", ControllerGetProductCategory);
userRouterAPI.put("/hideProduct", ControllerHideProduct);
userRouterAPI.delete("/deleteProduct", ControllerDeleteProduct);

//phí giao hàng
userRouterAPI.post("/createShippingFee", ControllerCreateShippingFee);
userRouterAPI.put("/updateShippingFeeByVendor", ControllerUpdateShippingFee);
userRouterAPI.delete("/deleteShippingFeeByVendor", ControllerDeleteShippingFee);
userRouterAPI.post("/getShippingFeeByVendor", ControllerGetShippingFeeByVendor);
userRouterAPI.post("/getShippingFeeByVendorAndCity", ControllerGetShippingFeeByVendorAndCity);
userRouterAPI.post("/setShippingFeeForAllCities", ControllerSetShippingFeeForAllCities);

//bài viết
userRouterAPI.get("/getAllBlogPosts", ControllerGetAllBlogPosts);
userRouterAPI.get("/getAcceptedBlogs", ControllerGetAcceptedBlogs);
userRouterAPI.post("/getUserBlogPosts", ControllerGetUserBlogPosts);
userRouterAPI.post("/getBlogPostByID", ControllerGetBlogPostByID);
userRouterAPI.post("/addBlogPost", ControllerAddBlogPost);
userRouterAPI.put("/updateBlogPost", ControllerUpdateBlogPost);
userRouterAPI.delete("/deleteBlogPost", ControllerDeleteBlogPost);



module.exports = userRouterAPI;
