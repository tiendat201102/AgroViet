const {
    ServicegetAllUser,
    ServicePostBlockUser,
    ServiceGetFarmerApplications,
    ServiceApproveFarmer,
    ServiceRejectFarmer,
    ServiceRegisterAdmin,
    ServiceLoginAdmin,
    ServiceAddParentCategory,
    ServiceDeleteParentCategory,
    ServiceGetAllParentCategories,
    ServiceAddChildCategory,
    ServiceGetAllChildCategories,
    ServiceDeleteChildCategory,
    ServiceGet1ParentCategories,
    ServiceGet1ChildCategories,
    ServiceAddCultivation,
    ServiceUpdateCultivation,
    ServiceDeleteCultivation,
    ServiceDeleteFeature,
    ServiceUpdateFeature,
    ServiceAddFeature,
    ServiceGetAllCultivations,
    ServiceGetAllFeatures,
    ServiceGetFeatureById,
    ServiceGetChildCategoryById,
    ServiceGetCultivationById,
    ServiceGetParentCategoryById,
    ServiceGetAllRegion,
    ServiceAddRegion,
    ServiceUpdateRegion,
    ServiceDeleteRegion,
    ServiceGetAllCities,
    ServiceAddCity,
    ServiceUpdateCity,
    ServiceDeleteCity,
    ServiceGetAllPaymentMethods,
    ServiceAddPaymentMethod,
    ServiceDeletePaymentMethod,
    ServiceGetCityById,
    ServiceGetRegionById,
    ServiceUpdatePaymentMethod,
    ServiceCreateOrder,
    ServiceUpdateOrderStatus,
    ServiceGetOrdersByCustomer,
    ServiceGetOrdersByFarm,
    ServiceGetOrderTotal,
    ServiceGetOrderDetails,
    ServiceCreateOrderDetail,
    ServiceGetPaymentMethodById,
    ServiceGetOrderDetailByUser,
    ServiceRejectOrder,
    ServiceAcceptOrder,
    ServiceApproveBlogPost,
    ServiceRejectBlogPost,
    ServiceGetApprovalByBlogPostID,
    ServiceGetOrderDetailByProduct,
    ServiceDeleteOrder,
    ServiceGetAllSalesman,
} = require("../service/adminService");

//Người dùng
const ControllerGetAllUser = async (req, res) => {
    const data = await ServicegetAllUser();
    return res.status(200).json(data);
};

const ControllerPostBlockUser = async (req, res) => {
    const { email } = req.body;

    const data = await ServicePostBlockUser(email);
    return res.status(200).json(data);
};

const ControllerGetAllFarmerApplication = async (req, res) => {
    const data = await ServiceGetFarmerApplications();
    return res.status(200).json(data);
};

const ControllerApproveFarmer = async (req, res) => {
    const { email } = req.body;

    const data = await ServiceApproveFarmer(email);
    return res.status(200).json(data);
};

const ControllerRejectFarmer = async (req, res) => {
    const { email, rejection_reason } = req.body;

    const data = await ServiceRejectFarmer(email, rejection_reason);
    return res.status(200).json(data);
};

const ControllerLoginAdmin = async (req, res) => {
    const { email, password, isAdmin } = req.body;

    const data = await ServiceLoginAdmin(email, password, isAdmin);
    return res.status(200).json(data);
};

const ControllerRegisterAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    const data = await ServiceRegisterAdmin(name, email, password);
    return res.status(200).json(data);
};

const ControllerGetAllSalesman = async (req, res) => {
    const data = await ServiceGetAllSalesman();
    return res.status(200).json(data);
};

//Sản phẩm
//danh muc cha
const ControllerGetParentCategoryById = async (req, res) => {
    const { category_parent_id } = req.body;
    const data = await ServiceGetParentCategoryById(category_parent_id);
    return res.status(200).json(data);
};

const ControllerAddParentCategory = async (req, res) => {
    const { category_parent_name } = req.body;
    const data = await ServiceAddParentCategory(category_parent_name);
    return res.status(200).json(data);
};

const ControllerDeleteParentCategory = async (req, res) => {
    const { category_parent_id } = req.body;
    const data = await ServiceDeleteParentCategory(category_parent_id);
    return res.status(200).json(data);
};

const ControllerGetAllParentCategories = async (req, res) => {
    const data = await ServiceGetAllParentCategories();
    return res.status(200).json(data);
};

const ControllerGet1ParentCategory = async (req, res) => {
    const { category_parent_id } = req.body;
    const data = await ServiceGet1ParentCategories(category_parent_id);
    return res.status(200).json(data);
};

//danh muc con
const ControllerGetChildCategoryById = async (req, res) => {
    const { category_child_id } = req.body;
    const data = await ServiceGetChildCategoryById(category_child_id);
    return res.status(200).json(data);
};

const ControllerAddChildCategory = async (req, res) => {
    const { category_parent_id, category_child_name } = req.body;
    const data = await ServiceAddChildCategory(category_parent_id, category_child_name);
    return res.status(200).json(data);
};

const ControllerGetAllChildCategories = async (req, res) => {
    const data = await ServiceGetAllChildCategories();
    return res.status(200).json(data);
};

const ControllerDeleteChildCategory = async (req, res) => {
    const { category_child_id } = req.body;
    const data = await ServiceDeleteChildCategory(category_child_id);
    return res.status(200).json(data);
};

const ControllerGet1ChildCategory = async (req, res) => {
    const { category_child_id } = req.body;
    const data = await ServiceGet1ChildCategories(category_child_id);
    return res.status(200).json(data);
};

//hinh thức canh tác
const ControllerGetCultivationById = async (req, res) => {
    const { cultivation_id } = req.body;
    const data = await ServiceGetCultivationById(cultivation_id);
    return res.status(200).json(data);
};

const ControllerGetAllCultivation = async (req, res) => {
    const data = await ServiceGetAllCultivations();
    return res.status(200).json(data);
};

const ControllerAddCultivation = async (req, res) => {
    const { method_name } = req.body;
    const data = await ServiceAddCultivation(method_name);
    return res.status(200).json(data);
};

const ControllerUpdateCultivation = async (req, res) => {
    const { cultivation_id, method_name } = req.body;
    const data = await ServiceUpdateCultivation( cultivation_id, method_name );
    return res.status(200).json(data);
};

const ControllerDeleteCultivation = async (req, res) => {
    const { cultivation_id } = req.body;
    const data = await ServiceDeleteCultivation(cultivation_id);
    return res.status(200).json(data);
};


//tính chất
const ControllerGetFeatureById = async (req, res) => {
    const { feature_id } = req.body;
    const data = await ServiceGetFeatureById(feature_id);
    return res.status(200).json(data);
};

const ControllerGetAllFeature = async (req, res) => {
    const data = await ServiceGetAllFeatures();
    return res.status(200).json(data);
};

const ControllerAddFeature = async (req, res) => {
    const { feature_name } = req.body;
    const data = await ServiceAddFeature(feature_name);
    return res.status(200).json(data);
};

const ControllerUpdateFeature = async (req, res) => {
    const { feature_id, feature_name } = req.body;
    const data = await ServiceUpdateFeature(feature_id, feature_name);
    return res.status(200).json(data);
};

const ControllerDeleteFeature = async (req, res) => {
    const { feature_id } = req.body;
    const data = await ServiceDeleteFeature(feature_id);
    return res.status(200).json(data);
};

//vùng miền
const ControllerGetRegionById = async (req, res) => {
    const { region_id } = req.body;
    const data = await ServiceGetRegionById(region_id);
    return res.status(200).json(data);
};

const ControllerGetAllRegion = async (req, res) => {
    const data = await ServiceGetAllRegion();
    return res.status(200).json(data);
};

const ControllerAddRegion = async (req, res) => {
    const { region_name } = req.body;
    const data = await ServiceAddRegion(region_name);
    return res.status(200).json(data);
};

const ControllerUpdateRegione = async (req, res) => {
    const { region_id, region_name } = req.body;
    const data = await ServiceUpdateRegion(region_id, region_name);
    return res.status(200).json(data);
};

const ControllerDeleteRegion = async (req, res) => {
    const { region_id } = req.body;
    const data = await ServiceDeleteRegion(region_id);
    return res.status(200).json(data);
};

//thành phố
const ControllerGetCityById = async (req, res) => {
    const { city_id } = req.body;
    const data = await ServiceGetCityById(city_id);
    return res.status(200).json(data);
};

const ControllerGetAllCity = async (req, res) => {
    const data = await ServiceGetAllCities();
    return res.status(200).json(data);
};

const ControllerAddCity = async (req, res) => {
    const { region_id, city_name } = req.body;
    const data = await ServiceAddCity(region_id, city_name);
    return res.status(200).json(data);
};

const ControllerUpdateCity = async (req, res) => {
    const { city_id, city_name } = req.body;
    const data = await ServiceUpdateCity(city_id, city_name);
    return res.status(200).json(data);
};

const ControllerDeleteCity = async (req, res) => {
    const { city_id } = req.body;
    const data = await ServiceDeleteCity(city_id);
    return res.status(200).json(data);
};

//phương thức thanh toán
const ControllerGetPaymentMethodById = async (req, res) => {
    const { payment_method_id } = req.body;
    const data = await ServiceGetPaymentMethodById(payment_method_id);
    return res.status(200).json(data);
};

const ControllerGetAllPaymentMethod = async (req, res) => {
    const data = await ServiceGetAllPaymentMethods();
    return res.status(200).json(data);
};

const ControllerAddPaymentMethod = async (req, res) => {
    const { method_name } = req.body;
    const data = await ServiceAddPaymentMethod(method_name);
    return res.status(200).json(data);
};

const ControllerUpdatePaymentMethod = async (req, res) => {
    const { payment_method_id, method_name } = req.body;
    const data = await ServiceUpdatePaymentMethod(payment_method_id, method_name);
    return res.status(200).json(data);
};

const ControllerDeletePaymentMethod = async (req, res) => {
    const { payment_method_id } = req.body;
    const data = await ServiceDeletePaymentMethod(payment_method_id);
    return res.status(200).json(data);
};

//đơn hàng
const ControllerCreateOrder = async (req, res) => {
    const { customer_id, farm_id, shipping_fee_id, total_amount } = req.body;
    const data = await ServiceCreateOrder(customer_id, farm_id, shipping_fee_id, total_amount);
    return res.status(200).json(data);
};

const ControllerUpdateOrderStatus = async (req, res) => {
    const { order_id } = req.body;
    const data = await ServiceUpdateOrderStatus(order_id);
    return res.status(200).json(data);
};

const ControllerAcceptOrder = async (req, res) => {
    const { order_id } = req.body;
    const data = await ServiceAcceptOrder(order_id);
    return res.status(200).json(data);
};

const ControllerRejectOrder = async (req, res) => {
    const { order_id, rejection_reason } = req.body;
    const data = await ServiceRejectOrder(order_id, rejection_reason);
    return res.status(200).json(data);
};

const ControllerGetOrdersByCustomer = async (req, res) => {
    const { customer_id } = req.body;
    const data = await ServiceGetOrdersByCustomer(customer_id);
    return res.status(200).json(data);
};

const ControllerGetOrdersByFarm = async (req, res) => {
    const { farm_id } = req.body;
    const data = await ServiceGetOrdersByFarm(farm_id);
    return res.status(200).json(data);
};

const ControllerGetOrderTotal = async (req, res) => {
    const { order_id } = req.body;
    const data = await ServiceGetOrderTotal(order_id);
    return res.status(200).json(data);
};

const ControllerDeleteOrder = async (req, res) => {
    const { order_id } = req.body;
    const data = await ServiceDeleteOrder(order_id);
    return res.status(200).json(data);
};

//chi tiết đơn hàng

const ControllerCreateOrderDetail = async (req, res) => {
    const { order_id, product_id, product_quantity, price } = req.body;
    const data = await ServiceCreateOrderDetail(order_id, product_id, product_quantity, price);
    return res.status(200).json(data);
};

const ControllerGetOrderDetails = async (req, res) => {
    const { order_id } = req.body;
    const data = await ServiceGetOrderDetails(order_id);
    return res.status(200).json(data);
};

const ControllerGetOrderDetailByUser = async (req, res) => {
    const { customer_id } = req.body;
    const data = await ServiceGetOrderDetailByUser(customer_id);
    return res.status(200).json(data);
};

const ControllerGetOrderDetailByProduct = async (req, res) => {
    const { product_id } = req.body;
    const data = await ServiceGetOrderDetailByProduct(product_id);
    return res.status(200).json(data);
};

//duyệt bài viết
const ControllerApproveBlogPost = async (req, res) => {
    const { blog_post_id } = req.body;
    const data = await ServiceApproveBlogPost(blog_post_id);
    return res.status(200).json(data);
};

const ControllerGetApprovalByBlogPostID = async (req, res) => {
    const { blog_post_id } = req.body;
    const data = await ServiceGetApprovalByBlogPostID(blog_post_id);
    return res.status(200).json(data);
};

const ControllerRejectBlogPost = async (req, res) => {
    const { blog_post_id, rejection_reason } = req.body;
    const data = await ServiceRejectBlogPost(blog_post_id, rejection_reason);
    return res.status(200).json(data);
};



module.exports = {
    //Người dùng
    ControllerGetAllUser,
    ControllerPostBlockUser,
    ControllerGetAllFarmerApplication,
    ControllerApproveFarmer,
    ControllerRejectFarmer,
    ControllerLoginAdmin,
    ControllerRegisterAdmin,
    ControllerGetAllSalesman,

    //Sản phẩm
    ControllerGetParentCategoryById,
    ControllerAddParentCategory,
    ControllerDeleteParentCategory,
    ControllerGetAllParentCategories,
    ControllerGet1ParentCategory,

    ControllerGetChildCategoryById,
    ControllerAddChildCategory,
    ControllerGetAllChildCategories,
    ControllerDeleteChildCategory,
    ControllerGet1ChildCategory,

    //hinh thức canh tác
    ControllerGetCultivationById,
    ControllerGetAllCultivation,
    ControllerAddCultivation,
    ControllerUpdateCultivation,
    ControllerDeleteCultivation,
    //tính chất
    ControllerGetFeatureById,
    ControllerGetAllFeature,
    ControllerAddFeature,
    ControllerUpdateFeature,
    ControllerDeleteFeature,

    //vùng miền
    ControllerGetRegionById,
    ControllerGetAllRegion,
    ControllerAddRegion,
    ControllerUpdateRegione,
    ControllerDeleteRegion,

    //thành phố
    ControllerGetCityById,
    ControllerGetAllCity,
    ControllerAddCity,
    ControllerUpdateCity,
    ControllerDeleteCity,

    //phương thức thanh toán
    ControllerGetPaymentMethodById,
    ControllerGetAllPaymentMethod,
    ControllerAddPaymentMethod,
    ControllerUpdatePaymentMethod,
    ControllerDeletePaymentMethod,

    //đơn hàng
    ControllerCreateOrder,
    ControllerUpdateOrderStatus,
    ControllerGetOrdersByCustomer,
    ControllerGetOrdersByFarm,
    ControllerGetOrderTotal,
    ControllerAcceptOrder,
    ControllerRejectOrder,
    ControllerDeleteOrder,

    //chi tiết đơn hàng
    ControllerCreateOrderDetail,
    ControllerGetOrderDetails,
    ControllerGetOrderDetailByUser,
    ControllerGetOrderDetailByProduct,

    //duyệt bài viết
    ControllerGetApprovalByBlogPostID,
    ControllerApproveBlogPost,
    ControllerRejectBlogPost,
};
