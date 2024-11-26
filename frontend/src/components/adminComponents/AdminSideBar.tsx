"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaUser } from "react-icons/fa";
import { GiShop } from "react-icons/gi";
import { MdOutlineCategory } from "react-icons/md";

export default function AdminSideBar() {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Manage Users',
      icon: <FaUser />,
      path: '/Admin/ManageUser'
    },
    {
      title: 'Manage Business',
      icon: <GiShop/>,
      path: '/Admin/ManageBusiness'
    },
    {
      title: 'Manage Category',
      icon: <MdOutlineCategory/>,
      path: '/Admin/ManageCategory'
    },
    {
      title: 'Manage Form of Cultivation',
      icon: <MdOutlineCategory/>,
      path: '/Admin/ManageCultivation'
    },
    {
      title: 'Manage Characteristic',
      icon: <MdOutlineCategory/>,
      path: '/Admin/ManageFeature'
    },
    {
      title: 'Manage Product',
      icon: <MdOutlineCategory/>,
      path: '/Admin/ManageProduct'
    },
    {
      title: 'Manage City',
      icon: <MdOutlineCategory/>,
      path: '/Admin/ManageCity'
    },
    {
      title: 'Manage Payment Method',
      icon: <MdOutlineCategory/>,
      path: '/Admin/ManagePaymentMethod'
    },
    {
      title: 'Manage Blog Post',
      icon: <MdOutlineCategory/>,
      path: '/Admin/ManageBlogPost'
    },
  ];

  return (
    <div
      className="relative w-[290px] shadow-lg left-0 top-0 bg-cover bg-center overflow-y-auto"
      style={{ backgroundImage: 'url("/background-sidebar.png")' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-70"></div>

      {/* Sidebar Content */}
      {/* <div className="relative p-4 border-b bg-[#1c2434] bg-opacity-90"> */}
      <div className="relative p-4 border-b bg-[#1c2434] bg-opacity-90">
        <h1 className="text-xl font-bold text-white">VietAgro Admin</h1>
      </div>

      <nav className="relative mt-6">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.path}
            className={`flex items-center px-6 py-3 text-white hover:bg-[rgba(255,0,0,0.5)] ${
              pathname === item.path ? 'bg-[rgba(0,0,0,0.5)] border-l-4 border-green-500' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}