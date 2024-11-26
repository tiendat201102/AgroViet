"use client"
import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { getAllBlogPosts, deleteBlogPost, getUserByID, getBlogPostByID } from "@/util/userAPI";
import { approveBlogPost, rejectBlogPost, getApprovalByBlogPostID } from "@/util/adminAPI";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";

const ManageBlogPostsPage = () => {
    const [posts, setPosts] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showBlogDetailModal, setShowBlogDetailModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedBlogDetail, setSelectedBlogDetail] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [sortType, setSortType] = useState("newest");
    const itemsPerPage = 10;

    useEffect(() => {
        fetchBlogPosts();
    }, []);

    const fetchBlogPosts = async () => {
        setLoading(true);
        try {
            const response = await getAllBlogPosts();
            if (response.success) {
                // Fetch user names and approval status for each post
                const postsWithDetails = await Promise.all(
                    response.data.map(async (post) => {
                        try {
                            const [userResponse, approvalResponse] = await Promise.all([
                                getUserByID(post.user_id),
                                getApprovalByBlogPostID(post.blog_post_id)
                            ]);

                            return {
                                ...post,
                                author_name: userResponse.success ? userResponse.data.name : "Unknown",
                                blog_image: userResponse.success ? userResponse.data.blog_image : null,
                                approval_status: approvalResponse.success ? approvalResponse.data.approval_status : "waiting",
                                rejection_reason: approvalResponse.success ? approvalResponse.data.rejection_reason : ""
                            };
                        } catch (error) {
                            console.error("Error fetching post details:", error);
                            return {
                                ...post,
                                author_name: "Unknown",
                                approval_status: "waiting",
                                rejection_reason: ""
                            };
                        }
                    })
                );

                const sortedPosts = [...postsWithDetails].sort(
                    (a, b) => new Date(b.review_date) - new Date(a.review_date)
                );
                setPosts(sortedPosts);
                handleSort(sortedPosts, "newest");
            }
        } catch (error) {
            toast.error("Không thể tải danh sách bài viết");
        }
        setLoading(false);
    };

    const handleSort = (allPosts = posts, type = sortType) => {
        let sorted = [...allPosts];
        
        // Apply search filter first
        if (searchTerm) {
            sorted = sorted.filter(post => 
                post.blog_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.author_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        } else {
            // Nếu không có search term, reset về trang đầu
            setCurrentPage(0);
        }

        // Áp dụng sắp xếp
        switch (type) {
            case "newest":
                sorted.sort((a, b) => new Date(b.review_date) - new Date(a.review_date));
                break;
            case "oldest":
                sorted.sort((a, b) => new Date(a.review_date) - new Date(b.review_date));
                break;
            case "approved":
                sorted = sorted.filter(p => p.approval_status === "approved");
                break;
            case "pending":
                sorted = sorted.filter(p => p.approval_status === "waiting");
                break;
            case "rejected":
                sorted = sorted.filter(p => p.approval_status === "rejected");
                break;
        }

        setSortType(type);
        updateDisplayedPosts(sorted, 0);
    };

    const handleApprove = async (post) => {
        try {
            const response = await approveBlogPost(post.blog_post_id);
            if (response.success) {
                toast.success("Phê duyệt bài viết thành công");
                await fetchBlogPosts();
            }
        } catch (error) {
            toast.error("Không thể phê duyệt bài viết");
        }
    };

    const handleReject = async () => {
        if (!selectedPost || !rejectionReason) return;

        try {
            const response = await rejectBlogPost(selectedPost.blog_post_id, rejectionReason);
            if (response.success) {
                toast.success("Từ chối bài viết thành công");
                setShowRejectModal(false);
                setRejectionReason("");
                await fetchBlogPosts();
            }
        } catch (error) {
            toast.error("Không thể từ chối bài viết");
        }
    };

    const handleDelete = async () => {
        try {
            const response = await deleteBlogPost(selectedPost.blog_post_id);
            if (response.success) {
                toast.success("Xóa bài viết thành công");
                setShowDeleteModal(false);
                await fetchBlogPosts();
            }
        } catch (error) {
            toast.error("Không thể xóa bài viết");
        }
    };

    const handleShowBlogDetail = async (post) => {
        try {
            const response = await getBlogPostByID(post.blog_post_id);
            if (response.success) {
                // Thêm thông tin tác giả vào chi tiết bài viết
                const userResponse = await getUserByID(post.user_id);
                const blogDetail = {
                    ...response.data,
                    author_name: userResponse.success ? userResponse.data.name : "Không rõ",
                };
                setSelectedBlogDetail(blogDetail);
                setShowBlogDetailModal(true);
            }
        } catch (error) {
            toast.error("Không thể tải chi tiết bài viết");
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error("Invalid date:", dateString);
            return "Ngày không hợp lệ";
        }
    };

    const updateDisplayedPosts = (sortedPosts, page) => {
        const startIndex = page * itemsPerPage;
        setDisplayedPosts(sortedPosts.slice(startIndex, startIndex + itemsPerPage));
        setCurrentPage(page);
    };

    const handlePageClick = (event) => {
        let filtered = [...posts];
        if (searchTerm) {
            filtered = filtered.filter(post => 
                post.blog_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.author_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        updateDisplayedPosts(filtered, event.selected);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Quản lý bài viết</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-1/3">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề hoặc tác giả"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                handleSort(posts, sortType);
                            }}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select 
                        className="border rounded px-3 py-2" 
                        value={sortType} 
                        onChange={(e) => handleSort(posts, e.target.value)}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left">Tiêu đề</th>
                                    <th className="px-4 py-2 text-left">Tác giả</th>
                                    <th className="px-4 py-2 text-left w-32">Trạng thái</th>
                                    <th className="px-4 py-2 text-left">Lý do từ chối</th>
                                    <th className="px-4 py-2 text-left">Ngày đăng</th>
                                    <th className="px-4 py-2 text-left">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedPosts.map((post) => (
                                    <tr key={post.blog_post_id} className="border-b">
                                        <td 
                                            className="px-4 py-2 cursor-pointer text-blue-600 hover:underline" 
                                            onClick={() => handleShowBlogDetail(post)}
                                        >
                                            {post.blog_title}
                                        </td>
                                        <td className="px-4 py-2">{post.author_name}</td>
                                        <td className="px-4 py-2">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                                post.approval_status === "approved"
                                                    ? "bg-green-100 text-green-800"
                                                    : post.approval_status === "rejected"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                                {post.approval_status === "approved"
                                                    ? "Đã duyệt"
                                                    : post.approval_status === "rejected"
                                                    ? "Từ chối"
                                                    : "Chờ duyệt"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            {post.rejection_reason || "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {formatDate(post.review_date)}
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex space-x-2">
                                                {post.approval_status === "waiting" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(post)}
                                                            className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50"
                                                        >
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPost(post);
                                                                setShowRejectModal(true);
                                                            }}
                                                            className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setSelectedPost(post);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-50"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg max-w-sm mx-auto">
                            <h3 className="text-lg font-medium mb-4">Xác nhận xóa</h3>
                            <p className="text-gray-500 mb-4">
                                Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg max-w-md mx-auto">
                            <h3 className="text-lg font-medium mb-4">Từ chối bài viết</h3>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Nhập lý do từ chối..."
                                className="w-full px-3 py-2 border rounded-md mb-4"
                                rows="4"
                            />
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    disabled={!rejectionReason.trim()}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}

{showBlogDetailModal && selectedBlogDetail && (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={(e) => {
            if (e.target === e.currentTarget) {
                setShowBlogDetailModal(false);
            }
        }}
    >
        <div 
            className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
        >
            <button 
                onClick={() => setShowBlogDetailModal(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
                ✕
            </button>
            
            {selectedBlogDetail.blog_image && (
                <img 
                    src={`data:image/jpeg;base64,${selectedBlogDetail.blog_image}`} 
                    alt="Ảnh bài viết" 
                    className="w-full h-64 object-cover rounded-lg mb-4"
                />
            )}
            
            <h2 className="text-2xl font-bold mb-4">{selectedBlogDetail.blog_title}</h2>
            <div className="flex items-center mb-4">
                <div>
                    <div><strong>Tác giả:</strong> {selectedBlogDetail.author_name || "Không rõ"}</div>
                    <div><strong>Ngày đăng:</strong> {formatDate(selectedBlogDetail.review_date)}</div>
                </div>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{__html: selectedBlogDetail.blog_content}}></div>
        </div>
    </div>
)}
            </div>

            <ReactPaginate
                breakLabel="..."
                nextLabel="Tiếp >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={Math.ceil(posts.length / itemsPerPage)}
                previousLabel="< Trước"
                renderOnZeroPageCount={null}
                className="mt-4 flex items-center justify-center gap-2"
                pageClassName="px-3 py-1 border rounded hover:bg-blue-400"
                previousClassName="px-3 py-1 border rounded hover:bg-gray-100"
                nextClassName="px-3 py-1 border rounded hover:bg-gray-100"
                activeClassName="bg-blue-500 text-white"
                disabledClassName="opacity-50 cursor-not-allowed"
            />
            </div>
    )
}
export default ManageBlogPostsPage;
