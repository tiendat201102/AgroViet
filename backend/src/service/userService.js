require("dotenv").config();
const User = require("../models/user");
const Role = require("../models/role");
const Product = require("../models/product")

const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const { isPasswordStrong, isEmailValidation, isPhoneValid } = require("./validators");
const CategoryChild = require("../models/categoryChild");
const CategoryParent = require("../models/categoryParent");
const ProductFavourite = require("../models/productFavourite");
const Review = require("../models/review");
const Promotion = require("../models/promotion");
const Cultivation = require("../models/formOfCultivation");
const Feature = require("../models/feature")
const Region = require("../models/region")
const City = require("../models/city")
const ShippingFee = require("../models/shippingFee")
const BlogPost = require("../models/blogPost")
const Approval = require("../models/approval");



const ServiceRegisterUser = async (name, email, password, gender, phone) => {
    // const isPasswordStrong = (password) => {
    //     const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    //     return passwordRegex.test(password);
    // };

    // const isEmailValidation = (email) => {
    //     const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    //     return emailRegex.test(email);
    // }

    // const isPhoneValid = (phone) => {
    //     phone = phone.toString();
    //     if (!phone || typeof phone !== 'string') {
    //         return false;
    //     }

    //     const phoneRegex = /^0[3-9]\d{8}$/;
    //     const isValid = phoneRegex.test(phone);
    //     console.log('Phone validation:', {
    //         phone,
    //         length: phone.length,
    //         isValid
    //     });

    //     return isValid;
    // }

    try {
        // Kiểm tra xem người dùng đã tồn tại chưa
        const user = await User.findOne({ email });
        if (user) {
            console.log(`User exists: ${email}`);
            return { success: false, message: "Email đã tồn tại." };
        }

        if (!isEmailValidation(email)) {
            return { success: false, message: "Vui lòng nhập đúng định dạng của email" };
        }

        // Kiểm tra tính hợp lệ của mật khẩu
        if (!isPasswordStrong(password)) {
            return { success: false, message: "Mật khẩu phải chứa ít nhất 6 ký tự, bao gồm chữ cái, số và ký tự đặc biệt." };
        }

        if (!isPhoneValid(phone)) {
            return { success: false, message: "Số điện thoại không hợp lệ" };
        }

        // Tìm vai trò USER trong bảng Role
        const userRole = await Role.findOne({ name: "USER" });
        if (!userRole) {
            return { success: false, message: "Vai trò USER không tồn tại." };
        }

        // Hash mật khẩu người dùng
        const hashPassword = await bcrypt.hash(password, saltRounds);

        // Lưu người dùng vào cơ sở dữ liệu
        const newUser = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            user_role_id: userRole._id,
            isAdmin: false,
            phone: phone,
            gender: gender,
        });
        await newUser.populate("user_role_id");

        console.log("Created user:", {
            user_id: newUser.user_id,
            name: newUser.name,
            email: newUser.email,
            user_role_id: newUser.user_role_id.name,
            gender: newUser.gender,
            phone: newUser.phone,
        });

        return {
            success: true,
            message: "Tạo tài khoản thành công",
            data: {
                name: newUser.name,
                email: newUser.email,
                user_role_id: newUser.user_role_id.name,
                gender: newUser.gender,
                phone: newUser.phone,
            },
        };
    } catch (error) {
        console.error("Error in user registration:", error);
        return { success: false, message: "Đã có lỗi xảy ra trong quá trình đăng ký." };
    }
};

// Hàm đăng nhập người dùng
const ServiceLoginUser = async (email, password) => {
    // console.log("kiem tra du lieu: ", {email, password});
    
    try {
        // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
        const user = await User.findOne({ email }).populate("user_role_id");
        if (!user) {
            return { success: false, message: "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại." };
        }

        if (user.is_hidden) {
            return { success: false, message: "Tài khoản của bạn đã bị khóa." };
        }

        // So sánh mật khẩu đã nhập với mật khẩu đã hash trong cơ sở dữ liệu
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return { success: false, message: "Email hoặc mật khẩu không chính xác." };
        }

        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            // phone: user.phone,
            // address: user.address,
            // image: user.image,
            // gender: user.gender,
            // role: user.user_role_id.name,
            // password: user.password,
        };

        // console.log("nguoi dung da dang nhap la: ", payload);

        // Tạo JWT với thời gian hết hạn 1 tuần
        const access_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        // Đăng nhập thành công
        return {
            success: true,
            message: "Đăng nhập thành công",
            access_token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.user_role_id.name,
                // phone: user.phone,
                // address: user.address,
                // image: user.image,
                // gender: user.gender,
                // password: user.password,
            },
        };
    } catch (error) {
        console.error("Error in user login:", error);
        return { success: false, message: "Đã có lỗi xảy ra trong quá trình đăng nhập." };
    }
};

// const ServiceGetUser = async (email) => {
//     try {
//         const user = await User.findOne({email});
//         if(!user) {
//             return {
//                 success: false,
//                 message: "Người dùng không tồn tại"
//             }
//         }
//         return {
//             success: true,
//             message: "Tìm kiếm người dùng thành công",
//             data: {
//                 name: user.name,
//                 email: user.email,
//                 role: user.user_role_id.name,
//                 phone: user.phone,
//                 address: user.address,
//                 image: user.image,
//                 gender: user.gender,                
//                 application_status: user.application_status,
//                 rejection_reason: user.rejection_reason
//                 // password: user.password,
//             },
//         }
//     } catch (error) {
//         console.error("Error in find user:", error);
//         return { success: false, message: "Đã có lỗi xảy ra trong quá trình tìm kiếm người dùng." };
//     }
// }

const ServiceGetUser = async (email) => {
    try {
        const user = await User.findOne({ email })
            // .populate('region_id')
            // .populate('city_id');

        if (!user) {
            return {
                success: false,
                message: "Người dùng không tồn tại"
            }
        }

        // Lấy thông tin region và city nếu có
        let regionName = null;
        let cityName = null;

        if (user.region_id) {
            const region = await Region.findOne({ region_id: user.region_id });
            if (region) {
                regionName = region.region_name;
            }
        }

        if (user.city_id) {
            const city = await City.findOne({ city_id: user.city_id });
            if (city) {
                cityName = city.city_name;
            }
        }

        return {
            success: true,
            message: "Tìm kiếm người dùng thành công",
            data: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.user_role_id.name,
                phone: user.phone,
                image: user.image,
                gender: user.gender,
                region_id: user.region_id ? user.region_id._id : null,
                city_id: user.city_id ? user.city_id._id : null,
                region_name: regionName,
                city_name: cityName,
                application_status: user.application_status,
                rejection_reason: user.rejection_reason
            },
        }
    } catch (error) {
        console.error("Error in find user:", error);
        return { success: false, message: "Đã có lỗi xảy ra trong quá trình tìm kiếm người dùng." };
    }
}

const ServiceGetUserByID = async (user_id) => {
    try {
        const user = await User.findOne({ user_id })

        if (!user) {
            return {
                success: false,
                message: "Người dùng không tồn tại"
            }
        }

        // Lấy thông tin region và city nếu có
        let regionName = null;
        let cityName = null;

        if (user.region_id) {
            const region = await Region.findOne({ region_id: user.region_id });
            if (region) {
                regionName = region.region_name;
            }
        }

        if (user.city_id) {
            const city = await City.findOne({ city_id: user.city_id });
            if (city) {
                cityName = city.city_name;
            }
        }

        return {
            success: true,
            message: "Tìm kiếm người dùng thành công",
            data: user
            // data: {
            //     user_id: user.user_id,
            //     name: user.name,
            //     email: user.email,
            //     role: user.user_role_id.name,
            //     phone: user.phone,
            //     image: user.image,
            //     gender: user.gender,
            //     region_id: user.region_id ? user.region_id._id : null,
            //     city_id: user.city_id ? user.city_id._id : null,
            //     region_name: regionName,
            //     city_name: cityName,
            //     application_status: user.application_status,
            //     rejection_reason: user.rejection_reason
            // },
        }
    } catch (error) {
        console.error("Error in find user:", error);
        return { success: false, message: "Đã có lỗi xảy ra trong quá trình tìm kiếm người dùng." };
    }
}

const ServiceSalesRegistration = async ( 
    user_id, 
    farm_name, 
    farm_logo, 
    farm_phone, 
    region_id, 
    city_id, 
    farm_detail, 
    farm_banner
) => {
    try {
        // Tìm người dùng theo ID
        const user = await User.findOne({ user_id: user_id });
        // console.log("nguoi dung dang tim", user);

        if (!user) {
            return { success: false, message: "Người dùng không tồn tại." };
        }
        
        const region = await Region.findOne({ region_id: region_id });
        // console.log("vùng mien dang tim", region);
        if (!region) {
            return { success: false, message: "Không tìm thấy vùng miền." };
        }
   
        const city = await City.findOne({ 
            city_id,
            region_id: region.region_id 
        });
        // console.log("thanh pho dang tim", city);
        if (!city) {
            return { success: false, message: "Không tìm thấy thành phố hoặc thành phố không thuộc vùng miền đã chọn." };
        }

        // Cập nhật thông tin trang trại và trạng thái đăng ký
        user.farm_logo = farm_logo;
        user.farm_phone = farm_phone;
        user.farm_region_id = region_id;
        user.farm_city_id = city_id;
        user.farm_banner = farm_banner;
        user.farm_detail = farm_detail;
        user.farm_name = farm_name;
        user.application_status = "pending";
        user.is_farmer = false;
        user.rejection_reason = "";

        // Lưu thông tin cập nhật vào cơ sở dữ liệu
        await user.save();

        const regionName = region.region_name;
        const cityName = city.city_name;

        return {
            success: true,
            message: "Đăng ký kinh doanh thành công. Trạng thái đăng ký đang chờ duyệt.",
            data: {
                name: user.name,
                email: user.email,
                farm_name: user.farm_name,
                farm_phone: user.farm_phone,
                farm_region: regionName,
                farm_city: cityName,
                application_status: user.application_status,
            },
        };
    } catch (error) {
        console.error("Error in sales registration:", error);
        return { success: false, message: "Đã có lỗi xảy ra trong quá trình đăng ký kinh doanh." };
    }
};

// const ServiceUpdateUser = async (email, name, oldPassword, newPassword, gender, phone, image, address) => {
//     const user = await User.findOne({ email });
//     console.log("Người dùng đang tìm:", user);
//     try {
//         // Tìm người dùng theo email
//         const user = await User.findOne({ email });
//         console.log("Người dùng đang tìm:", user);

//         if (oldPassword && newPassword) {
//             // Kiểm tra mật khẩu cũ
//             const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
//             if (!isOldPasswordValid) {
//                 return { success: false, message: "Mật khẩu cũ không chính xác." };
//             }

//             // Kiểm tra tính hợp lệ của mật khẩu mới
//             if (!isPasswordStrong(newPassword)) {
//                 return { 
//                     success: false, 
//                     message: "Mật khẩu mới phải chứa ít nhất 6 ký tự, bao gồm chữ cái, số và ký tự đặc biệt." 
//                 };
//             }

//             // Hash mật khẩu mới
//             // const salt = await bcrypt.genSalt(10);
//             user.password = await bcrypt.hash(newPassword, saltRounds);
//         }

//         // Cập nhật thông tin người dùng
//         user.name = name || user.name;
//         user.gender = gender || user.gender;
//         user.phone = phone || user.phone;
//         user.address = address || user.address;
//         // user.image = image || user.image;


//         // Xử lý ảnh base64
//         if (image) {
//             // Kiểm tra xem image có phải là chuỗi base64 hợp lệ không
//             if (/^[A-Za-z0-9+/=]+$/.test(image)) {
//                 user.image = image;
//             } else {
//                 console.error("Invalid base64 image data");
//                 return { success: false, message: "Dữ liệu ảnh không hợp lệ." };
//             }
//         }

//         // Log thông tin người dùng sau khi cập nhật
//         console.log("Thông tin người dùng trước khi lưu:", {
//             name: user.name,
//             gender: user.gender,
//             phone: user.phone,
//             image: user.image ? "Base64 image data" : "No image",
//             address: user.address,
//         });

//         // Lưu thông tin cập nhật vào cơ sở dữ liệu
//         await user.save();

//         return {
//             success: true,
//             message: "Thông tin người dùng đã được cập nhật thành công.",
//             data: {
//                 name: user.name,
//                 email: user.email,
//                 gender: user.gender,
//                 phone: user.phone,
//                 image: user.image,
//                 address: user.address,
//             },
//         };
//     } catch (error) {
//         console.error("Error in updating user:", error);
//         return { success: false, message: "Đã có lỗi xảy ra trong quá trình cập nhật thông tin." };
//     }
// };

const ServiceUpdatePassword = async (email, newPassword) => {
    try {
        // Tìm user theo email
        const user = await User.findOne({ email });

        if (!user) {
            return { 
                success: false, 
                message: "Email đã nhập không tồn tại, Vui lòng kiểm tra lại." 
            };
        }

        // Kiểm tra độ mạnh của mật khẩu mới
        if (!isPasswordStrong(newPassword)) {
            return {
                success: false,
                message: "Mật khẩu mới phải chứa ít nhất 6 ký tự, bao gồm chữ cái, số và ký tự đặc biệt."
            };
        }

        // Kiểm tra mật khẩu mới có giống mật khẩu cũ không
        const isSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (isSameAsOld) {
            return {
                success: false,
                message: "Mật khẩu mới không được giống mật khẩu cũ."
            };
        }

        // Hash mật khẩu mới và cập nhật
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;

        // Lưu thay đổi
        await user.save();

        // Lấy thông tin user đã cập nhật
        const updatedUser = await User.findOne({ email }).select('-password');

        return {
            success: true,
            message: "Mật khẩu đã được đổi thành công.",
            data: updatedUser,
        };
    } catch (error) {
        console.error("Error in updating password:", error);
        return { 
            success: false, 
            message: "Đã có lỗi xảy ra trong quá trình đổi mật khẩu." 
        };
    }
};


const ServiceUpdateUser = async (email, name, oldPassword, newPassword, gender, phone, image, region_id, city_id) => {
    try {
        const user = await User.findOne({ email });
        // console.log("Người dùng đang tìm:", user);

        if (!user) {
            return { success: false, message: "Không tìm thấy người dùng." };
        }

        if (oldPassword && newPassword) {
            const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isOldPasswordValid) {
                return { success: false, message: "Mật khẩu cũ không chính xác." };
            }

            if (!isPasswordStrong(newPassword)) {
                return {
                    success: false,
                    message: "Mật khẩu mới phải chứa ít nhất 6 ký tự, bao gồm chữ cái, số và ký tự đặc biệt."
                };
            }

            user.password = await bcrypt.hash(newPassword, saltRounds);
        }

        // Cập nhật thông tin người dùng
        user.name = name || user.name;
        user.gender = gender || user.gender;
        user.phone = phone || user.phone;
        console.log("check region_id:", region_id);
        console.log("check city_id:", city_id);

        const region = await Region.findOne({region_id})
        if (!region) {
            return { success: false, message: "Vùng miền không tồn tại." };
        }
        user.region_id = region_id

        const city = await City.findOne({city_id})
        if (!city) {
            return { success: false, message: "Thành phố không tồn tại." };
        }
        user.city_id = city_id


        // Xử lý ảnh base64
        if (image) {
            if (/^[A-Za-z0-9+/=]+$/.test(image)) {
                user.image = image;
            } else {
                console.error("Invalid base64 image data");
                return { success: false, message: "Dữ liệu ảnh không hợp lệ." };
            }
        }

        await user.save();

        // Lấy thông tin region và city sau khi cập nhật
        const updatedUser = await User.findOne({ email })
            // .populate('region_id')
            // .populate('city_id');

        return {
            success: true,
            message: "Thông tin người dùng đã được cập nhật thành công.",
            data: {
                name: updatedUser.name,
                email: updatedUser.email,
                gender: updatedUser.gender,
                phone: updatedUser.phone,
                image: updatedUser.image,
                region_id: updatedUser.region_id,
                city_id: updatedUser.city_id,
                // region_name: updatedUser.region_id,
                // city_name: updatedUser.city_id?
            },
        };
    } catch (error) {
        console.error("Error in updating user:", error);
        return { success: false, message: "Đã có lỗi xảy ra trong quá trình cập nhật thông tin." };
    }
};
//san pham
const ServiceGetProductByUser = async (user_id) => {
    try {
        const products = await Product.find({ farm_id: user_id })
            // .sort({ createdAt: -1 });

        return {
            success: true,
            data: products,
            message: "Lấy sản phẩm theo người dùng thành công"
        };
    } catch (error) {
        console.log(error); 
        return {
            success: false,
            message: "Đã có lỗi trong quá trình lấy dữ liệu sản phẩm",
        };
    }
};

const ServiceAddProduct = async ({
    user_id,
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
}) => {
    try {
        const user = await User.findOne({ user_id: user_id });
        if (!user) {
            console.log("User not found");
        }

        const cultivation = await Cultivation.findOne({ cultivation_id: cultivation_id });
        if (!cultivation) {
            return {
                success: false,
                message: "Phương thức canh tác không hợp lệ"
            };
        }

        const featureDoc = await Feature.findOne({ feature_id: feature_id });
        if (!featureDoc) {
            return {
                success: false,
                message: "Đặc điểm sản phẩm không hợp lệ"
            };
        }

        if (product_price < 0 || product_inventory < 0) {
            return {
                success: false,
                message: "Giá và hàng tồn phải lớn hơn 0"
            };
        }

        if (product_harvest_date && product_expired) {
            const harvestDate = new Date(product_harvest_date);
            const expiredDate = new Date(product_expired);
            
            if (expiredDate < harvestDate) {
                return {
                    success: false,
                    message: "Vui lòng kiểm tra lại ngày hết hạn của sản phẩm"
                };
            }
        }

        if (is_rescue === true) {
            if (!rescue_start_date || !rescue_end_date) {
                return {
                    success: false,
                    message: "Vui lòng nhập ngày giải cứu và ngày kết thúc giải cứu"
                };
            }

            const startDate = new Date(rescue_start_date);
            const endDate = new Date(rescue_end_date);

            // Kiểm tra thời gian giải cứu không quá 30 ngày
            const daysDifference = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            if (daysDifference > 30) {
                return {
                    success: false,
                    message: "Thời gian giải cứu không được quá 30 ngày"
                };
            }

            if (endDate < startDate) {
                return {
                    success: false,
                    message: "Vui lòng nhập ngày giải cứu phải nhỏ hơn ngày kết thúc giải cứu"
                };
            }

            // Kiểm tra rescue_end_date phải lớn hơn thời gian hiện tại
            if (endDate <= new Date()) {
                return {
                    success: false,
                    message: "Vui lòng nhập ngày cứu bắt đầu giải cứu phải lớn hơn hoặc bằng ngày hiện tại"
                }
            }
        }
 
        const newProduct = new Product({
            farm_id: user.user_id,
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
            form_of_cultivation: cultivation_id,
            feature: feature_id,
            is_rescue: is_rescue || false,
            ...(is_rescue ? { rescue_start_date, rescue_end_date } : {}), 
            is_hidden: false 
        });

        // Save to database
        const savedProduct = await newProduct.save();

        return {
            success: true,
            data: savedProduct ,
            message: "Thêm sản phẩm lên thành công"
        };

    } catch (error) {
        console.log(error);
        return {
            
            success: false,
            message: error.message || "Có lỗi khi thêm sản phẩm",
            error: error
        };
    }
};

const ServiceGetProductById = async (product_id) => {
    try {
        const product = await Product.findOne({ product_id: product_id });
        // console.log("Query result:", product);
        
        if (!product) {
            return {
                success: false,
                message: "Không tìm thấy sản phẩm"
            };
        }
        
        return {
            data: {
                success: true,
                data: product,
                message: "Lấy thông tin sản phẩm thành công"
            },
        };

    } catch (error) {
        console.error("Error details:", error);
        return {
            success: false,
            message: "Có lỗi khi lấy thông tin sản phẩm",
            error: error
        };
    }
};

const ServiceUpdateProduct = async ({
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
}) => {
    try {
        // Validate required fields
        if (!product_id || !farm_id) {
            return {
                success: false,
                message: "ID sản phẩm và ID nông trại là bắt buộc"
            };
        }

        // Check if product exists and belongs to farm
        const existingProduct = await Product.findOne({ 
            product_id: product_id,
            farm_id: farm_id
        });

        if (!existingProduct) {
            return {
                success: false,
                message: "Không tìm thấy sản phẩm hoặc bạn không có quyền chỉnh sửa"
            };
        }

        // Validate cultivation method
        if (cultivation_id) {
            const cultivation = await Cultivation.findOne({ cultivation_id });
            if (!cultivation) {
                return {
                    success: false,
                    message: "Phương thức canh tác không hợp lệ"
                };
            }
        }

        // Validate product feature
        if (feature_id) {
            const feature = await Feature.findOne({ feature_id });
            if (!feature) {
                return {
                    success: false,
                    message: "Đặc điểm sản phẩm không hợp lệ"
                };
            }
        }

        // Validate categories
        if (product_category_parent) {
            const categoryParent = await CategoryParent.findOne({ category_parent_id: product_category_parent });
            if (!categoryParent) {
                return {
                    success: false,
                    message: "Danh mục cha không hợp lệ"
                };
            }
        }

        if (product_category) {
            const categoryChild = await CategoryChild.findOne({ category_child_id: product_category });
            if (!categoryChild) {
                return {
                    success: false,
                    message: "Danh mục con không hợp lệ"
                };
            }
        }

        // Validate price and inventory
        if (product_price < 0 || product_inventory < 0) {
            return {
                success: false,
                message: "Giá và số lượng tồn kho phải lớn hơn 0"
            };
        }

        // Validate dates
        if (product_harvest_date && product_expired) {
            const harvestDate = new Date(product_harvest_date);
            const expiredDate = new Date(product_expired);

            if (expiredDate < harvestDate) {
                return {
                    success: false,
                    message: "Ngày hết hạn phải sau ngày thu hoạch"
                };
            }
        }

        // Validate rescue dates
        if (is_rescue === true) {
            if (!rescue_start_date || !rescue_end_date) {
                return {
                    success: false,
                    message: "Phải nhập đầy đủ ngày bắt đầu và kết thúc cứu trợ"
                };
            }

            const startDate = new Date(rescue_start_date);
            const endDate = new Date(rescue_end_date);

            // Kiểm tra thời gian giải cứu không quá 30 ngày
            const daysDifference = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            if (daysDifference > 30) {
                return {
                    success: false,
                    message: "Thời gian giải cứu không được quá 30 ngày"
                };
            }

            if (endDate < startDate) {
                return {
                    success: false,
                    message: "Ngày kết thúc cứu trợ không thể sớm hơn ngày bắt đầu"
                };
            }

            if (endDate < new Date()) {
                return {
                    success: false,
                    message: "Ngày kết thúc cứu trợ phải lớn hơn thời gian hiện tại"
                };
            }
        }

        // Prepare update data
        const updateData = {
            product_name,
            product_price,
            product_category_parent,
            product_category,
            product_description,
            product_inventory,
            product_unit,
            product_harvest_date,
            product_expired,
            form_of_cultivation: cultivation_id,
            feature: feature_id,
            is_rescue: is_rescue || false,
        };

        // Only update image if provided
        if (product_image) {
            updateData.product_image = product_image;
        }

        // Handle rescue dates
        if (is_rescue) {
            updateData.rescue_start_date = rescue_start_date;
            updateData.rescue_end_date = rescue_end_date;
        } else {
            updateData.rescue_start_date = null;
            updateData.rescue_end_date = null;
        }

        // Update product
        const updatedProduct = await Product.findOneAndUpdate(
            { product_id: product_id },
            updateData,
            { new: true }
        );

        return {
            success: true,
            data: updatedProduct,
            message: "Cập nhật sản phẩm thành công"
        };

    } catch (error) {
        console.error("Error in ServiceUpdateProduct:", error);
        return {
            success: false,
            message: "Có lỗi khi cập nhật sản phẩm",
            error: error.message
        };
    }
};

const ServiceHideProduct = async (product_id,) => {
    try {
        if (!product_id) {
            return {
                success: false,
                message: "ID sản phẩm và ID nông trại là bắt buộc"
            };
        }

        // Check if product exists and belongs to farm
        const product = await Product.findOne({ 
            product_id: product_id,
        });

        if (!product) {
            return {
                success: false,
                message: "Không tìm thấy sản phẩm hoặc bạn không có quyền thực hiện"
            };
        }

        // Update is_hidden status
        const updatedProduct = await Product.findOneAndUpdate(
            { product_id: product_id },
            { is_hidden: !product.is_hidden },
            { new: true }
        );

        const statusMessage = updatedProduct.is_hidden ? "Ẩn" : "Hiện";

        return {
            success: true,
            data: updatedProduct,
            message: `${statusMessage} sản phẩm thành công`
        };

    } catch (error) {
        console.error("Error in ServiceHideProduct:", error);
        return {
            success: false,
            message: "Có lỗi khi ẩn sản phẩm",
            error: error.message
        };
    }
};

const ServiceDeleteProduct = async (product_id, farm_id) => {
    try {
        if (!product_id || !farm_id) {
            return {
                success: false,
                message: "ID sản phẩm và ID nông trại là bắt buộc"
            };
        }

        // Check if product exists and belongs to farm
        const product = await Product.findOne({ 
            product_id: product_id,
            farm_id: farm_id
        });

        if (!product) {
            return {
                success: false,
                message: "Không tìm thấy sản phẩm hoặc bạn không có quyền thực hiện"
            };
        }

        // Delete the product
        await Product.findOneAndDelete({ product_id: product_id });

        return {
            success: true,
            message: "Xóa sản phẩm thành công"
        };

    } catch (error) {
        console.error("Error in ServiceDeleteProduct:", error);
        return {
            success: false,
            message: "Có lỗi khi xóa sản phẩm",
            error: error.message
        };
    }
};

// const ServiceUpdateProduct = async (
//     product_id,
//     product_name,
//     product_price,
//     product_image,
//     product_category,
//     product_description,
//     product_inventory,
//     product_unit,
//     product_harvest_date,
//     product_expired,
//     is_rescue,
//     rescue_start_date,
//     rescue_end_date
// ) => {
//     try {
//         const product = await Product.findOne({ product_id });

//         if (!product) {
//             return {
//                 success: false,
//                 message: "Không tìm thấy sản phẩm."
//             };
//         }

//         // Validate numeric fields
//         if (product_price < 0 || product_inventory < 0) {
//             return {
//                 success: false,
//                 message: "Giá và hàng tồn phải lớn hơn 0."
//             };
//         }

//         // Validate dates if provided
//         if (product_harvest_date && product_expired) {
//             const harvestDate = new Date(product_harvest_date);
//             const expiredDate = new Date(product_expired);
            
//             if (expiredDate < harvestDate) {
//                 return {
//                     success: false,
//                     message: "Vui lòng kiểm tra lại ngày hết hạn của sản phẩm."
//                 };
//             }
//         }

//         // Validate rescue dates only if is_rescue is true
//         if (is_rescue === true) {
//             if (!rescue_start_date || !rescue_end_date) {
//                 return {
//                     success: false,
//                     message: "Rescue dates are required when is_rescue is true."
//                 };
//             }

//             const startDate = new Date(rescue_start_date);
//             const endDate = new Date(rescue_end_date);

//             if (endDate < startDate) {
//                 return {
//                     success: false,
//                     message: "Rescue end date cannot be earlier than start date."
//                 };
//             }

//             // Kiểm tra rescue_end_date phải lớn hơn thời gian hiện tại
//             if (endDate < new Date()) {
//                 return {
//                     success: false,
//                     message: "Rescue end date must be greater than current date."
//                 };
//             }
//         }

//         product.product_name = product_name;
//         product.product_price = product_price;
//         product.product_image = product_image;
//         product.product_category = product_category;
//         product.product_description = product_description;
//         product.product_inventory = product_inventory;
//         product.product_unit = product_unit;
//         product.product_harvest_date = product_harvest_date;
//         product.product_expired = product_expired;
//         product.is_rescue = is_rescue || false;
//         product.rescue_start_date = is_rescue ? rescue_start_date : undefined;
//         product.rescue_end_date = is_rescue ? rescue_end_date : undefined;

//         await product.save();

//         return {
//             success: true,
//             data: product,
//             message: "Cập nhật sản phẩm thành công."
//         };
//     } catch (error) {
//         console.error("Error in updating product:", error);
//         return {
//             success: false,
//             message: "Đã có lỗi xảy ra khi cập nhật sản phẩm.",
//             error: error.message
//         };
//     }
// };

const ServiceGetProductChildCategory = async () => {
    try {
        const categories = await CategoryChild.find({})
            .lean();
        console.log("categories >>> ", categories);
        
        return {
            success: true,
            data: categories,
            message: "Lấy danh mục sản phẩm thành công"
        };
    } catch (error) {
        return {
            success: false,
            message: "Đã có lỗi trong quá trình lấy dữ liệu danh mục sản phẩm",
        };
    }
};

const ServiceGetProductParentCategory = async () => {
    try {
        const categories = await CategoryParent.find({})
            // .select('category_child_id category_child_name')
            .lean();
        console.log("categories >>> ", categories);
        
        return {
            success: true,
            data: categories,
            message: "Lấy danh mục sản phẩm thành công"
        };
    } catch (error) {
        return {
            success: false,
            message: "Đã có lỗi trong quá trình lấy dữ liệu danh mục sản phẩm",
        };
    }
};




//san pham yeu thich
// const ServiceGetProductFavouriteById = async (user_id) => {
//     try {
//         // Kiểm tra product favourite có tồn tại
//         const favourite = await ProductFavourite.findOne({
//             user_id: user_id,
//         })

//         if (!favourite) {
//             return {
//                 success: false,
//                 message: "Không tìm thấy sản phẩm yêu thích."
//             };
//         }

//         return {
//             success: true,
//             data: favourite,
//             message: "Lấy thông tin sản phẩm yêu thích thành công."
//         };

//     } catch (error) {
//         console.error("Error in getting favourite product:", error);
//         return {
//             success: false,
//             message: "Đã có lỗi xảy ra khi lấy thông tin sản phẩm yêu thích.",
//             error: error.message
//         };
//     }
// };

// const ServiceGetProductFavouriteById = async (user_id) => {
//     try {
//         console.log("1. Starting search for user_id:", user_id);
        
//         if (!user_id) {
//             return {
//                 success: false,
//                 message: "user_id không được để trống"
//             };
//         }

//         // Debug: Log raw favorites first
//         const rawFavorites = await ProductFavourite.find({ user_id: user_id });
//         console.log("2. Raw favorites before populate:", JSON.stringify(rawFavorites, null, 2));

//         // Thực hiện populate với điều kiện phù hợp
//         const favourites = await ProductFavourite.find({
//             user_id: user_id
//         }).populate({
//             path: 'product_id',
//             model: 'product',
//             select: 'product_id product_name product_price product_image product_description product_inventory product_unit'
//         }).lean(); // Sử dụng lean() để get plain JavaScript objects

//         console.log("3. Favourites after populate:", JSON.stringify(favourites, null, 2));

//         // Transform data
//         const transformedData = favourites
//             .filter(favourite => favourite.product_id) // Lọc bỏ null products
//             .map(favourite => ({
//                 product_favourite_id: favourite._id,
//                 user_id: favourite.user_id,
//                 product: {
//                     product_id: favourite.product_id.product_id, // ObjectId từ schema
//                     name: favourite.product_id.product_name,
//                     price: favourite.product_id.product_price,
//                     image_url: favourite.product_id.product_image,
//                     description: favourite.product_id.product_description,
//                     inventory: favourite.product_id.product_inventory,
//                     unit: favourite.product_id.product_unit
//                 }
//             }));

//         if (transformedData.length === 0) {
//             return {
//                 success: false,
//                 message: "Không tìm thấy sản phẩm yêu thích.",
//                 debug_info: {
//                     raw_favorites_count: rawFavorites.length,
//                     populated_favorites_count: favourites.length
//                 }
//             };
//         }

//         return {
//             success: true,
//             data: transformedData,
//             message: "Lấy thông tin sản phẩm yêu thích thành công."
//         };

//     } catch (error) {
//         console.error("Error in getting favourite product:", error);
//         return {
//             success: false,
//             message: "Đã có lỗi xảy ra khi lấy thông tin sản phẩm yêu thích.",
//             error: error.message,
//             stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//         };
//     }
// };

const ServiceGetProductFavouriteById = async (user_id) => {
    try {
        // Kiểm tra user có tồn tại
        const user = await User.findOne({ user_id: user_id });
        
        if (!user) {
            return {
                success: false,
                message: "Không tìm thấy người dùng."
            };
        }

        // Tìm tất cả sản phẩm yêu thích của user
        const favouriteProducts = await ProductFavourite.find({ user_id: user_id })

        if (!favouriteProducts || favouriteProducts.length === 0) {
            return {
                success: true,
                data: [],
                message: "Người dùng chưa có sản phẩm yêu thích nào."
            };
        }

        // Lọc ra những sản phẩm không bị ẩn
        const visibleProducts = favouriteProducts.filter(item => 
            item.product_id && !item.product_id.is_hidden
        );

        return {
            success: true,
            data: visibleProducts,
            message: "Lấy danh sách sản phẩm yêu thích thành công."
        };

    } catch (error) {
        console.error("Error in getting favourite products:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách sản phẩm yêu thích.",
            error: error.message
        };
    }
};

const ServiceGetAllProductFavourite = async (user_id) => {
    try {
        // Kiểm tra user có tồn tại
        const user = await User.findOne({ user_id: user_id });

        if (!user) {
            return {
                success: false,
                message: "Không tìm thấy người dùng."
            };
        }

        // Lấy tất cả sản phẩm yêu thích của user
        const favourites = await ProductFavourite.find({ user_id });

        // Lấy thông tin chi tiết của các sản phẩm
        const favouriteProducts = await Promise.all(
            favourites.map(async (fav) => {
                const product = await Product.findOne({ product_id: fav.product_id });
                return {
                    favourite: fav,
                    product: product
                };
            })
        );

        return {
            success: true,
            data: favouriteProducts,
            message: "Lấy danh sách sản phẩm yêu thích thành công."
        };

    } catch (error) {
        console.error("Error in getting all favourite products:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách sản phẩm yêu thích.",
            error: error.message
        };
    }
};

const ServiceAddProductFavourite = async (user_id, product_id) => {
    try {
        // Kiểm tra user và product có tồn tại
        const user = await User.findOne({ user_id: user_id });
        const product = await Product.findOne({ product_id: product_id });

        if (!user || !product) {
            return {
                success: false,
                message: "Không tìm thấy người dùng hoặc sản phẩm."
            };
        }

        // Kiểm tra xem đã yêu thích chưa
        const existingFavourite = await ProductFavourite.findOne({
            user_id,
            product_id
        });

        if (existingFavourite) {
            return {
                success: false,
                message: "Sản phẩm đã được thêm vào danh sách yêu thích."
            };
        }

        const newFavourite = new ProductFavourite({
            user_id,
            product_id
        });

        await newFavourite.save();

        return {
            success: true,
            data: newFavourite,
            message: "Đã thêm sản phẩm vào danh sách yêu thích."
        };
    } catch (error) {
        console.error("Error in adding favourite product:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm sản phẩm yêu thích.",
            error: error.message
        };
    }
};

const ServiceRemoveProductFavourite = async (user_id, product_id) => {
    try {
        const favourite = await ProductFavourite.findOneAndDelete({
            user_id: user_id,
            product_id: product_id
        });

        if (!favourite) {
            return {
                success: false,
                message: "Không tìm thấy sản phẩm yêu thích."
            };
        }

        return {
            success: true,
            message: "Đã xóa sản phẩm khỏi danh sách yêu thích."
        };
    } catch (error) {
        console.error("Error in removing favourite product:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xóa sản phẩm yêu thích.",
            error: error.message
        };
    }
};

//danh gia
const ServiceGetRevỉewByProduct = async (product_id) => {
    try {
        // Kiểm tra user có tồn tại
        const product = await Review.findOne({ product_id: product_id });
        
        if (!product) {
            return {
                success: false,
                message: "Không tìm thấy sản phẩm."
            };
        }

        // Tìm tất cả sản phẩm yêu thích của user
        const productReviews = await Review.find({ product_id: product_id })

        if (!productReviews || productReviews.length === 0) {
            return {
                success: true,
                data: [],
                message: "Người dùng chưa có đánh giá nào."
            };
        }

        return {
            success: true,
            data: productReviews,
            message: "Lấy danh sách đánh giá sản phẩm thành công."
        };

    } catch (error) {
        console.error("Error in getting review:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách đánh giá.",
            error: error.message
        };
    }
};

const ServiceAddReview = async (user_id, product_id, rating, content) => {
    try {
        // Kiểm tra user và product có tồn tại
        const user = await User.findOne({ user_id: user_id });
        const product = await Product.findOne({ product_id: product_id });

        if (!user || !product) {
            return {
                success: false,
                message: "Không tìm thấy người dùng hoặc sản phẩm."
            };
        }

        // Kiểm tra xem đã đánh giá chưa
        const existingReview = await Review.findOne({
            user_id,
            product_id
        });

        if (existingReview) {
            return {
                success: false,
                message: "Bạn đã đánh giá sản phẩm này rồi."
            };
        }

        const newReview = new Review({
            user_id,
            product_id,
            rating,
            content,

        });

        await newReview.save();

        return {
            success: true,
            data: newReview,
            message: "Đánh giá sản phẩm thành công."
        };
    } catch (error) {
        console.error("Error in adding review:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm đánh giá.",
            error: error.message
        };
    }
};

const ServiceUpdateReview = async (user_id, review_id, rating, content) => {
    try {
        const user = await User.findOne({ user_id: user_id });
        if (!user) {
            return {
                success: false,
                message: "Không tìm thấy người dùng."
            };
        }

        const review = await Review.findOne({ review_id: review_id });
        if (!review) {
            return {
                success: false,
                message: "Không tìm thấy đánh giá."
            };
        }

        if (review.user_id.toString() !== user_id.toString()) {
            return {
                success: false,
                message: "Bạn không có quyền chỉnh sửa đánh giá này."
            };
        }

        review.rating = rating;
        review.content = content;
        review.review_date = Date.now();

        await review.save();

        return {
            success: true,
            data: review,
            message: "Cập nhật đánh giá thành công."
        };
    } catch (error) {
        console.error("Error in updating review:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi cập nhật đánh giá.",
            error: error.message
        };
    }
};

const ServiceDeleteReview = async (user_id, review_id) => {
    try {
        const user = await User.findOne({ user_id: user_id });
        if (!user) {
            return {
                success: false,
                message: "Không tìm thấy người dùng."
            };
        }

        const review = await Review.findOne({ review_id: review_id });
        if (!review) {
            return {
                success: false,
                message: "Không tìm thấy đánh giá."
            };
        }

        if (review.user_id.toString() !== user_id.toString()) {
            return {
                success: false,
                message: "Bạn không có quyền xóa đánh giá này."
            };
        }

        // Thực hiện xóa review
        await Review.findOneAndDelete({ review_id: review_id });

        return {
            success: true,
            message: "Xóa đánh giá thành công."
        };
    } catch (error) {
        console.error("Error in deleting review:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xóa đánh giá.",
            error: error.message
        };
    }
};

//ma giam gia
// const ServiceGetAllPrmotion = async (user_id) => {
//     try {
//         // Kiểm tra user có tồn tại
//         const user = await User.findOne({ user_id: user_id });

//         if (!user) {
//             return {
//                 success: false,
//                 message: "Không tìm thấy người dùng."
//             };
//         }

//         // Lấy tất cả sản phẩm yêu thích của user
//         const favourites = await ProductFavourite.find({ user_id });

//         // Lấy thông tin chi tiết của các sản phẩm
//         const favouriteProducts = await Promise.all(
//             favourites.map(async (fav) => {
//                 const product = await Product.findOne({ product_id: fav.product_id });
//                 return {
//                     favourite: fav,
//                     product: product
//                 };
//             })
//         );

//         return {
//             success: true,
//             data: favouriteProducts,
//             message: "Lấy danh sách sản phẩm yêu thích thành công."
//         };

//     } catch (error) {
//         console.error("Error in getting all favourite products:", error);
//         return {
//             success: false,
//             message: "Đã có lỗi xảy ra khi lấy danh sách sản phẩm yêu thích.",
//             error: error.message
//         };
//     }
// };

const ServiceGetPromotionsByFarmId = async (farm_id) => {
    try {
        const products = await Product.find({ farm_id: farm_id, is_hidden: false });
        const productIds = products.map(product => product.product_id);
        
        const promotions = await Promotion.find({
            product_id: { $in: productIds }
        }).sort({ promotion_start_date: -1 });

        return {
            success: true,
            data: promotions,
            message: "Lấy danh sách khuyến mãi thành công."
        };
    } catch (error) {
        console.error("Error in getting promotions:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách khuyến mãi.",
            error: error.message
        };
    }
};

const ServiceGetPromotionsByProduct = async (product_id) => {
    try {
        const product = await Product.findOne({ product_id: product_id, is_hidden: false });
        // console.log("product >> ", product);
        
        if(!product) {
            return {
                success: false,
                message: "Sản phẩm tìm kiếm không tồn tại"
            }
        }

        const promotionProduct  = await Promotion.findOne({product_id: product.product_id})
        // console.log("promotionProduct >> ", promotionProduct);

        if(!promotionProduct) {
            return {
                success: false,
                message: "Sản phẩm không có khuyến mãi"
            }
        }

        return {
            success: true,
            data: promotionProduct,
            message: "Lấy sản phẩm khuyến mãi thành công."
        };
    } catch (error) {
        console.error("Error in getting promotion product:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy sản phẩm khuyến mãi.",
            error: error.message
        };
    }
};

const ServiceGetPromotionById = async (promotion_id) => {
    try {
        const promotion = await Promotion.findOne({ promotion_id: promotion_id });
        

        if (!promotion) {
            return {
                success: false,
                message: "Không tìm thấy khuyến mãi."
            };
        }

        return {
            success: true,
            data: promotion,
            message: "Tìm khuyến mãi thành công."
        };
    } catch (error) {
        console.error("Error in getting promotion:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy khuyến mãi.",
            error: error.message
        };
    }
};

const ServiceAddBulkPromotion = async (
    farm_id,
    promotion_name,
    promotion_description,
    promotion_value,
    promotion_start_date,
    promotion_end_date
) => {
    try {
        // Lấy tất cả sản phẩm không bị ẩn của nhà vườn
        const products = await Product.find({ farm_id: farm_id, is_hidden: false });

        if (!products.length) {
            return {
                success: false,
                message: "Không tìm thấy sản phẩm nào của nhà vườn."
            };
        }

        // Kiểm tra thời gian khuyến mãi hợp lệ
        if (new Date(promotion_start_date) >= new Date(promotion_end_date)) {
            return {
                success: false,
                message: "Thời gian kết thúc phải sau thời gian bắt đầu."
            };
        }

        // Tạo mảng các promotion mới
        const promotions = products.map(product => ({
            product_id: product.product_id,
            promotion_name,
            promotion_description,
            promotion_value,
            promotion_start_date,
            promotion_end_date
        }));

        await Promotion.insertMany(promotions);

        return {
            success: true,
            message: "Thêm khuyến mãi hàng loạt thành công."
        };
    } catch (error) {
        console.error("Error in adding bulk promotions:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm khuyến mãi hàng loạt.",
            error: error.message
        };
    }
};

const ServiceAddPromotion = async (
    product_id,
    promotion_name,
    promotion_description,
    promotion_value,
    promotion_start_date,
    promotion_end_date
) => {
    try {
        // Kiểm tra product có tồn tại
        const product = await Product.findOne({ product_id: product_id });

        if (!product) {
            return {
                success: false,
                message: "Không tìm thấy sản phẩm."
            };
        }

        // Kiểm tra thời gian khuyến mãi hợp lệ
        if (new Date(promotion_start_date) >= new Date(promotion_end_date)) {
            return {
                success: false,
                message: "Thời gian kết thúc phải sau thời gian bắt đầu."
            };
        }

        // Kiểm tra xem có khuyến mãi nào đang áp dụng cho sản phẩm không
        const existingPromotion = await Promotion.findOne({
            product_id,
            promotion_end_date: { $gt: new Date() }
        });

        if (existingPromotion) {
            return {
                success: false,
                message: "Sản phẩm đang có khuyến mãi khác đang áp dụng."
            };
        }

        const newPromotion = new Promotion({
            product_id,
            promotion_name,
            promotion_description,
            promotion_value,
            promotion_start_date,
            promotion_end_date
        });

        await newPromotion.save();

        return {
            success: true,
            data: newPromotion,
            message: "Thêm khuyến mãi thành công."
        };
    } catch (error) {
        console.error("Error in adding promotion:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm khuyến mãi.",
            error: error.message
        };
    }
};

const ServiceUpdatePromotion = async (
    promotion_id,
    promotion_name,
    promotion_description,
    promotion_value,
) => {
    try {
        console.log("promotion_id > ", promotion_id);

        const updatedPromotion = await Promotion.findOneAndUpdate(
            { promotion_id: promotion_id }, 
            { 
                promotion_name, 
                promotion_description, 
                promotion_value 
            },
            { new: true} 
        );

        if (!updatedPromotion) {
            return {
                success: false,
                message: "Không tìm thấy khuyến mãi."
            };
        }

        return {
            success: true,
            data: updatedPromotion,
            message: "Cập nhật khuyến mãi thành công."
        };
    } catch (error) {
        console.error("Error in updating promotion:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi cập nhật khuyến mãi.",
            error: error.message
        };
    }
};


const ServiceDeletePromotion = async (promotion_id) => {
    try {
        const promotion = await Promotion.findOneAndDelete({ promotion_id: promotion_id });

        if (!promotion) {
            return {
                success: false,
                message: "Không tìm thấy khuyến mãi."
            };
        }

        return {
            success: true,
            message: "Xóa khuyến mãi thành công."
        };
    } catch (error) {
        console.error("Error in deleting promotion:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xóa khuyến mãi.",
            error: error.message
        };
    }
};

//san pham

const ServiceGetAllProducts = async () => {
    try {
        const product = await Product.find({ is_hidden: false }).lean();

        if (!product || product.length === 0) {
            return {
                success: false,
                message: "Không tìm thấy sản phẩm nào."
            };
        }

        return {
            success: true,
            data: product,
            message: "Lấy danh sản phẩm thành công."
        };
    } catch (error) {
        console.error("Error in getting product:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách sản phẩm.",
            error: error.message
        };
    }
};

const ServiceGetAllProductsIncludeIsHidden = async () => {
    try {
        const product = await Product.find().lean();

        if (!product || product.length === 0) {
            return {
                success: false,
                message: "Không tìm thấy sản phẩm nào."
            };
        }

        return {
            success: true,
            data: product,
            message: "Lấy danh sản phẩm thành công."
        };
    } catch (error) {
        console.error("Error in getting product:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách sản phẩm.",
            error: error.message
        };
    }
};

const ServiceGetProductByParentCategory = async (category_parent_id) => {
    try {
        const category = await CategoryParent.findOne({category_parent_id: category_parent_id});
        console.log("hehê>>>", category);
        
        if (!category) {
            return {
                success: false,
                message: "Không tìm thấy danh mục nào."
            };
        }

        const product = await Product.find({product_category_parent: category_parent_id}).lean();

        if (!product || product.length === 0 ) {
            return {
                success: false,
                message: "Không tìm thấy sản phẩm nào."
            };
        }
        return {
            success: true,
            data: product,
            message: "Lấy danh sản phẩm thành công."
        };
    } catch (error) {
        console.error("Error in getting product:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách sản phẩm.",
            error: error.message
        };
    }
}

const ServiceGetProductByChildCategory = async (category_child_id) => {
    try {
        const category = await CategoryChild.findOne({category_child_id: category_child_id});
        console.log("hehê>>>", category);
        
        if (!category) {
            return {
                success: false,
                message: "Không tìm thấy danh mục nào."
            };
        }

        const product = await Product.find({product_category: category.category_child_id}).lean();

        if (!product || product.length === 0 ) {
            return {
                success: false,
                message: "Không tìm thấy sản phẩm nào."
            };
        }
        return {
            success: true,
            data: product,
            message: "Lấy danh sản phẩm thành công."
        };
    } catch (error) {
        console.error("Error in getting product:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách sản phẩm.",
            error: error.message
        };
    }
}


const checkExistingShippingFee = async (vendor_id, city_id) => {
    const existingFee = await ShippingFee.findOne({
        vendor_id: vendor_id,
        city_id: city_id
    });
    return existingFee;
};
// Thêm phí ship mới
// const ServiceGetShippingFeeByFarm= async (user_id) => {
//     try {
//         const user = await User({user_id: user_id});
//         console.log(user);
        
//         if (user) {
//             return {
//                 success: false,
//                 message: "Không tìm thấy nhà vườn này"
//             }
//         }

//         // const shippingFee = await ShippingFee({vendor_id: vendor.});

//         return {
//             success: true,
//             data: user,
//             message: "Lấy danh sách của nhà vườn thành công"
//         };
//     } catch (error) {
//         return {
//             success: false,
//             message: "Lỗi lấy danh sách phí ship",
//             error: error.message
//         };
//     }
// };

const ServiceCreateShippingFee = async (vendor_id, city_id, shipping_cost) => {
    try {
        // Kiểm tra xem người bán đã có phí ship cho thành phố này chưa
        const existingFee = await checkExistingShippingFee(vendor_id, city_id);
        if (existingFee) {
            return {
                success: false,
                message: "Phí ship cho người bán này tại thành phố này đã tồn tại"
            }
        }

        // Tạo phí ship mới
        const newShippingFee = new ShippingFee({
            vendor_id,
            city_id,
            shipping_cost
        });

        await newShippingFee.save();
        return {
            success: true,
            data: newShippingFee,
            message: "Thêm phí giao hàng thành công."
        };
    } catch (error) {
        console.error('Create shipping fee error:', error);
        return {
            success: false,
            message: "Lỗi khi thêm phí ship",
            error: error.message
        };
    }
};

const ServiceUpdateShippingFee = async (shipping_fee_id, shipping_cost) => {
    try {
        const updatedFee = await ShippingFee.findOneAndUpdate(
            { shipping_fee_id },
            { shipping_cost },
            { new: true }
        );

        if (!updatedFee) {
            return {
                success: false,
                message: "Không tìm thấy phí ship"
            };
        }

        return {
            success: true,
            data: updatedFee,
            message: "Cập nhật phí giao hàng thành công."
        };
    } catch (error) {
        console.error('Update shipping fee error:', error);
        return {
            success: false,
            message: "Lỗi khi cập nhật phí ship",
            error: error.message
        };
    }
};

const ServiceDeleteShippingFee = async (shipping_fee_id) => {
    try {
        const deletedFee = await ShippingFee.findOneAndDelete({
            shipping_fee_id
        });

        if (!deletedFee) {
            return {
                success: false,
                message: "Không tìm thấy phí ship"
            };
        }

        return {
            success: true,
            data: deletedFee,
            message: "Xóa phí giao hàng thành công."
        };
    } catch (error) {
        console.error('Delete shipping fee error:', error);
        return {
            success: false,
            message: "Lỗi khi xóa phí ship",
            error: error.message
        };
    }
};

const ServiceGetShippingFees = async () => {
    try {
        const shippingFees = await ShippingFee.find()
            // .populate('vendor_id', 'name farm_name')
            // .populate('city_id', 'city_name');

        return {
            success: true,
            data: shippingFees
        };
    } catch (error) {
        console.error('Get shipping fees error:', error);
        return {
            success: false,
            message: "Lỗi khi lấy danh sách phí ship",
            error: error.message
        };
    }
};

const ServiceGetShippingFeeByVendor = async (vendor_id) => {
    try {
        const shippingFee = await ShippingFee.find({
            vendor_id: vendor_id,
            // city_id
        })
        // .populate('vendor_id', 'name farm_name')
        //   .populate('city_id', 'city_name');

        if (!shippingFee) {
            return {
                success: false,
                message: "Không tìm thấy phí ship cho người bán này"
            };
        }

        return {
            success: true,
            data: shippingFee
        };
    } catch (error) {
        console.error('Get shipping fee error:', error);
        return {
            success: false,
            message: "Lỗi khi lấy thông tin phí ship",
            error: error.message
        };
    }
};

const ServiceGetShippingFeeByVendorAndCity = async (vendor_id, city_id) => {
    try {
        const shippingFee = await ShippingFee.findOne({
            vendor_id: vendor_id,
            city_id: city_id
        })

        if (!shippingFee) {
            return {
                success: false,
                message: "Không tìm thấy phí ship cho người bán này tại thành phố này"
            };
        }
        console.log("hehe > ", shippingFee);
        
        return {
            success: true,
            data: shippingFee
        };
    } catch (error) {
        console.error('Get shipping fee error:', error);
        return {
            success: false,
            message: "Lỗi khi lấy thông tin phí ship",
            error: error.message
        };
    }
};

const ServiceSetShippingFeeForAllCities = async (vendor_id, shipping_cost) => {
    try {
        // Lấy tất cả các thành phố
        const cities = await City.find();
        
        // Tạo mảng promises để thực hiện các thao tác đồng thời
        const updatePromises = cities.map(async (city) => {
            // Kiểm tra xem đã có shipping fee cho city này chưa
            const existingFee = await ShippingFee.findOne({
                vendor_id: vendor_id,
                city_id: city.city_id
            });

            if (existingFee) {
                // Nếu đã có thì update
                return ShippingFee.findOneAndUpdate(
                    { 
                        vendor_id: vendor_id,
                        city_id: city.city_id 
                    },
                    { shipping_cost: shipping_cost },
                    { new: true }
                );
            } else {
                // Nếu chưa có thì tạo mới
                const newShippingFee = new ShippingFee({
                    vendor_id: vendor_id,
                    city_id: city.city_id,
                    shipping_cost: shipping_cost
                });
                return newShippingFee.save();
            }
        });

        // Thực hiện tất cả các promises
        await Promise.all(updatePromises);

        return {
            success: true,
            message: "Đã cập nhật phí ship cho tất cả thành phố"
        };
    } catch (error) {
        console.error('Set shipping fee for all cities error:', error);
        return {
            success: false,
            message: "Lỗi khi cập nhật phí ship",
            error: error.message
        };
    }
};

//bài viết
const ServiceGetAcceptedBlogPosts = async () => {
    try {
        // Tìm các bài post đã được approved
        const acceptedBlogPosts = await BlogPost.aggregate([
            {
                $lookup: {
                    from: "approvals",
                    localField: "blog_post_id",
                    foreignField: "blog_post_id",
                    as: "approval"
                }
            },
            {
                $match: {
                    "approval.approval_status": "approved"
                }
            },
            // Sắp xếp theo ngày review mới nhất
            {
                $sort: { review_date: -1 }
            }
        ]);

        return {
            success: true,
            data: acceptedBlogPosts,
            message: "Lấy danh sách bài viết đã được phê duyệt thành công."
        };
    } catch (error) {
        console.error("Error in getting accepted blog posts:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách bài viết đã phê duyệt.",
            error: error.message
        };
    }
};

const ServiceGetAllBlogPosts = async () => {
    try {
        const blogPosts = await BlogPost.find()
            .sort({ createdAt: -1 }); 

        return {
            success: true,
            data: blogPosts,
            message: "Lấy danh sách bài viết thành công."
        };
    } catch (error) {
        console.error("Error in getting all blog posts:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách bài viết.",
            error: error.message
        };
    }
};

const ServiceGetUserBlogPosts = async (user_id) => {
    try {
        const userBlogPosts = await BlogPost.find({ user_id: user_id })

        return {
            success: true,
            data: userBlogPosts,
            message: "Lấy danh sách bài viết của người dùng thành công."
        };
    } catch (error) {
        console.error("Error in getting user blog posts:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách bài viết của người dùng.",
            error: error.message
        };
    }
};

const ServiceGetBlogPostByID = async (blog_post_id) => {
    try {
        const userBlogPosts = await BlogPost.findOne({ blog_post_id: blog_post_id })
            .sort({ createdAt: -1 });

        return {
            success: true,
            data: userBlogPosts,
            message: "Lấy bài viết thành công."
        };
    } catch (error) {
        console.error("Error in getting blog posts:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy bài viết.",
            error: error.message
        };
    }
};

const ServiceAddBlogPost = async (
    user_id,
    blog_title,
    blog_content,
    blog_image
) => {
    try {
        // Kiểm tra các trường bắt buộc
        if (!blog_title || !blog_content) {
            return {
                success: false,
                message: "Tiêu đề và nội dung bài viết là bắt buộc."
            };
        }

        // Tạo bài viết mới
        const newBlogPost = new BlogPost({
            user_id,
            blog_title,
            blog_content,
            blog_image
        });

        await newBlogPost.save();

        // Tạo trạng thái phê duyệt cho bài viết
        const newApproval = new Approval({
            blog_post_id: newBlogPost.blog_post_id
        });

        await newApproval.save();

        return {
            success: true,
            data: newBlogPost,
            message: "Thêm bài viết thành công và đang chờ phê duyệt."
        };
    } catch (error) {
        console.error("Error in adding blog post:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm bài viết.",
            error: error.message
        };
    }
};

const ServiceUpdateBlogPost = async (
    blog_post_id,
    user_id,
    blog_title,
    blog_content,
    blog_image
) => {
    try {
        const updatedBlogPost = await BlogPost.findOneAndUpdate(
            { blog_post_id, user_id },
            {
                blog_title,
                blog_content,
                blog_image
            },
            { new: true }
        );

        if (!updatedBlogPost) {
            return {
                success: false,
                message: "Không tìm thấy bài viết hoặc bạn không có quyền chỉnh sửa."
            };
        }

        // Reset trạng thái phê duyệt về waiting
        await Approval.findOneAndUpdate(
            { blog_post_id },
            { approval_status: "waiting" }
        );

        return {
            success: true,
            data: updatedBlogPost,
            message: "Cập nhật bài viết thành công và đang chờ phê duyệt lại."
        };

    } catch (error) {
        console.error("Error in updating blog post:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi cập nhật bài viết.",
            error: error.message
        };
    }
};

const ServiceDeleteBlogPost = async (blog_post_id, user_id) => {
    try {
        // Tìm và xoá bài viết
        const deletedBlogPost = await BlogPost.findOneAndDelete({
            blog_post_id,
            user_id 
        });

        if (!deletedBlogPost) {
            return {
                success: false,
                message: "Không tìm thấy bài viết hoặc bạn không có quyền xoá."
            };
        }

        // Xoá approval liên quan
        await Approval.findOneAndDelete({ blog_post_id });

        return {
            success: true,
            message: "Xoá bài viết thành công."
        };
    } catch (error) {
        console.error("Error in deleting blog post:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xoá bài viết.",
            error: error.message
        };
    }
};



module.exports = {
    ServiceRegisterUser,
    ServiceLoginUser,
    ServiceSalesRegistration,
    ServiceUpdateUser,
    ServiceGetUser,
    ServiceGetUserByID,
    ServiceUpdatePassword,

    

    // ServiceUpdateProduct,
    ServiceGetProductByUser,
    ServiceGetProductChildCategory,
    ServiceGetProductParentCategory,

    //sản phẩm yêu thích
    ServiceGetProductFavouriteById,
    ServiceGetAllProductFavourite,
    ServiceAddProductFavourite,
    ServiceRemoveProductFavourite, 
    //đánh giá
    ServiceGetRevỉewByProduct,
    ServiceAddReview,
    ServiceUpdateReview,
    ServiceDeleteReview,
    //mã giảm giá
    ServiceGetPromotionsByFarmId,
    ServiceAddBulkPromotion,
    ServiceAddPromotion,
    ServiceGetPromotionById,
    ServiceUpdatePromotion,
    ServiceDeletePromotion,
    ServiceGetPromotionsByProduct,

    //san pham
    ServiceGetAllProducts,
    ServiceGetAllProductsIncludeIsHidden,
    ServiceGetProductByParentCategory,
    ServiceGetProductByChildCategory,
    ServiceGetProductById,
    ServiceAddProduct,
    ServiceUpdateProduct,
    ServiceHideProduct,
    ServiceDeleteProduct,

    //phí giao hàng
    ServiceCreateShippingFee,
    ServiceUpdateShippingFee,
    ServiceDeleteShippingFee,
    ServiceGetShippingFeeByVendor,
    ServiceGetShippingFeeByVendorAndCity,
    ServiceSetShippingFeeForAllCities,

    //bài viết
    ServiceGetAllBlogPosts,
    ServiceGetAcceptedBlogPosts,
    ServiceGetUserBlogPosts,
    ServiceGetBlogPostByID,
    ServiceAddBlogPost,
    ServiceUpdateBlogPost,
    ServiceDeleteBlogPost,
};
