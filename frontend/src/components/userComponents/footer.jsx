import React from 'react';
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Đại học Cần Thơ</h3>
            <p className="text-sm mb-4">
              Đại học Cần Thơ là một trong những trường đại học hàng đầu tại khu vực Đồng bằng sông Cửu Long, chuyên đào tạo nguồn nhân lực chất lượng cao và thực hiện các nghiên cứu ứng dụng vào đời sống và sản xuất, đáp ứng nhu cầu phát triển của vùng và cả nước.
            </p>
            <p className="text-xs">MST/ĐKKD: 0102635866</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Địa chỉ</h4>
            <p className="text-sm mb-2">
              Trường Đại học Cần Thơ: Khu II, đường 3/2, Ninh Kiều, thành phố Cần Thơ
            </p>
            <p className="text-sm mb-2">Điện thoại: 0292 3832663</p>
            <p className="text-sm">Email: dhct@ctu.edu.vn</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Hướng dẫn</h4>
            <ul className="text-sm space-y-2">
              <li>Hướng dẫn đăng ký khóa học</li>
              <li>Thông tin tuyển sinh</li>
              <li>Hướng dẫn sử dụng thư viện</li>
              <li>Chính sách và quy định</li>
              <li>Giải quyết khiếu nại</li>
              <li>Hỗ trợ sinh viên</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">&copy; 2022 - Bản quyền thuộc về Đại học Cần Thơ</p>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-blue-400">
              <FaFacebook size={24} />
            </a>
            <a href="#" className="text-white hover:text-pink-400">
              <FaInstagram size={24} />
            </a>
          </div>
          <Image src="/payment.png" alt="Phương thức thanh toán" width={200} height={30} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;