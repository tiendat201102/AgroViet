
// const mongoose = require('mongoose');

const User = require("../models/user");
const Role = require("../models/role");
require("dotenv").config();
const bcrypt = require("bcrypt");
const { isPasswordStrong } = require("./validators");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const axios = require('axios');
// const MOMO_CONFIG = require('../config/momoConfig');

const CategoryParent = require("../models/categoryParent");
const CategoryChild = require("../models/categoryChild");
const Cultivation = require('../models/formOfCultivation');
const Feature = require("../models/feature");
const Region = require("../models/region");
const City = require("../models/city");
const PaymentMethod = require("../models/paymentMethod");
const Order = require("../models/order");
const OrderDetail = require("../models/orderDetail");
const Product = require("../models/product");
const Approval = require("../models/approval");
const BlogPost = require("../models/blogPost");

const moment = require('moment');
const crypto = require('crypto');
const querystring = require('qs');
const vnpayConfig = require('../config/vnpay.config');




// Chức năng liên quan đến người dùng

const ServicegetAllUser = async () => {
    try {
        // Đầu tiên tìm role_id của USER
        const userRole = await Role.findOne({ name: "USER" });

        if (!userRole) {
            return { success: false, message: "Không tìm thấy role USER." };
        }

        console.log("USER role ID:", userRole._id);
        // Tìm tất cả user có role là USER
        const users = await User.find({ 
            $or: [
            { user_role_id: userRole._id }, 
            { is_farmer: true }        
        ]  })
            .populate({
                path: "user_role_id", 
                model: "role",
                select: "name",
            })
            .lean();

        if (!users || users.length === 0) {
            return { success: false, message: "Không tìm thấy người dùng nào." };
        }

        // Format lại dữ liệu trả về
        const formattedUsers = users.map((user) => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.user_role_id.name,
            gender: user.gender,
            phone: user.phone,
            is_farmer: user.is_farmer,
            application_status: user.application_status,
            is_hidden: user.is_hidden,
            farm_address: user.farm_address,
            farm_name: user.farm_name,
            farm_phone: user.farm_phone,
            address: user.address,
            // image: user.image
        }));

        console.log("Formatted Users:", formattedUsers);

        return {
            success: true,
            data: formattedUsers,
            message: "Lấy danh sách người dùng thành công.",
        };
    } catch (error) {
        console.error("Error in getting all users:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách người dùng.",
            error: error.message, 
        };
    }
};

const ServicePostBlockUser = async (email) => {
    try {
        const currentUser = await User.findOne({ email });
        const newHiddenStatus = !currentUser.is_hidden;

        const user = await User.findOneAndUpdate({ email }, { is_hidden: newHiddenStatus }, { new: true });

        const flagHide = newHiddenStatus ? "khóa" : "mở khóa";

        return {
            success: true,
            message: `Người dùng đã được ${flagHide} thành công.`,
            data: user,
        };
    } catch (error) {
        console.error("Error in blocking user:", error);
        return { success: false, message: "Đã có lỗi xảy ra khi khóa người dùng." };
    }
};

const ServiceGetFarmerApplications = async () => {
    try {
        // Tìm những người dùng là farmer hoặc đang đăng ký làm farmer
        const users = await User.find({
            $or: [
                { is_farmer: true },
                { application_status: { $in: ["pending", "approved", "rejected"] } }, 
            ],
        })
            .populate({
                path: "user_role_id",
                model: "role",
                select: "name",
            })
            .lean();

        if (!users || users.length === 0) {
            return {
                success: false,
                message: "Không tìm thấy danh sách đăng ký hoặc nhà vườn nào.",
            };
        }

        // Format lại dữ liệu trả về
        const formattedUsers = users.map((user) => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.user_role_id.name,
            phone: user.phone,
            is_farmer: user.is_farmer,
            application_status: user.application_status,
            farm_name: user.farm_name,
            farm_address: user.farm_address,
            city_id: user.city_id,
            region_id: user.region_id,
            farm_phone: user.farm_phone,
            farm_detail: user.farm_detail,
            farm_logo: user.farm_logo,
            farm_banner: user.farm_banner,
            rejection_reason: user.rejection_reason,
            is_hidden: user.is_hidden,
            city: user.farm_city_id,
            region: user.farm_region_id
        }));

        return {
            success: true,
            data: formattedUsers,
            message: "Lấy danh sách nhà vườn và đơn đăng ký thành công.",
        };
    } catch (error) {
        console.error("Error in getting farmer applications:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách nhà vườn và đơn đăng ký.",
            error: error.message,
        };
    }
};

const ServiceGetAllSalesman = async () => {
    try {
        // Tìm những người dùng là farmer hoặc đang đăng ký làm farmer
        const users = await User.find({
            $or: [
                { is_farmer: true },
            ],
        })
            .populate({
                path: "user_role_id",
                model: "role",
                select: "name",
            })
            .lean();

        if (!users || users.length === 0) {
            return {
                success: false,
                message: "Không tìm thấy danh sách đăng ký hoặc nhà vườn nào.",
            };
        }

        // Format lại dữ liệu trả về
        const formattedUsers = users.map((user) => ({
            user_id: user.user_id,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.user_role_id.name,
            phone: user.phone,
            is_farmer: user.is_farmer,
            application_status: user.application_status,
            farm_name: user.farm_name,
            farm_address: user.farm_address,
            farm_phone: user.farm_phone,
            farm_detail: user.farm_detail,
            farm_logo: user.farm_logo,
            farm_banner: user.farm_banner,
            rejection_reason: user.rejection_reason,
            is_hidden: user.is_hidden,
            city: user.farm_city_id,
            region: user.farm_region_id
        }));

        return {
            success: true,
            data: formattedUsers,
            message: "Lấy danh sách nhà vườn và đơn đăng ký thành công.",
        };
    } catch (error) {
        console.error("Error in getting farmer applications:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách nhà vườn và đơn đăng ký.",
            error: error.message,
        };
    }
};

const ServiceApproveFarmer = async (email) => {
    try {
        // Tìm role FARMER
        const farmerRole = await Role.findOne({ name: "FARMER" });
        if (!farmerRole) {
            return {
                success: false,
                message: "Không tìm thấy role FARMER trong hệ thống.",
            };
        }

        // Tìm và cập nhật user
        const updatedUser = await User.findOneAndUpdate(
            { email },
            {
                $set: {
                    is_farmer: true,
                    application_status: "approved",
                    user_role_id: farmerRole._id,
                },
            },
            { new: true }
        );

        if (!updatedUser) {
            return {
                success: false,
                message: "Không tìm thấy người dùng với email này.",
            };
        }

        return {
            success: true,
            message: "Đã phê duyệt đơn đăng ký thành công.",
            data: updatedUser,
        };
    } catch (error) {
        console.error("Error in approving farmer application:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi phê duyệt đơn đăng ký.",
            error: error.message,
        };
    }
};

const ServiceRejectFarmer = async (email, rejection_reason) => {
    try {
        if (!rejection_reason) {
            return {
                success: false,
                message: "Vui lòng cung cấp lý do từ chối.",
            };
        }

        // Tìm và cập nhật user
        const updatedUser = await User.findOneAndUpdate(
            { email },
            {
                $set: {
                    application_status: "rejected",
                    rejection_reason: rejection_reason,
                },
            },
            { new: true }
        );

        if (!updatedUser) {
            return {
                success: false,
                message: "Không tìm thấy người dùng với email này.",
            };
        }

        return {
            success: true,
            message: "Đã từ chối đơn đăng ký.",
            data: updatedUser,
        };
    } catch (error) {
        console.error("Error in rejecting farmer application:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi từ chối đơn đăng ký.",
            error: error.message,
        };
    }
};

const ServiceLoginAdmin = async (email, password) => {
    try {
        // Tìm role ADMIN
        const adminRole = await Role.findOne({ name: "ADMIN" });
        if (!adminRole) {
            return {
                success: false,
                message: "Không tìm thấy role ADMIN trong hệ thống.",
            };
        }

        // Tìm user với email được cung cấp
        const user = await User.findOne({ email }).populate("user_role_id");
        if (!user) {
            return {
                success: false,
                message: "Không tìm thấy người dùng với email này.",
            };
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return {
                success: false,
                message: "Mật khẩu không chính xác.",
            };
        }

        // Kiểm tra quyền admin dựa trên user_role_id
        if (!user.user_role_id.equals(adminRole._id)) {
            return {
                success: false,
                message: "Tài khoản không có quyền admin.",
            };
        }

        const payload = {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            role: user.user_role_id.name,
        };

        // console.log("ADMIN dang nhap la: ",
        //     {
        //         user_id: user.user_id,
        //         email: user.email,
        //         name: user.name,
        //         role: user.user_role_id.name,
        //     }
        // );
        

        // Tạo token JWT cho người dùng
        const access_token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        return {
            success: true,
            message: "Đăng nhập admin thành công.",
            access_token,
            data: {
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                role: user.user_role_id.name,
            },
        };
    } catch (error) {
        console.error("Error in admin login:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi đăng nhập.",
            error: error.message,
        };
    }
};

const ServiceRegisterAdmin = async (name, email, password) => {
    try {
        // Tìm role ADMIN
        const adminRole = await Role.findOne({ name: "ADMIN" });
        if (!adminRole) {
            return {
                success: false,
                message: "Không tìm thấy role ADMIN trong hệ thống.",
            };
        }

        // Kiểm tra xem người dùng đã tồn tại chưa
        const user = await User.findOne({ email });
        if (user) {
            console.log(`User exists: ${email}`);
            return { success: false, message: "Email đã tồn tại." };
        }

        // Kiểm tra tính hợp lệ của mật khẩu
        if (!isPasswordStrong(password)) {
            return { success: false, message: "Mật khẩu phải chứa ít nhất 6 ký tự, bao gồm chữ cái, số và ký tự đặc biệt." };
        }

        // Hash mật khẩu người dùng
        const hashPassword = await bcrypt.hash(password, saltRounds);

        const adminAccount = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            isAdmin: true,
            user_role_id: adminRole._id,
        });
        await adminAccount.populate("user_role_id");

        console.log("Created admin:", {
            user_id: adminAccount.user_id,
            name: adminAccount.name,
            email: adminAccount.email,
            isAdmin: adminAccount.isAdmin,
            user_role_id: adminAccount.user_role_id.name,
        });

        return {
            success: true,
            message: "Đăng nhập admin thành công.",
            data: {
                user_id_id: adminAccount.user_id,
                name: adminAccount.name,
                email: adminAccount.email,
                role: adminAccount.user_role_id.name,
                isAdmin: adminAccount.isAdmin,
            },
        };
    } catch (error) {
        console.error("Error in admin login:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi đăng nhập.",
            error: error.message,
        };
    }
};


// Chức năng liên quan đến sản phẩm
// Danh mục cha
const ServiceGetParentCategoryById = async (category_parent_id) => {
    try {
        const parentCategory = await CategoryParent.findOne({ 
            category_parent_id: category_parent_id 
        }).lean();
        
        if (!parentCategory) {
            return {
                success: false,
                message: "Không tìm thấy danh mục cha."
            };
        }

        return {
            success: true,
            data: parentCategory,
            message: "Lấy thông tin danh mục cha thành công."
        };
    } catch (error) {
        console.error("Error in getting parent category by id:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy thông tin danh mục cha.",
            error: error.message
        };
    }
};

const ServiceAddParentCategory = async (category_parent_name) => {
    try {
        // Kiểm tra xem danh mục đã tồn tại chưa
        const existingCategory = await CategoryParent.findOne({
            category_parent_name: category_parent_name
        });

        if (existingCategory) {
            return {
                success: false,
                message: "Danh mục cha này đã tồn tại."
            };
        }

        const newCategory = new CategoryParent({
            category_parent_name: category_parent_name
        });

        await newCategory.save();

        return {
            success: true,
            data: newCategory,
            message: `Thêm ${category_parent_name} vào danh mục cha thành công.`
        };
    } catch (error) {
        console.error("Error in adding parent category:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm danh mục cha.",
            error: error.message
        };
    }
};

const ServiceDeleteParentCategory = async (category_parent_id) => {
    try {
        // Kiểm tra xem danh mục có tồn tại không
        const category = await CategoryParent.findOne({category_parent_id: category_parent_id});
        if (!category) {
            return {
                success: false,
                message: "Không tìm thấy danh mục cha cần xóa."
            };
        }

        const category_parent_name = category.category_parent_name;

        // Xóa tất cả danh mục con thuộc danh mục cha này
        await CategoryChild.deleteMany({ category_parent_id: category_parent_id });

        // Xóa danh mục cha
        await CategoryParent.findOneAndDelete({category_parent_id: category_parent_id});

        return {
            success: true,
            message: `Xóa ${category_parent_name} khỏi danh mục cha và các danh mục con thành công.`
        };
    } catch (error) {
        console.error("Error in deleting parent category:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xóa danh mục cha.",
            error: error.message
        };
    }
};

const ServiceGetAllParentCategories = async () => {
    try {
        const parentCategories = await CategoryParent.find().lean();

        if (!parentCategories || parentCategories.length === 0) {
            return {
                success: false,
                message: "Không tìm thấy danh mục cha nào."
            };
        }

        return {
            success: true,
            data: parentCategories,
            message: "Lấy danh sách danh mục cha thành công."
        };
    } catch (error) {
        console.error("Error in getting parent categories:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách danh mục cha.",
            error: error.message
        };
    }
};

const ServiceGet1ParentCategories = async (category_parent_id) => {
    try {
        const parentCategory = await CategoryParent.findOne({category_parent_id: category_parent_id });

        // Kiểm tra nếu không tìm thấy danh mục
        if (!parentCategory) {
            return {
                success: false,
                message: "Danh mục cha không tồn tại"
            };
        }

        return {
            success: true,
            data: parentCategory,
            message: "Lấy thông tin danh mục cha thành công"
        };
    } catch (error) {
        console.error("Error in getting parent category:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi tìm kiếm danh mục cha",
            error: error.message
        };
    }
};


//Danh mục con
const ServiceGetChildCategoryById = async (category_child_id) => {
    try {
        const childCategory = await CategoryChild.findOne({ 
            category_child_id: category_child_id 
        }).lean();
        
        if (!childCategory) {
            return {
                success: false,
                message: "Không tìm thấy danh mục con."
            };
        }

        // Có thể thêm thông tin của danh mục cha nếu cần
        const parentCategory = await CategoryParent.findOne({
            category_parent_id: childCategory.category_parent_id
        }).lean();

        const result = {
            ...childCategory,
            parentCategory: parentCategory || null
        };

        return {
            success: true,
            data: result,
            message: "Lấy thông tin danh mục con thành công."
        };
    } catch (error) {
        console.error("Error in getting child category by id:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy thông tin danh mục con.",
            error: error.message
        };
    }
};

const ServiceAddChildCategory = async (category_parent_id, category_child_name) => {
    try {
        // Kiểm tra xem danh mục cha có tồn tại không
        const parentCategory = await CategoryParent.findOne({category_parent_id: category_parent_id});

        if (!parentCategory) {
            return {
                success: false,
                message: "Không tìm thấy danh mục cha."
            };
        }

        // const category_parent_name = parentCategory.category_parent_name;
        

        // Kiểm tra xem danh mục con đã tồn tại chưa
        const existingCategory = await CategoryChild.findOne({
            category_parent_id: category_parent_id,
            category_child_name: category_child_name,
            // category_parent_name: category_parent_name,
        });

        if (existingCategory) {
            return {
                success: false,
                message: "Danh mục con này đã tồn tại trong danh mục cha đã chọn."
            };
        }

        const newCategory = new CategoryChild({
            category_parent_id: category_parent_id,
            category_child_name: category_child_name
        });

        await newCategory.save();

        return {
            success: true,
            data: newCategory,
            message: `Thêm ${category_child_name} danh mục con thành công.`
        };
    } catch (error) {
        console.error("Error in adding child category:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm danh mục con.",
            error: error.message
        };
    }
};

const ServiceGetAllChildCategories = async () => {
    try {
        const childCategories = await CategoryChild.find()
            .lean();

        if (!childCategories || childCategories.length === 0) {
            return {
                success: false,
                message: "Không tìm thấy danh mục con nào."
            };
        }

        const result = await Promise.all(
            childCategories.map(async (child) => {
                const parentCategory = await CategoryParent.findOne({
                    category_parent_id: child.category_parent_id
                }).lean();

                return {
                    ...child,
                };
            })
        );
        
        // console.log("result >>> ", result);

        return {
            success: true,
            data: childCategories,
            message: "Lấy danh sách danh mục con thành công."
        };
    } catch (error) {
        console.error("Error in getting child categories:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách danh mục con.",
            error: error.message
        };
    }
};

const ServiceDeleteChildCategory = async (category_child_id) => {
    try {
        // Kiểm tra xem danh mục có tồn tại không
        const category = await CategoryChild.findOne({category_child_id: category_child_id});
        console.log("category >>> ", {category, category_child_id});
        
        if (!category) {
            return {
                success: false,
                message: "Không tìm thấy danh mục con cần xóa."
            };
        }

        await CategoryChild.findOneAndDelete({category_child_id: category_child_id});


        return {
            success: true,
            message: `Xóa ${category.category_child_name} khỏi danh mục con thành công.`
        };
    } catch (error) {
        console.error("Error in deleting child category:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xóa danh mục con.",
            error: error.message
        };
    }
};

const ServiceGet1ChildCategories = async (category_child_id) => {
    try {
        const childCategory = await CategoryChild.findOne({category_child_id: category_child_id });

        // Kiểm tra nếu không tìm thấy danh mục
        if (!childCategory) {
            return {
                success: false,
                message: "Danh mục con không tồn tại"
            };
        }

        return {
            success: true,
            data: childCategory,
            message: "Lấy thông tin danh mục con thành công"
        };
    } catch (error) {
        console.error("Error in getting child category:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi tìm kiếm danh mục con",
            error: error.message
        };
    }
};


//hình thức canh tác
const ServiceGetCultivationById = async (cultivation_id) => {
    try {
        const cultivation = await Cultivation.findOne({ cultivation_id: cultivation_id });
        
        if (!cultivation) {
            return {
                success: false,
                message: "Không tìm thấy phương thức canh tác."
            };
        }

        return {
            success: true,
            data: cultivation,
            message: "Lấy thông tin phương thức canh tác thành công."
        };
    } catch (error) {
        console.error("Error in getting cultivation by id:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy thông tin phương thức canh tác.",
            error: error.message
        };
    }
};

const ServiceGetAllCultivations = async () => {
    try {
        const cultivations = await Cultivation.find({});
        return {
            success: true,
            data: cultivations,
            message: "Lấy danh sách phương thức canh tác thành công."
        };
    } catch (error) {
        console.error("Error in getting cultivations:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách phương thức canh tác.",
            error: error.message
        };
    }
};

const ServiceAddCultivation = async (method_name) => {
    try {
        const existingCultivation = await Cultivation.findOne({ method_name });
        
        if (existingCultivation) {
            return {
                success: false,
                message: "Phương thức canh tác này đã tồn tại."
            };
        }

        const newCultivation = new Cultivation({ method_name });
        await newCultivation.save();

        return {
            success: true,
            data: newCultivation,
            message: "Thêm phương thức canh tác thành công."
        };
    } catch (error) {
        console.error("Error in adding cultivation:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm phương thức canh tác.",
            error: error.message
        };
    }
};

const ServiceUpdateCultivation = async (cultivation_id, method_name) => {
    try {
        const cultivation = await Cultivation.findOne({ cultivation_id: cultivation_id });
        
        if (!cultivation) {
            return {
                success: false,
                message: "Không tìm thấy phương thức canh tác."
            };
        }

        const existingCultivation = await Cultivation.findOne({ 
            method_name,
            cultivation_id: { $ne: cultivation_id }
        });

        if (existingCultivation) {
            return {
                success: false,
                message: "Phương thức canh tác này đã tồn tại."
            };
        }

        cultivation.method_name = method_name;
        await cultivation.save();

        return {
            success: true,
            data: cultivation,
            message: "Cập nhật phương thức canh tác thành công."
        };
    } catch (error) {
        console.error("Error in updating cultivation:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi cập nhật phương thức canh tác.",
            error: error.message
        };
    }
};

const ServiceDeleteCultivation = async (cultivation_id) => {
    try {
        const cultivation = await Cultivation.findOneAndDelete({ cultivation_id });
        
        if (!cultivation) {
            return {
                success: false,
                message: "Không tìm thấy phương thức canh tác."
            };
        }

        return {
            success: true,
            message: "Xóa phương thức canh tác thành công."
        };
    } catch (error) {
        console.error("Error in deleting cultivation:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xóa phương thức canh tác.",
            error: error.message
        };
    }
};


//tính chất
const ServiceGetFeatureById = async (feature_id) => {
    try {
        const feature = await Feature.findOne({ feature_id: feature_id });
        
        if (!feature) {
            return {
                success: false,
                message: "Không tìm thấy tính chất."
            };
        }

        return {
            success: true,
            data: feature,
            message: "Lấy thông tin tính chất thành công."
        };
    } catch (error) {
        console.error("Error in getting feature by id:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy thông tin tính chất.",
            error: error.message
        };
    }
};

const ServiceGetAllFeatures = async () => {
    try {
        const features = await Feature.find({});
        return {
            success: true,
            data: features,
            message: "Lấy danh sách tính năng thành công."
        };
    } catch (error) {
        console.error("Error in getting features:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách tính năng.",
            error: error.message
        };
    }
};

const ServiceAddFeature = async (feature_name) => {
    try {
        const existingFeature = await Feature.findOne({ feature_name });
        
        if (existingFeature) {
            return {
                success: false,
                message: "Tính năng này đã tồn tại."
            };
        }

        const newFeature = new Feature({ feature_name });
        await newFeature.save();

        return {
            success: true,
            data: newFeature,
            message: "Thêm tính năng thành công."
        };
    } catch (error) {
        console.error("Error in adding feature:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm tính năng.",
            error: error.message
        };
    }
};

const ServiceUpdateFeature = async (feature_id, feature_name) => {
    try {
        const feature = await Feature.findOne({ feature_id });
        
        if (!feature) {
            return {
                success: false,
                message: "Không tìm thấy tính năng."
            };
        }

        const existingFeature = await Feature.findOne({ 
            feature_name,
            feature_id: { $ne: feature_id }
        });

        if (existingFeature) {
            return {
                success: false,
                message: "Tính năng này đã tồn tại."
            };
        }

        feature.feature_name = feature_name;
        await feature.save();

        return {
            success: true,
            data: feature,
            message: "Cập nhật tính năng thành công."
        };
    } catch (error) {
        console.error("Error in updating feature:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi cập nhật tính năng.",
            error: error.message
        };
    }
};

const ServiceDeleteFeature = async (feature_id) => {
    try {
        const feature = await Feature.findOneAndDelete({ feature_id });
        
        if (!feature) {
            return {
                success: false,
                message: "Không tìm thấy tính năng."
            };
        }

        return {
            success: true,
            message: "Xóa tính năng thành công."
        };
    } catch (error) {
        console.error("Error in deleting feature:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xóa tính năng.",
            error: error.message
        };
    }
};

//sản phẩm
const ServiceDeleteProductByAdmin = async (feature_id) => {
    try {
        const feature = await Feature.findOneAndDelete({ feature_id });
        
        if (!feature) {
            return {
                success: false,
                message: "Không tìm thấy tính năng."
            };
        }

        return {
            success: true,
            message: "Xóa tính năng thành công."
        };
    } catch (error) {
        console.error("Error in deleting feature:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xóa tính năng.",
            error: error.message
        };
    }
};

//vùng
const ServiceGetRegionById = async (region_id) => {
    try {
        const region = await Region.findOne({region_id: region_id});
        console.log(region);
        
        return {
            success: true,
            data: region,
            message: "Lấy vùng miền thành công."
        };
    } catch (error) {
        console.error("Error in getting regions:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy vùng miền.",
            error: error.message
        };
    }
};

const ServiceGetAllRegion = async () => {
    try {
        const region = await Region.find({});
        return {
            success: true,
            data: region,
            message: "Lấy danh sách vùng miền thành công."
        };
    } catch (error) {
        console.error("Error in getting regions:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách vùng miền.",
            error: error.message
        };
    }
};

const ServiceAddRegion = async (region_name) => {
    try {
        const existingRegion = await Feature.findOne({ region_name });
        
        if (existingRegion) {
            return {
                success: false,
                message: `Vùng này đã tồn tại.`
            };
        }

        const newRegion = new Region({ region_name });
        await newRegion.save();

        return {
            success: true,
            data: newRegion,
            message: "Thêm vùng thành công."
        };
    } catch (error) {
        console.error("Error in adding region:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm vùng.",
            error: error.message
        };
    }
};

const ServiceUpdateRegion = async (region_id, region_name) => {
    try {
        const region = await Region.findOne({ region_id: region_id });
        
        if (!region) {
            return {
                success: false,
                message: "Không tìm thấy vùng miền tương ứng."
            };
        }

        const existingRegion = await Cultivation.findOne({ 
            region_name,
            region_id: { $ne: region_id }
        });

        if (existingRegion) {
            return {
                success: false,
                message: "Vùng miền này đã tồn tại."
            };
        }

        region.region_name = region_name;
        await region.save();

        return {
            success: true,
            data: region,
            message: "Cập nhật tên vùng miền thành công."
        };
    } catch (error) {
        console.error("Error in updating region:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi cập nhật tên vùng miền.",
            error: error.message
        };
    }
};

const ServiceDeleteRegion = async (region_id) => {
    try {
        const region = await Region.findOneAndDelete({ region_id });
        
        if (!region) {
            return {
                success: false,
                message: "Không tìm thấy vùng miền."
            };
        }

        return {
            success: true,
            message: "Xóa vùng miền thành công."
        };
    } catch (error) {
        console.error("Error in deleting region:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xóa vùng miền.",
            error: error.message
        };
    }
};

// thành phố 
const ServiceGetCityById = async (city_id) => {
    try {
        const cities = await City.findOne({city_id: city_id})
        return {
            success: true,
            data: cities,
            message: "Lấy thành phố thành công."
        };
    } catch (error) {
        console.error("Error in getting cities:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy thành phố.",
            error: error.message
        };
    }
};

const ServiceGetAllCities = async () => {
    try {
        const cities = await City.find({})
        // .populate('region_id');
        return {
            success: true,
            data: cities,
            message: "Lấy danh sách thành phố thành công."
        };
    } catch (error) {
        console.error("Error in getting cities:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách thành phố.",
            error: error.message
        };
    }
};

const ServiceAddCity = async (region_id, city_name) => {
    try {
        
        const existingCity = await City.findOne({ region_id: region_id, city_name: city_name });
        
        if (existingCity) {
            return {
                success: false,
                message: "Thành phố này đã tồn tại trong vùng miền này."
            };
        }

        const newCity = new City({ region_id: region_id, city_name: city_name });
        await newCity.save();

        return {
            success: true,
            data: newCity,
            message: "Thêm thành phố thành công."
        };
    } catch (error) {
        console.error("Error in adding city:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm thành phố.",
            error: error.message
        };
    }
};

const ServiceUpdateCity = async (city_id, region_id, city_name) => {
    try {
        const city = await City.findOne({ city_id });
        
        if (!city) {
            return {
                success: false,
                message: "Không tìm thấy thành phố tương ứng."
            };
        }

        const existingCity = await City.findOne({
            city_name,
            region_id,
            city_id: { $ne: city_id }
        });

        if (existingCity) {
            return {
                success: false,
                message: "Thành phố này đã tồn tại trong vùng miền này."
            };
        }

        city.region_id = region_id;
        city.city_name = city_name;
        await city.save();

        return {
            success: true,
            data: city,
            message: "Cập nhật thông tin thành phố thành công."
        };
    } catch (error) {
        console.error("Error in updating city:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi cập nhật thông tin thành phố.",
            error: error.message
        };
    }
};

const ServiceDeleteCity = async (city_id) => {
    try {
        const city = await City.findOneAndDelete({ city_id });
        
        if (!city) {
            return {
                success: false,
                message: "Không tìm thấy thành phố."
            };
        }

        return {
            success: true,
            message: "Xóa thành phố thành công."
        };
    } catch (error) {
        console.error("Error in deleting city:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xóa thành phố.",
            error: error.message
        };
    }
};

//phương thức thanh toán
const ServiceGetPaymentMethodById = async (payment_method_id) => {
    try {
        const cities = await City.find({payment_method_id: payment_method_id})
        return {
            success: true,
            data: cities,
            message: "Lấy phương thức thanh toán thành công."
        };
    } catch (error) {
        console.error("Error in getting payment method:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy phương thức thanh toán .",
            error: error.message
        };
    }
};

const ServiceGetAllPaymentMethods = async () => {
    try {
        const paymentMethods = await PaymentMethod.find({});
        return {
            success: true,
            data: paymentMethods,
            message: "Lấy danh sách phương thức thanh toán thành công."
        };
    } catch (error) {
        console.error("Error in getting payment methods:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách phương thức thanh toán.",
            error: error.message
        };
    }
};

const ServiceAddPaymentMethod = async (method_name) => {
    try {
        const existingMethod = await PaymentMethod.findOne({ method_name });
        
        if (existingMethod) {
            return {
                success: false,
                message: "Phương thức thanh toán này đã tồn tại."
            };
        }

        const newPaymentMethod = new PaymentMethod({ method_name });
        await newPaymentMethod.save();

        return {
            success: true,
            data: newPaymentMethod,
            message: "Thêm phương thức thanh toán thành công."
        };
    } catch (error) {
        console.error("Error in adding payment method:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm phương thức thanh toán.",
            error: error.message
        };
    }
};

const ServiceUpdatePaymentMethod = async (payment_method_id, method_name) => {
    try {
        const paymentMethod = await PaymentMethod.findOne({ payment_method_id:payment_method_id });
        
        if (!paymentMethod) {
            return {
                success: false,
                message: "Không tìm thấy phương thức thanh toán tương ứng."
            };
        }

        const existingMethod = await PaymentMethod.findOne({
            method_name,
            payment_method_id: { $ne: payment_method_id }
        });

        if (existingMethod) {
            return {
                success: false,
                message: "Phương thức thanh toán này đã tồn tại."
            };
        }

        paymentMethod.method_name = method_name;
        await paymentMethod.save();

        return {
            success: true,
            data: paymentMethod,
            message: "Cập nhật phương thức thanh toán thành công."
        };
    } catch (error) {
        console.error("Error in updating payment method:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi cập nhật phương thức thanh toán.",
            error: error.message
        };
    }
};

const ServiceDeletePaymentMethod = async (payment_method_id) => {
    try {
        const paymentMethod = await PaymentMethod.findOneAndDelete({ payment_method_id });
        
        if (!paymentMethod) {
            return {
                success: false,
                message: "Không tìm thấy phương thức thanh toán."
            };
        }

        return {
            success: true,
            message: "Xóa phương thức thanh toán thành công."
        };
    } catch (error) {
        console.error("Error in deleting payment method:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xóa phương thức thanh toán.",
            error: error.message
        };
    }
};

//đơn hàng
const ServiceCreateOrder = async (customer_id, farm_id, shipping_fee_id, total_amount) => {
    try {
        // Validate required fields
        
        console.log("customer_id > ",customer_id );
        console.log("farm_id > ",farm_id );
        // console.log("payment_method_id > ",payment_method_id );
        console.log("shipping_fee_id > ",shipping_fee_id );
        console.log("total_amount > ",total_amount );

        if (!customer_id || !farm_id || !total_amount) {
            return {
                success: false,
                message: "Thiếu thông tin đơn hàng cần thiết."
            };
        }

        if (customer_id == farm_id) {
            return {
                success: false,
                message: "Bạn không thể tự mua hàng của chính mình."
            };
        }
        

        // Create new order
        const newOrder = new Order({
            customer_id,
            farm_id,
            // payment_method_id,
            shipping_fee_id,
            total_amount,
            order_status: "pending",
            order_date: new Date()
        });

        const savedOrder = await newOrder.save();

        return {
            success: true,
            data: savedOrder,
            message: "Tạo đơn hàng thành công."
        };
    } catch (error) {
        console.error("Error in creating order:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi tạo đơn hàng.",
            error: error.message
        };
    }
};

const ServiceUpdateOrderStatus = async (order_id) => {
    try {

        const order = await Order.findOne({ order_id });
        
        if (!order) {
            return {
                success: false,
                message: "Không tìm thấy đơn hàng."
            };
        }

        order.order_status = "waiting";
        
        const updatedOrder = await order.save();

        return {
            success: true,
            data: updatedOrder,
            message: "Đơn hàng của bạn đang được chờ duyệt."
        };
    } catch (error) {
        console.error("Error in updating order status:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi cập nhật trạng thái đơn hàng.",
            error: error.message
        };
    }
};

// const MOMO_CONFIG = {
//     accessKey: 'F8BBA842ECF85',
//     secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
//     partnerCode: 'MOMO',
//     // redirectUrl: 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b',
//     redirectUrl: 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b',

//     ipnUrl: 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b',
//     endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create'
//   };
  
//   // MoMo payment service
//   const MomoPaymentService = {
//     createSignature(rawSignature, secretKey) {
//       return crypto
//         .createHmac('sha256', secretKey)
//         .update(rawSignature)
//         .digest('hex');
//     },
  
//     async createPaymentRequest(orderId, amount) {
//       try {
//         const requestId = MOMO_CONFIG.partnerCode + new Date().getTime();
//         const orderInfo = 'Pay with MoMo';
//         const extraData = '';
//         const requestType = "payWithMethod";
  
//         // Create raw signature
//         const rawSignature = 
//           "accessKey=" + MOMO_CONFIG.accessKey +
//           "&amount=" + amount +
//           "&extraData=" + extraData +
//           "&ipnUrl=" + MOMO_CONFIG.ipnUrl +
//           "&orderId=" + orderId +
//           "&orderInfo=" + orderInfo +
//           "&partnerCode=" + MOMO_CONFIG.partnerCode +
//           "&redirectUrl=" + MOMO_CONFIG.redirectUrl +
//           "&requestId=" + requestId +
//           "&requestType=" + requestType;
  
//         const signature = this.createSignature(rawSignature, MOMO_CONFIG.secretKey);
  
//         const requestBody = {
//           partnerCode: MOMO_CONFIG.partnerCode,
//           partnerName: "Test",
//           storeId: "MomoTestStore",
//           requestId: requestId,
//           amount: amount,
//           orderId: orderId,
//           orderInfo: orderInfo,
//           redirectUrl: MOMO_CONFIG.redirectUrl,
//           ipnUrl: MOMO_CONFIG.ipnUrl,
//           lang: 'vi',
//           requestType: requestType,
//           autoCapture: true,
//           extraData: extraData,
//           orderGroupId: '',
//           signature: signature
//         };
  
//         const response = await axios.post(MOMO_CONFIG.endpoint, requestBody, {
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         });
  
//         return response.data;
//       } catch (error) {
//         console.error('Error creating MoMo payment:', error);
//         throw error;
//       }
//     }
//   };

// const ServiceUpdateOrderStatus = async (order_id) => {
//     try {
//       const order = await Order.findOne({ order_id: order_id })
//       console.log("order_id > ", order_id);
//       console.log("order > ", order);
      
//       if (!order) {
//         return { success: false, message: "Không tìm thấy đơn hàng." };
//       }
  
//       // Check if this is a MoMo payment
//       const MOMO_PAYMENT_METHOD_ID = '6743ff2097df4fd44c40f9e5a';
//       if (order.payment_method_id.toString() === MOMO_PAYMENT_METHOD_ID) {
//         // Here you would typically verify the payment status with MoMo
//         // This would involve checking the payment status using MoMo's API
//         order.order_status = "waiting";
//         const updatedOrder = await order.save();
//         return {
//           success: true,
//           data: updatedOrder,
//           message: "Thanh toán MoMo thành công. Đơn hàng của bạn đang được chờ duyệt."
//         };
//       }
  
//       order.order_status = "waiting";
//       const updatedOrder = await order.save();
//       return {
//         success: true,
//         data: updatedOrder,
//         message: "Đơn hàng của bạn đang được chờ duyệt."
//       };
//     } catch (error) {
//       console.error("Error in updating order status:", error);
//       return {
//         success: false,
//         message: "Đã có lỗi xảy ra khi cập nhật trạng thái đơn hàng.",
//         error: error.message
//       };
//     }
//   };

const ServiceGetOrdersByCustomer = async (customer_id) => {
    try {
        const orders = await Order.find({ customer_id })
            // .populate('farm_id', 'farm_name')
            // .populate('payment_method_id', 'method_name')
            // .populate('shipping_fee_id');

        if (!orders.length) {
            return {
                success: true,
                data: [],
                message: "Không có đơn hàng nào."
            };
        }

        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                const details = await OrderDetail.find({ order_id: order.order_id })
                    // .populate('product_id', 'product_name product_image product_price');
                return {
                    ...order.toObject(),
                    details
                };
            })
        );

        return {
            success: true,
            data: ordersWithDetails,
            message: "Lấy danh sách đơn hàng thành công."
        };
    } catch (error) {
        console.error("Error in getting customer orders:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách đơn hàng.",
            error: error.message
        };
    }
};

const ServiceGetOrdersByFarm = async (farm_id) => {
    try {
        const orders = await Order.find({ farm_id })
            // .populate('customer_id', 'username email')
            // .populate('payment_method_id', 'method_name')
            // .populate('shipping_fee_id');

        if (!orders.length) {
            return {
                success: true,
                data: [],
                message: "Không có đơn hàng nào."
            };
        }

        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                const details = await OrderDetail.find({ order_id: order.order_id })
                    // .populate('product_id', 'product_name product_image product_price');
                return {
                    ...order.toObject(),
                    details
                };
            })
        );

        return {
            success: true,
            data: ordersWithDetails,
            message: "Lấy danh sách đơn hàng thành công."
        };
    } catch (error) {
        console.error("Error in getting farm orders:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách đơn hàng.",
            error: error.message
        };
    }
};


// const ServiceUpdateOrderStatus = async (order_id, order_status) => {
//     try {
//         if (!['pending', 'waiting', 'accept', 'reject'].includes(order_status)) {
//             return {
//                 success: false,
//                 message: "Trạng thái đơn hàng không hợp lệ."
//             };
//         }

//         const order = await Order.findOne({ order_id });
        
//         if (!order) {
//             return {
//                 success: false,
//                 message: "Không tìm thấy đơn hàng."
//             };
//         }

//         order.order_status = order_status;
//         if (order_status === 'accept' || order_status === 'reject') {
//             order.order_approval_date = new Date();
//         }
        
//         const updatedOrder = await order.save();

//         return {
//             success: true,
//             data: updatedOrder,
//             message: "Cập nhật trạng thái đơn hàng thành công."
//         };
//     } catch (error) {
//         console.error("Error in updating order status:", error);
//         return {
//             success: false,
//             message: "Đã có lỗi xảy ra khi cập nhật trạng thái đơn hàng.",
//             error: error.message
//         };
//     }
// };


const ServiceGetOrderTotal = async (order_id) => {
    try {
        const orderDetails = await OrderDetail.find({ order_id });
        
        if (!orderDetails.length) {
            return {
                success: false,
                message: "Không tìm thấy chi tiết đơn hàng."
            };
        }

        const total = orderDetails.reduce((sum, detail) => {
            return sum + (detail.price * detail.product_quantity);
        }, 0);

        return {
            success: true,
            data: { total },
            message: "Tính tổng giá trị đơn hàng thành công."
        };
    } catch (error) {
        console.error("Error in calculating order total:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi tính tổng giá trị đơn hàng.",
            error: error.message
        };
    }
};

// const ServiceAcceptOrder = async (order_id) => {
//     try {
//         const order = await Order.findOne({ order_id });
        
//         if (!order) {
//             return {
//                 success: false,
//                 message: "Không tìm thấy đơn hàng."
//             };
//         }

//         order.order_status = "accept";
//         const updatedOrder = await order.save();

//         return {
//             success: true,
//             data: updatedOrder,
//             message: "Đã chấp nhận đơn hàng."
//         };
//     } catch (error) {
//         console.error("Error in accepting order:", error);
//         return {
//             success: false,
//             message: "Đã có lỗi xảy ra khi chấp nhận đơn hàng.",
//             error: error.message
//         };
//     }
// };

const ServiceAcceptOrder = async (order_id) => {
    try {
        const order = await Order.findOne({ order_id });
        
        if (!order) {
            return {
                success: false,
                message: "Không tìm thấy đơn hàng."
            };
        }
 
        const orderDetails = await OrderDetail.find({ order_id: order.order_id });
 
        for (let detail of orderDetails) {
            const product = await Product.findOne({product_id: detail.product_id});
            
            if (!product) {
                console.log("product: ",detail.product_id);
                
                return {
                    success: false,
                    message: `Không tìm thấy sản phẩm: ${detail.product_id}`
                };
            }
 
            if (product.product_inventory < detail.product_quantity) {
                return {
                    success: false,
                    message: `Sản phẩm ${product.product_name} không đủ hàng tồn`
                };
            }
 
            product.product_inventory -= detail.product_quantity;
            await product.save();
        }
 
        order.order_status = "accept";
        order.order_approval_date = new Date();
        await order.save();
 
        return {
            success: true,
            message: "Đã chấp nhận đơn hàng và cập nhật hàng tồn."
        };
 
    } catch (error) {
        console.error("Error in accepting order:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi chấp nhận đơn hàng.",
            error: error.message
        };
    }
 };

const ServiceRejectOrder = async (order_id, rejection_reason) => {
    try {
        const order = await Order.findOne({ order_id });
        
        if (!order) {
            return {
                success: false,
                message: "Không tìm thấy đơn hàng."
            };
        }

        order.order_status = "reject";
        order.rejection_reason = rejection_reason;
        const updatedOrder = await order.save();

        return {
            success: true,
            data: updatedOrder,
            message: "Đã từ chối đơn hàng."
        };
    } catch (error) {
        console.error("Error in rejecting order:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi từ chối đơn hàng.",
            error: error.message
        };
    }
};

const ServiceDeleteOrder = async (order_id) => {
    try {
        // Validate order_id
        if (!order_id) {
            return {
                success: false,
                message: "order_id là bắt buộc"
            };
        }

        // Delete all order details first
        const deleteOrderDetails = await OrderDetail.deleteMany({ order_id });
        
        if (!deleteOrderDetails) {
            return {
                success: false,
                message: "Lỗi khi xóa chi tiết đơn hàng"
            };
        }

        // Then delete the order
        const deleteOrder = await Order.findOneAndDelete({ order_id });

        if (!deleteOrder) {
            return {
                success: false,
                message: "Không tìm thấy đơn hàng để xóa"
            };
        }

        return {
            success: true,
            message: "Xóa đơn hàng thành công"
        };

    } catch (error) {
        console.error("Error in deleting order:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi xóa đơn hàng",
            error: error.message
        };
    }
};

//chi tiết đơn hàng
const ServiceCreateOrderDetail = async (order_id, product_id, product_quantity, price) => {
    try {
        // Validate required fields
        
        if (!order_id || !product_id || !product_quantity || !price) {
            return {
                success: false,
                message: "Thiếu thông tin chi tiết đơn hàng cần thiết."
            };
        }

        const newOrderDetail = new OrderDetail({
            order_id,
            product_id,
            product_quantity,
            price
        });

        const savedOrderDetail = await newOrderDetail.save();

        return {
            success: true,
            data: savedOrderDetail,
            message: "Thêm chi tiết đơn hàng thành công."
        };
    } catch (error) {
        console.error("Error in creating order detail:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi thêm chi tiết đơn hàng.",
            error: error.message
        };
    }
};

const ServiceGetOrderDetails = async (order_id) => {
    try {
        const orderDetails = await OrderDetail.find({ order_id })
            // .populate('product_id', 'product_name product_image product_price');

        if (!orderDetails.length) {
            return {
                success: true,
                data: [],
                message: "Không có chi tiết đơn hàng nào."
            };
        }

        return {
            success: true,
            data: orderDetails,
            message: "Lấy chi tiết đơn hàng thành công."
        };
    } catch (error) {
        console.error("Error in getting order details:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy chi tiết đơn hàng.",
            error: error.message
        };
    }
};

const ServiceGetOrderDetailByUser = async (customer_id ) => {
    try {
        const orders = await Order.find({ customer_id: customer_id })
        console.log("order", ServiceGetOrdersByFarm)

        if (!customer_id) {
            return {
                success: true,
                message: "Người dùng không tồn tại."
            };
        }
        const order_id = orders[0]?.order_id; 
        console.log("order_id", order_id)

        const orderDetails = await OrderDetail.find({ order_id: order_id });


        return {
            success: true,
            data: [
                orders,
                orderDetails,
            ]
            
            ,
            message: "Lấy chi tiết đơn hàng thành công."
        };
    } catch (error) {
        console.error("Error in getting order details:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy chi tiết đơn hàng.",
            error: error.message
        };
    }
}


const ServiceGetOrderDetailByProduct = async (product_id) => {
    try {
        const orders = await OrderDetail.find({ product_id })

        if (!orders.length) {
            return {
                success: true,
                data: [],
                message: "Không có đơn hàng nào."
            };
        }

        // const ordersWithDetails = await Promise.all(
        //     orders.map(async (order) => {
        //         const details = await OrderDetail.find({ order_id: order.order_id })
        //         return {
        //             ...order.toObject(),
        //             details
        //         };
        //     })
        // );

        return {
            success: true,
            data: orders,
            message: "Lấy danh sách đơn hàng thành công."
        };
    } catch (error) {
        console.error("Error in getting farm orders:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy danh sách đơn hàng.",
            error: error.message
        };
    }
};

//duyệt bài viết
const ServiceGetApprovalByBlogPostID = async (blog_post_id) => {
    try {
        const blogPost = await BlogPost.findOne({ blog_post_id: blog_post_id })
            .lean(); 

        if (!blogPost) {
            return {
                success: false,
                message: "Không tìm thấy bài viết."
            };
        }

        // Lấy thông tin phê duyệt của bài viết
        const approval = await Approval.findOne({ blog_post_id: blog_post_id }).lean();

        // Kết hợp thông tin bài viết và trạng thái phê duyệt
        const blogPostWithApproval = {
            ...blogPost,
            approval_status: approval ? approval.approval_status : "waiting",
            rejection_reason: approval ? approval.rejection_reason : ""
        };

        return {
            success: true,
            data: blogPostWithApproval,
            message: "Lấy thông tin bài viết thành công."
        };
    } catch (error) {
        console.error("Error in getting blog post:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi lấy thông tin bài viết.",
            error: error.message
        };
    }
};

const ServiceApproveBlogPost = async (blog_post_id) => {
    try {
        // Kiểm tra quyền admin
        const admin = await User.findOne({ 
            // user_id: admin_id,
            isAdmin: true 
        });

        if (!admin) {
            return {
                success: false,
                message: "Bạn không có quyền phê duyệt bài viết."
            };
        }

        // Kiểm tra bài viết tồn tại
        const blogPost = await BlogPost.findOne({ blog_post_id });
        if (!blogPost) {
            return {
                success: false,
                message: "Không tìm thấy bài viết."
            };
        }

        // Cập nhật trạng thái phê duyệt
        const updatedApproval = await Approval.findOneAndUpdate(
            { blog_post_id },
            { 
                approval_status: "approved",
                rejection_reason: "" 
            },
            { new: true }
        );

        if (!updatedApproval) {
            return {
                success: false,
                message: "Không tìm thấy thông tin phê duyệt của bài viết."
            };
        }

        return {
            success: true,
            data: updatedApproval,
            message: "Phê duyệt bài viết thành công."
        };
    } catch (error) {
        console.error("Error in approving blog post:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi phê duyệt bài viết.",
            error: error.message
        };
    }
};

const ServiceRejectBlogPost = async (blog_post_id, rejection_reason) => {
    try {
        // Kiểm tra quyền admin
        const admin = await User.findOne({ 
            // user_id: admin_id,
            isAdmin: true 
        });

        if (!admin) {
            return {
                success: false,
                message: "Bạn không có quyền từ chối bài viết."
            };
        }

        // Kiểm tra lý do từ chối
        if (!rejection_reason) {
            return {
                success: false,
                message: "Vui lòng cung cấp lý do từ chối."
            };
        }

        // Kiểm tra bài viết tồn tại
        const blogPost = await BlogPost.findOne({ blog_post_id });
        if (!blogPost) {
            return {
                success: false,
                message: "Không tìm thấy bài viết."
            };
        }

        // Cập nhật trạng thái từ chối và lý do
        const updatedApproval = await Approval.findOneAndUpdate(
            { blog_post_id },
            { 
                approval_status: "rejected",
                rejection_reason: rejection_reason
            },
            { new: true }
        );

        if (!updatedApproval) {
            return {
                success: false,
                message: "Không tìm thấy thông tin phê duyệt của bài viết."
            };
        }

        return {
            success: true,
            data: updatedApproval,
            message: "Từ chối bài viết thành công."
        };
    } catch (error) {
        console.error("Error in rejecting blog post:", error);
        return {
            success: false,
            message: "Đã có lỗi xảy ra khi từ chối bài viết.",
            error: error.message
        };
    }
};



//VNPAY
// const createTestPaymentUrl = async (orderId, amount, ipAddr) => {
//     try {
//         process.env.TZ = 'Asia/Ho_Chi_Minh';
//         const createDate = moment().format('YYYYMMDDHHmmss');
        
//         let vnpParams = {
//             vnp_Version: '2.1.0',
//             vnp_Command: 'pay',
//             vnp_TmnCode: vnpayConfig.vnp_TmnCode,
//             vnp_Locale: 'vn',
//             vnp_CurrCode: 'VND',
//             vnp_TxnRef: moment().format('HHmmss'), // Mã giao dịch test, format: HHmmss
//             vnp_OrderInfo: `Test payment for order: ${orderId}`,
//             vnp_OrderType: 'other',
//             vnp_Amount: amount * 100,
//             vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
//             vnp_IpAddr: ipAddr || '127.0.0.1',
//             vnp_CreateDate: createDate,
//             // Thêm bank code test
//             vnp_BankCode: 'NCB' // Ngân hàng test mặc định
//         };

//         vnpParams = sortObject(vnpParams);
//         const signData = querystring.stringify(vnpParams, { encode: false });
//         const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
//         const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
//         vnpParams.vnp_SecureHash = signed;

//         const paymentUrl = `${vnpayConfig.vnp_Url}?${querystring.stringify(vnpParams, { encode: false })}`;
        
//         return {
//             success: true,
//             paymentUrl
//         };
//     } catch (error) {
//         console.error('Error creating test payment URL:', error);
//         return {
//             success: false,
//             message: 'Có lỗi xảy ra khi tạo URL thanh toán test'
//         };
//     }
// };

// function sortObject(obj) {
//     const sorted = {};
//     const str = [];
//     for (const key in obj) {
//         if (obj.hasOwnProperty(key)) {
//             str.push(encodeURIComponent(key));
//         }
//     }
//     str.sort();
//     for (const key of str) {
//         sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
//     }
//     return sorted;
// }

// // MOMO Config
// const MOMO_CONFIG = {
//     accessKey: 'F8BBA842ECF85',
//     secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
//     partnerCode: 'MOMO',
//     redirectUrl: 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b',
//     ipnUrl: 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b',
//     requestType: "payWithMethod",
//     lang: 'vi',
//     autoCapture: true
// };

// // Helper function to create MOMO signature
// const createMomoSignature = (rawSignature, secretKey) => {
//     return crypto.createHmac('sha256', secretKey)
//         .update(rawSignature)
//         .digest('hex');
// };

// // Helper function to prepare MOMO payment request
// const prepareMomoPayment = async (amount, orderId) => {
//     const requestId = MOMO_CONFIG.partnerCode + new Date().getTime();
//     const orderInfo = 'Thanh toán đơn hàng ' + orderId;
//     const extraData = '';
//     const orderGroupId = '';

//     // Create raw signature
//     const rawSignature = "accessKey=" + MOMO_CONFIG.accessKey + 
//                         "&amount=" + amount + 
//                         "&extraData=" + extraData + 
//                         "&ipnUrl=" + MOMO_CONFIG.ipnUrl + 
//                         "&orderId=" + orderId + 
//                         "&orderInfo=" + orderInfo + 
//                         "&partnerCode=" + MOMO_CONFIG.partnerCode + 
//                         "&redirectUrl=" + MOMO_CONFIG.redirectUrl + 
//                         "&requestId=" + requestId + 
//                         "&requestType=" + MOMO_CONFIG.requestType;

//     const signature = createMomoSignature(rawSignature, MOMO_CONFIG.secretKey);

//     const requestBody = {
//         partnerCode: MOMO_CONFIG.partnerCode,
//         partnerName: "Test",
//         storeId: "MomoTestStore",
//         requestId: requestId,
//         amount: amount.toString(),
//         orderId: orderId,
//         orderInfo: orderInfo,
//         redirectUrl: MOMO_CONFIG.redirectUrl,
//         ipnUrl: MOMO_CONFIG.ipnUrl,
//         lang: MOMO_CONFIG.lang,
//         requestType: MOMO_CONFIG.requestType,
//         autoCapture: MOMO_CONFIG.autoCapture,
//         extraData: extraData,
//         orderGroupId: orderGroupId,
//         signature: signature
//     };

//     try {
//         const response = await axios.post(
//             'https://test-payment.momo.vn/v2/gateway/api/create',
//             requestBody,
//             {
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );
//         return response.data;
//     } catch (error) {
//         throw new Error(`MOMO payment request failed: ${error.message}`);
//     }
// };





module.exports = {
    //Người dùng
    ServicegetAllUser,
    ServicePostBlockUser,
    ServiceGetFarmerApplications,
    ServiceApproveFarmer,
    ServiceRejectFarmer,
    ServiceLoginAdmin,
    ServiceRegisterAdmin,
    ServiceGetAllSalesman,


    //Sản phẩm
    ServiceGetParentCategoryById,
    ServiceAddParentCategory,
    ServiceDeleteParentCategory,
    ServiceGetAllParentCategories,
    ServiceGet1ParentCategories,

    ServiceGetChildCategoryById,
    ServiceAddChildCategory,
    ServiceGetAllChildCategories,
    ServiceDeleteChildCategory,
    ServiceGet1ChildCategories,

    // hình thức canh tác
    ServiceGetCultivationById,
    ServiceGetAllCultivations,
    ServiceAddCultivation,
    ServiceUpdateCultivation,
    ServiceDeleteCultivation,
    // tính chất
    ServiceGetFeatureById,
    ServiceGetAllFeatures,
    ServiceAddFeature,
    ServiceUpdateFeature,
    ServiceDeleteFeature,

    //vùng miền
    ServiceGetRegionById,
    ServiceGetAllRegion,
    ServiceAddRegion,
    ServiceUpdateRegion,
    ServiceDeleteRegion,

    //thành phố
    ServiceGetCityById,
    ServiceGetAllCities,
    ServiceAddCity,
    ServiceUpdateCity,
    ServiceDeleteCity,

    //phương thức thanh toán
    ServiceGetPaymentMethodById,
    ServiceGetAllPaymentMethods,
    ServiceAddPaymentMethod,
    ServiceUpdatePaymentMethod,
    ServiceDeletePaymentMethod,

    //đơn hàng
    ServiceCreateOrder,
    ServiceUpdateOrderStatus,
    ServiceGetOrdersByCustomer,
    ServiceGetOrdersByFarm,
    ServiceGetOrderTotal,
    ServiceAcceptOrder,
    ServiceRejectOrder,
    ServiceDeleteOrder,

    //chi tiết đơn hàng
    ServiceCreateOrderDetail,
    ServiceGetOrderDetails,
    ServiceGetOrderDetailByUser,
    ServiceGetOrderDetailByProduct,

    //duyệt bài viết
    ServiceGetApprovalByBlogPostID,
    ServiceApproveBlogPost,
    ServiceRejectBlogPost,

};
