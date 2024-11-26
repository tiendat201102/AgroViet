"use client";
import React, { useState, useEffect } from "react";
import { getAllUser, getCityById, getRegionById, putBlockUser } from "../../../util/adminAPI";
import { FaLock, FaUnlock, FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from "react-paginate";
import Modal from "react-modal";


export default function ManageUserPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [itemOffset, setItemOffset] = useState(0);
    const [filter, setFilter] = useState(""); // Trạng thái filter
    const [searchTerm, setSearchTerm] = useState(""); // Tìm kiếm theo tên
    const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái mở/đóng modal
    const [selectedUser, setSelectedUser] = useState(null); // Thông tin người dùng được chọn

    const itemsPerPage = 10;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const result = await getAllUser();
                if (result.success && result.data) {
                    setUsers(result.data);
                    setFilteredUsers(result.data);
                    setPageCount(Math.ceil(result.data.length / itemsPerPage));
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        handleFilterAndSearch();
    }, [filter, searchTerm, users]);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % filteredUsers.length;
        setItemOffset(newOffset);
    };

    const handleBlockAndUnlockUser = async (email) => {
        if (!email) {
            console.log("No email provided for blocking/unblocking");
            return;
        }

        try {
            const res = await putBlockUser(email);
            if (res.success) {
                const currentUser = users.find((user) => user.email === email);
                const newHiddenStatus = !currentUser.is_hidden;

                toast.success(newHiddenStatus ? "Người dùng đã bị khóa thành công" : "Người dùng đã được mở khóa thành công");

                setUsers((prevUsers) => prevUsers.map((user) => (user.email === email ? { ...user, is_hidden: newHiddenStatus } : user)));
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error("Error blocking/unblocking user:", error);
            toast.error("Đã xảy ra lỗi khi thay đổi trạng thái người dùng");
        }
    };

    const handleFilterAndSearch = () => {
        let filtered = users;

        if (filter === "hidden") {
            filtered = users.filter((user) => user.is_hidden);
        } else if (filter === "visible") {
            filtered = users.filter((user) => !user.is_hidden);
        }

        if (searchTerm) {
            filtered = filtered.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredUsers(filtered);
        setPageCount(Math.ceil(filtered.length / itemsPerPage));
    };

    const currentUsers = filteredUsers.slice(itemOffset, itemOffset + itemsPerPage);

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const tableRows = currentUsers.map((user, index) => (
        <tr key={user._id} className={user.is_hidden ? "bg-gray-100" : "bg-white"}>
            <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">{itemOffset + index + 1}</td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200">
                <button onClick={() => handleOpenModal(user)} >
                    {user.name}
                </button>
            </td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200">{user.email}</td>
            {/* <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">{user.role}</td> */}
            <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">{user.gender=="MALE" ? "Nam" : "Nữ"  }</td>
            <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">
                <button onClick={() => handleBlockAndUnlockUser(user.email)} className="flex items-center justify-center w-full h-full">
                    {user.is_hidden ? <FaLock className="text-red-500 text-xl cursor-pointer" /> : <FaUnlock className="text-green-500 text-xl cursor-pointer" />}
                </button>
            </td>
        </tr>
    ));

    if (currentUsers.length < itemsPerPage) {
        const emptyRows = Array.from({ length: itemsPerPage - currentUsers.length }, (_, index) => (
            <tr key={`empty-${index}`} className="bg-white">
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">{itemOffset + currentUsers.length + index + 1}</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
                <td className="px-4 py-2.5 border-r border-b border-gray-200 text-center">-</td>
            </tr>
        ));
        tableRows.push(...emptyRows);
    }

    return (
        <div className="container mx-auto p-2 flex flex-col min-h-screen">
            <div className="flex items-center justify-between mb-4">
                <div className="relative w-1/4">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <select
                        className="px-4 py-2 border rounded"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        <option value="hidden">Người dùng bị khoá</option>
                        <option value="visible">Người dùng không bị khoá</option>
                    </select>
                </div>
            </div>

            <div className="flex-grow">
                <table className="min-w-full bg-white border border-gray-200 table-fixed">
                    <thead>
                        <tr>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">STT</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Họ và tên</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Email</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Giới tính</th>
                            <th className="px-4 py-2.5 border-r border-b border-gray-300">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>{tableRows}</tbody>
                </table>

                <ReactPaginate
                    breakLabel="..."
                    nextLabel="Tiếp >"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={5}
                    pageCount={pageCount}
                    previousLabel="< Trước"
                    renderOnZeroPageCount={null}
                    className="mt-4 flex items-center justify-center gap-2"
                    pageClassName="px-3 py-1 border rounded hover:bg-gray-100"
                    previousClassName="px-3 py-1 border rounded hover:bg-gray-100"
                    nextClassName="px-3 py-1 border rounded hover:bg-gray-100"
                    activeClassName="bg-blue-500 text-white"
                    disabledClassName="opacity-50 cursor-not-allowed"
                />
            </div>

            {selectedUser && (
                <Modal isOpen={isModalOpen} onRequestClose={handleCloseModal} className="p-6 bg-white border rounded-lg w-1/3 mx-auto mt-20">
                    <h2 className="text-xl font-bold mb-4">Thông tin người dùng</h2>
                    <p><strong>Ảnh cá nhân:</strong> {selectedUser.image}</p>
                    <p><strong>Họ và tên:</strong> {selectedUser.name}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Role:</strong> {selectedUser.role}</p>
                    <p><strong>Trạng thái:</strong> {selectedUser.is_hidden ? "Bị khóa" : "Không bị khóa"}</p>
                    <p><strong>Giới tính:</strong> {selectedUser.gender}</p>
                    <p><strong>Số điện thoại:</strong> {selectedUser.phone}</p>
                    

                    <button onClick={handleCloseModal} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Đóng</button>
                </Modal>
            )}
            
        </div>
    );
}
