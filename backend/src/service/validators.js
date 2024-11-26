// validators.js

const bcrypt = require("bcrypt");

const isPasswordStrong = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

const isEmailValidation = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

const isPhoneValid = (phone) => {
    phone = phone.toString();
    if (!phone || typeof phone !== 'string') {
        return false;
    }

    const phoneRegex = /^0[3-9]\d{8}$/;
    const isValid = phoneRegex.test(phone);
    
    return isValid;
};

const checkExistingShippingFee = async (vendor_id, city_id) => {
    const existingFee = await ShippingFee.findOne({
        vendor_id: vendor_id,
        city_id: city_id
    });
    return existingFee;
};

module.exports = {
    isPasswordStrong,
    isEmailValidation,
    isPhoneValid,
    checkExistingShippingFee
};
