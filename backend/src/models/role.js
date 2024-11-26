const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        enum: ['USER', 'FARMER', 'ADMIN']
    }
});

const Role = mongoose.model('role', roleSchema);

// Hàm tạo các vai trò mặc định
const createDefaultRoles = async () => {
  try {
      const roles = ['USER', 'FARMER', 'ADMIN'];
      for (let role of roles) {
          // Kiểm tra xem vai trò đã tồn tại chưa
          const roleExists = await Role.findOne({ name: role });
          if (!roleExists) {
              // Nếu chưa tồn tại thì tạo mới
              await Role.create({ name: role });
              console.log(`Role ${role} created.`);
          }
      }
  } catch (error) {
      console.error("Error creating default roles:", error);
  }
};

// Gọi hàm này khi khởi tạo ứng dụng
createDefaultRoles();

module.exports = Role;
