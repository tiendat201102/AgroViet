const vnpayConfig = {
    vnp_TmnCode: "2QXUI4J4",  // Mã test mặc định của VNPAY
    vnp_HashSecret: "NRPUQFBKRXYLWSGKGZFWPISFRTXBXVXD", // Key test mặc định của VNPAY
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", // URL sandbox
    vnp_ReturnUrl: "http://localhost:3000/Cart", // URL local của bạn
    vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
};

module.exports = vnpayConfig;