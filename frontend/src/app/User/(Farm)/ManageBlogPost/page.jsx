"use client";
import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { getUserBlogPosts, deleteBlogPost, updateBlogPost } from "@/util/userAPI";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/userComponents/loadingSpinner";
import { getApprovalByBlogPostID } from "@/util/adminAPI";

const BlogManagement = () => {
    const [blogPosts, setBlogPosts] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [updateForm, setUpdateForm] = useState({
        blog_title: "",
        blog_content: "",
        blog_post_id: "",
    });
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(0);
    const [sortType, setSortType] = useState("newest");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    useEffect(() => {
        fetchBlogPosts();
    }, []);

    const fetchBlogPosts = async () => {
      setLoading(true);
      try {
          const userInfo = getCookie("user_info");
          if (!userInfo) return;
          const userData = JSON.parse(userInfo);

          const response = await getUserBlogPosts(userData.user_id);
          if (response.success) {
              // Fetch approval status and rejection reason for each blog post
              const postsWithApproval = await Promise.all(
                  response.data.map(async (post) => {
                      try {
                          const approvalResponse = await getApprovalByBlogPostID(post.blog_post_id);
                          return {
                              ...post,
                              approval_status: approvalResponse.success ? approvalResponse.data.approval_status : "waiting",
                              rejection_reason: approvalResponse.success ? approvalResponse.data.rejection_reason : ""
                          };
                      } catch (error) {
                          console.error("Error fetching approval status:", error);
                          return { 
                              ...post, 
                              approval_status: "waiting",
                              rejection_reason: ""
                          };
                      }
                  })
              );

              const sortedPosts = [...postsWithApproval].sort(
                  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );
              setBlogPosts(sortedPosts);
              handleSort(sortedPosts, "newest");
          }
      } catch (error) {
          toast.error("Không thể tải danh sách bài viết");
      }
      setLoading(false);
  };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Tạo preview URL cho ảnh
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const metrics = [
        {
            title: "Tổng bài viết",
            value: blogPosts.length,
            bgColor: "bg-blue-100",
            textColor: "text-blue-600",
        },
        {
            title: "Bài viết đã duyệt",
            value: blogPosts.filter((p) => p.approval_status === "approved").length,
            bgColor: "bg-green-100",
            textColor: "text-green-600",
        },
        {
            title: "Bài viết chờ duyệt",
            value: blogPosts.filter((p) => p.approval_status === "waiting").length,
            bgColor: "bg-yellow-100",
            textColor: "text-yellow-600",
        },
    ];

    const handleUpdate = (post) => {
        setSelectedPost(post);
        setUpdateForm({
            blog_title: post.blog_title,
            blog_content: post.blog_content,
            blog_image: post.blog_image || "",
            review_date: new Date(post.review_date).toISOString().split("T")[0],
            blog_post_id: post.blog_post_id,
        });
        setShowUpdateModal(true);
    };

    const handleUpdateSubmit = async () => {
        try {
            if (!updateForm.blog_post_id) {
                toast.error("Không tìm thấy bài viết");
                return;
            }

            const userInfo = getCookie("user_info");
            if (!userInfo) {
                toast.error("Vui lòng đăng nhập lại");
                return;
            }
            const userData = JSON.parse(userInfo);

            // Chuẩn bị dữ liệu cập nhật
            let updateData = {
                blog_title: updateForm.blog_title,
                blog_content: updateForm.blog_content,
            };

            // Nếu có file ảnh mới, convert sang base64
            if (imageFile) {
                const base64Image = await convertImageToBase64(imageFile);
                updateData.blog_image = base64Image;
                // updateData.blog_image = imageFile;
            }

            const response = await updateBlogPost(
                updateForm.blog_post_id,
                userData.user_id,
                updateData.blog_title,
                updateData.blog_content,
                updateData.blog_image
            );

            if (response.success) {
                toast.success("Cập nhật bài viết thành công");
                setShowUpdateModal(false);
                await fetchBlogPosts();
            } else {
                toast.error(response.message || "Không thể cập nhật bài viết");
            }
        } catch (error) {
            console.error("Error updating blog post:", error);
            toast.error("Đã xảy ra lỗi khi cập nhật bài viết");
        }
    };

    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Lấy phần base64 sau dấu phẩy
                const base64String = reader.result.split(",")[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleDeleteClick = (post) => {
        setSelectedPost(post);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const userInfo = getCookie("user_info");
            if (!userInfo) return;
            const userData = JSON.parse(userInfo);

            const response = await deleteBlogPost(selectedPost.blog_post_id, userData.user_id);
            if (response.success) {
                toast.success("Xóa bài viết thành công");
                setShowDeleteModal(false);
                await fetchBlogPosts();
            } else {
                toast.error(response.message || "Không thể xóa bài viết");
            }
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi xóa bài viết");
        }
    };

    const handleSort = (posts = blogPosts, type = sortType) => {
      let sorted = [...posts];

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

    const updateDisplayedPosts = (sortedPosts, page) => {
        const startIndex = page * itemsPerPage;
        setDisplayedPosts(sortedPosts.slice(startIndex, startIndex + itemsPerPage));
        setCurrentPage(page);
    };

    const handlePageClick = (event) => {
        updateDisplayedPosts(blogPosts, event.selected);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Quản lý bài viết</h1>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {metrics.map((metric, index) => (
                    <div key={index} className={`${metric.bgColor} rounded-lg p-6 shadow-sm`}>
                        <h3 className="text-lg font-semibold">{metric.title}</h3>
                        <p className={`${metric.textColor} text-2xl font-bold`}>{metric.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Danh sách bài viết</h2>
                    <select 
                        className="border rounded px-3 py-1" 
                        value={sortType} 
                        onChange={(e) => handleSort(blogPosts, e.target.value)}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                    </select>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left">Tiêu đề</th>
                                        <th className="px-4 py-2 text-left">Nội dung</th>
                                        <th className="px-4 py-2 text-left w-32">Trạng thái</th>
                                        <th className="px-4 py-2 text-left">Lý do từ chối</th>
                                        <th className="px-4 py-2 text-left">Ngày tạo</th>
                                        <th className="px-4 py-2 text-left">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedPosts.map((post) => (
                                        <tr key={post.blog_post_id} className="border-b">
                                            <td className="px-4 py-2">{post.blog_title}</td>
                                            <td className="px-4 py-2">
                                                {post.blog_content.length > 100 ? `${post.blog_content.substring(0, 100)}...` : post.blog_content}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`inline-block min-w-[120px] text-center px-3 py-2 rounded-full text-sm font-medium ${
                                                        post.approval_status === "approved"
                                                            ? "bg-green-100 text-green-800"
                                                            : post.approval_status === "rejected"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
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
                                                {new Date(post.review_date).toLocaleString('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex space-x-2">
                                                    {/* <button
                                                        onClick={() => handleUpdate(post)}
                                                        className="w-20 bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 transition-colors"
                                                    >
                                                        Sửa
                                                    </button> */}
                                                    <button
                        onClick={() => handleUpdate(post)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDeleteClick(post)}
                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        {/* Update Modal */}
                        {showUpdateModal && (
                            <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="bg-white w-full max-w-lg mx-4 rounded-lg shadow-xl">
                                    <div className="border-b px-6 py-4">
                                        <h3 className="text-xl font-medium text-gray-900">Cập nhật bài viết</h3>
                                    </div>
                                    <div className="px-6 py-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                            <input
                                                type="text"
                                                value={updateForm.blog_title}
                                                onChange={(e) => setUpdateForm({ ...updateForm, blog_title: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bài viết</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="mt-2 max-h-40 rounded" />
                                            ) : updateForm.blog_image ? (
                                                <img
                                                    src={`data:image/jpeg;base64,${updateForm.blog_image}`}
                                                    alt="Current"
                                                    className="mt-2 max-h-40 rounded"
                                                />
                                            ) : null}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                                            <textarea
                                                value={updateForm.blog_content}
                                                onChange={(e) => setUpdateForm({ ...updateForm, blog_content: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                rows="6"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse">
                                        <button
                                            onClick={handleUpdateSubmit}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            Cập nhật
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowUpdateModal(false);
                                                setImageFile(null);
                                                setImagePreview("");
                                            }}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showDeleteModal && (
                            <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="bg-white p-6 rounded-lg max-w-sm mx-auto">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
                                    </p>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                                        >
                                            Hủy
                                        </button>
                                        <button onClick={handleDeleteConfirm} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <ReactPaginate
              breakLabel="..."
              nextLabel="Tiếp >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={Math.ceil(blogPosts.length / itemsPerPage)}
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
    );
};

export default BlogManagement;
