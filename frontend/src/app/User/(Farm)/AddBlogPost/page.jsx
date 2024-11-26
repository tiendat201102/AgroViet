"use client";
import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { addBlogPost } from "@/util/userAPI";
import LoadingSpinner from "@/components/userComponents/loadingSpinner";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { EditorState, convertToRaw } from "draft-js";
import "@/../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from 'draftjs-to-html';
import dynamic from 'next/dynamic';

const DraftEditor = dynamic(
    () => import('@/components/userComponents/DraftEditor'),
    { 
        ssr: false,
        loading: () => <div>Loading Editor...</div>
    }
);

const BlogForm = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        blog_title: "",
        blog_content: "",
        blog_image: "",
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const onEditorStateChange = (newEditorState) => {
        if (mounted) {
            const htmlContent = draftToHtml(convertToRaw(newEditorState.getCurrentContent()));
            setFormData(prev => ({
                ...prev,
                blog_content: htmlContent
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(",")[1];
                setFormData((prev) => ({
                    ...prev,
                    blog_image: base64String,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.blog_content.trim()) {
            toast.error("Vui lòng nhập nội dung bài viết");
            return;
        }
        
        setLoading(true);
        try {
            const userInfo = getCookie("user_info");
            if (!userInfo) {
                toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
                return;
            }
            const userData = JSON.parse(userInfo);

            const response = await addBlogPost(
                userData.user_id, 
                formData.blog_title, 
                formData.blog_content, 
                formData.blog_image
            );

            if (response.success) {
                toast.success("Thêm bài viết thành công");
                router.push("/User/ManageBlogPost");
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xử lý bài viết");
        }
        setLoading(false);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!mounted) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-8">Thêm bài viết mới</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Tiêu đề bài viết</label>
                        <input
                            type="text"
                            name="blog_title"
                            value={formData.blog_title}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Nội dung bài viết</label>
                        <div className="border rounded">
                            <DraftEditor
                                onEditorStateChange={onEditorStateChange}
                                wrapperClassName="wrapper-class"
                                editorClassName="editor-class p-2 min-h-[200px]"
                                toolbarClassName="toolbar-class"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Hình ảnh</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                        {formData.blog_image && (
                            <img
                                src={`data:image/jpeg;base64,${formData.blog_image}`}
                                alt="Preview"
                                className="w-24 h-24 object-cover rounded mt-2"
                                required
                            />
                        )}
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition duration-200"
                            disabled={loading}
                        >
                            Thêm bài viết
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/User/ManageBlogPost")}
                            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition duration-200"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogForm;