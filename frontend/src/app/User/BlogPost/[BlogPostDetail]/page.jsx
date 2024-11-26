"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBlogPostByID } from '@/util/userAPI'; 

const BlogPostDetailPage = () => {
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const params = useParams();
  console.log("params > ",params );
  
  const blogPostId = params.BlogPostDetail;

  useEffect(() => {
    async function fetchBlogPostDetail() {
      try {
        if (!blogPostId) {
          console.log('Blog Post ID is missing');
        }

        const response = await getBlogPostByID(blogPostId);
        
        if (response.success) {
          setBlogPost(response.data);
        } else {
          setError(response.message);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blog post details:', error);
        setError('Đã có lỗi xảy ra khi tải chi tiết bài viết');
        setLoading(false);
      }
    }

    fetchBlogPostDetail();
  }, [blogPostId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        {error}
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="text-center mt-8">
        Không tìm thấy bài viết
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <article className="bg-white shadow-lg rounded-lg overflow-hidden">
        {blogPost.blog_image && (
          <img
            src={`data:image/jpeg;base64,${blogPost.blog_image}`}
            alt={blogPost.blog_title}
            className="w-full h-96 object-cover"
          />
        )}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {blogPost.blog_title}
          </h1>
          <div className="flex items-center text-gray-600 mb-6">
            <span className="mr-4">
              Ngày đăng: {new Date(blogPost.review_date).toLocaleDateString()}
            </span>
            {blogPost.author && (
              <span>Tác giả: {blogPost.author}</span>
            )}
          </div>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: blogPost.blog_content }}
          />
        </div>
      </article>
    </div>
  );
};

export default BlogPostDetailPage;