const express = require("express");
const {
    ControllerGetAllUser,
    ControllerPostBlockUser,
    ControllerGetAllFarmerApplication,
    ControllerApproveFarmer,
    ControllerRejectFarmer,
    ControllerLoginAdmin,
    ControllerRegisterAdmin,
    ControllerAddParentCategory,
    ControllerDeleteParentCategory,
    ControllerGetAllParentCategories,
    ControllerAddChildCategory,
    ControllerGetAllChildCategories,
    ControllerDeleteChildCategory,
    ControllerGet1ParentCategory,
    ControllerGet1ChildCategory,
    ControllerAddCultivation,
    ControllerUpdateCultivation,
    ControllerDeleteCultivation,
    ControllerAddFeature,
    ControllerUpdateFeature,
    ControllerDeleteFeature,
    ControllerGetAllCultivation,
    ControllerGetAllFeature,
    ControllerGetParentCategoryById,
    ControllerGetChildCategoryById,
    ControllerGetCultivationById,
    ControllerGetFeatureById,
    ControllerGetAllRegion,
    ControllerAddRegion,
    ControllerUpdateRegione,
    ControllerDeleteRegion,
    ControllerGetAllCity,
    ControllerAddCity,
    ControllerUpdateCity,
    ControllerDeleteCity,
    ControllerGetAllPaymentMethod,
    ControllerAddPaymentMethod,
    ControllerUpdatePaymentMethod,
    ControllerDeletePaymentMethod,
    ControllerGetRegionById,
    ControllerGetCityById,
    ControllerCreateOrder,
    ControllerUpdateOrderStatus,
    ControllerGetOrdersByCustomer,
    ControllerGetOrdersByFarm,
    ControllerGetOrderTotal,
    ControllerCreateOrderDetail,
    ControllerGetOrderDetails,
    ControllerGetPaymentMethodById,
    ControllerGetOrderDetailByUser,
    ControllerAcceptOrder,
    ControllerRejectOrder,
    ControllerApproveBlogPost,
    ControllerRejectBlogPost,
    ControllerGetApprovalByBlogPostID,
    ControllerGetOrderDetailByProduct,
    ControllerDeleteOrder,
    ControllerGetAllSalesman,
} = require("../controllers/adminController");
const { ServiceRejectOrder } = require("../service/adminService");
const axios = require("axios");
const Order = require("../models/order");
const PaymentMethod = require("../models/paymentMethod");

const adminRouterAPI = express.Router();

adminRouterAPI.get("/getAllUser", ControllerGetAllUser);
adminRouterAPI.get("/getAllFarmerApplication", ControllerGetAllFarmerApplication);
adminRouterAPI.get("/getAllSalesman", ControllerGetAllSalesman);

adminRouterAPI.post("/adminLogin", ControllerLoginAdmin);
adminRouterAPI.post("/adminRegister", ControllerRegisterAdmin);

adminRouterAPI.put("/putBlockUser", ControllerPostBlockUser);
adminRouterAPI.put("/approveFarmer", ControllerApproveFarmer);
adminRouterAPI.put("/rejectFarmer", ControllerRejectFarmer);

adminRouterAPI.post("/getParentCategoryById", ControllerGetParentCategoryById);
adminRouterAPI.get("/getAllCategoryParent", ControllerGetAllParentCategories);
adminRouterAPI.post("/get1CategoryParent", ControllerGet1ParentCategory);
adminRouterAPI.post("/addCategoryParent", ControllerAddParentCategory);
adminRouterAPI.delete("/deleteCategoryParent", ControllerDeleteParentCategory);

adminRouterAPI.post("/getChildCategoryById", ControllerGetChildCategoryById);
adminRouterAPI.get("/getAllCategoryChild", ControllerGetAllChildCategories);
adminRouterAPI.post("/get1CategoryChild", ControllerGet1ChildCategory);
adminRouterAPI.post("/addCategoryChild", ControllerAddChildCategory);
adminRouterAPI.delete("/deleteCategoryChild", ControllerDeleteChildCategory);

//hình thức canh tác
adminRouterAPI.post("/getCultivationById", ControllerGetCultivationById);
adminRouterAPI.get("/getAllCultivation", ControllerGetAllCultivation);
adminRouterAPI.post("/addCultivation", ControllerAddCultivation);
adminRouterAPI.put("/updateCultivation", ControllerUpdateCultivation);
adminRouterAPI.delete("/deleteCultivation", ControllerDeleteCultivation);

//tính chất
adminRouterAPI.post("/getFeatureByID", ControllerGetFeatureById);
adminRouterAPI.get("/getAllFeature", ControllerGetAllFeature);
adminRouterAPI.post("/addFeature", ControllerAddFeature);
adminRouterAPI.put("/updateFeature", ControllerUpdateFeature);
adminRouterAPI.delete("/deleteFeature", ControllerDeleteFeature);

//vùng miền
adminRouterAPI.post("/getRegionById", ControllerGetRegionById);
adminRouterAPI.get("/getAllRegion", ControllerGetAllRegion);
adminRouterAPI.post("/addRegion", ControllerAddRegion);
adminRouterAPI.put("/updateRegion", ControllerUpdateRegione);
adminRouterAPI.delete("/deleteRegion", ControllerDeleteRegion);

//thành phố
adminRouterAPI.post("/getCityById", ControllerGetCityById);
adminRouterAPI.get("/getAllCity", ControllerGetAllCity);
adminRouterAPI.post("/addCity", ControllerAddCity);
adminRouterAPI.put("/updateCity", ControllerUpdateCity);
adminRouterAPI.delete("/deleteCity", ControllerDeleteCity);

//phương thức thanh toán
adminRouterAPI.post("/getPaymentMethodById", ControllerGetPaymentMethodById);
adminRouterAPI.get("/getAllPaymentMethod", ControllerGetAllPaymentMethod);
adminRouterAPI.post("/addPaymentMethod", ControllerAddPaymentMethod);
adminRouterAPI.put("/updatePaymentMethod", ControllerUpdatePaymentMethod);
adminRouterAPI.delete("/deletePaymentMethod", ControllerDeletePaymentMethod);

//đơn hàng
adminRouterAPI.post("/createOrder", ControllerCreateOrder);
adminRouterAPI.put("/updateOrderStatus", ControllerUpdateOrderStatus);
adminRouterAPI.put("/acceptOrder", ControllerAcceptOrder);
adminRouterAPI.put("/rejectOrder", ControllerRejectOrder);
adminRouterAPI.post("/getOrderByCustomer", ControllerGetOrdersByCustomer);
adminRouterAPI.post("/getOrderByFarm", ControllerGetOrdersByFarm);
adminRouterAPI.post("/getOrderTotal", ControllerGetOrderTotal);
adminRouterAPI.delete("/deleteOrder", ControllerDeleteOrder);

//chi tiết đơn hàng
adminRouterAPI.post("/createOrderDetail", ControllerCreateOrderDetail);
adminRouterAPI.post("/getOrderDetail", ControllerGetOrderDetails);
adminRouterAPI.post("/getOrderDetailByUser", ControllerGetOrderDetailByUser);
adminRouterAPI.post("/getOrderDetailByProduct", ControllerGetOrderDetailByProduct);

//duyệt bài viết
adminRouterAPI.put("/getApprovalByBlogPostID", ControllerGetApprovalByBlogPostID);
adminRouterAPI.put("/approveBlogPost", ControllerApproveBlogPost);
adminRouterAPI.put("/rejectBlogPost", ControllerRejectBlogPost);

adminRouterAPI.post("/payment", async (req, res) => {
    const { order_id, payment_method_id } = req.body;
    console.log("order_id: ", order_id);
    console.log("payment_method_id: ", payment_method_id);
    
    if (!order_id || !payment_method_id) {
        return res.status(400).json({
            statusCode: 400,
            message: "order_id and payment_method_id are required"
        });
    }
    
    // Tìm order và payment method trong database
    const order = await Order.findOne({ order_id: order_id });
    const paymentMethod = await PaymentMethod.findOne({ payment_method_id: payment_method_id });
    
    if (!order) {
        return res.status(404).json({
            statusCode: 404,
            message: "Order not found"
        });
    }

    if (!paymentMethod) {
        return res.status(404).json({
            statusCode: 404,
            message: "Payment method not found"
        });
    }

    // Cập nhật order với payment method
    order.payment_method_id = payment_method_id;
    order.order_status = "waiting";
    const updatedOrder = await order.save();

    // Nếu là thanh toán tiền mặt, trả về updated order
    if (payment_method_id === "6736afd3666338c0208f33ca" ) {
        return res.status(200).json({
            data: updatedOrder,
            message: "Thanh toán bằng tiền mặt thành công"
        });
    }

    // Nếu là thanh toán MoMo, tiếp tục xử lý
    if (paymentMethod.method_name.toLowerCase() === "momo") {
        //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
        var accessKey = "F8BBA842ECF85";
        var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
        var orderInfo = "pay with MoMo";
        var partnerCode = "MOMO";
        var redirectUrl = "http://localhost:3000/User";
        var ipnUrl = "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
        var requestType = "payWithMethod";
        var amount = order.total_amount;
        var orderId = partnerCode + new Date().getTime();
        var requestId = orderId;
        var extraData = "";
        var orderGroupId = "";
        var autoCapture = true;
        var lang = "vi";

        var rawSignature =
            "accessKey=" +
            accessKey +
            "&amount=" +
            amount +
            "&extraData=" +
            extraData +
            "&ipnUrl=" +
            ipnUrl +
            "&orderId=" +
            orderId +
            "&orderInfo=" +
            orderInfo +
            "&partnerCode=" +
            partnerCode +
            "&redirectUrl=" +
            redirectUrl +
            "&requestId=" +
            requestId +
            "&requestType=" +
            requestType;

        console.log("--------------------RAW SIGNATURE----------------");
        console.log(rawSignature);

        const crypto = require("crypto");
        var signature = crypto
            .createHmac("sha256", secretKey)
            .update(rawSignature)
            .digest("hex");
        
        console.log("--------------------SIGNATURE----------------");
        console.log(signature);

        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            partnerName: "Test",
            storeId: "MomoTestStore",
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            lang: lang,
            requestType: requestType,
            autoCapture: autoCapture,
            extraData: extraData,
            orderGroupId: orderGroupId,
            signature: signature,
        });

        const options = {
            method: "POST",
            url: "https://test-payment.momo.vn/v2/gateway/api/create",
            headers: {
                'Content-Type': "application/json",
                'Content-Length': Buffer.byteLength(requestBody)
            },
            data: requestBody
        };

        try {
            const result = await axios(options);
            return res.status(200).json({
                data: updatedOrder,
                momo: result.data,
            });
        } catch (error) {
            return res.status(500).json({
                statusCode: 500,
                message: error
            });
        }
    }

    // Nếu payment method không phải cash hoặc momo
    return res.status(400).json({
        statusCode: 400,
        message: "Lỗi thanh toán"
    });
});


module.exports = adminRouterAPI;
