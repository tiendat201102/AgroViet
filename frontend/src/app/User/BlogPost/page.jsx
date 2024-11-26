"use client"
import { getAcceptedBlogs } from '@/util/userAPI';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const BlogPostsPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchBlogPosts() {
        try {
            const response = await getAcceptedBlogs();
            
            if (response.success) {
                setBlogPosts(response.data);
            } else {
                setError(response.message);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            setError('Đã có lỗi xảy ra khi tải bài viết');
            setLoading(false);
        }
    }

    fetchBlogPosts();
}, []);
return (
  <div className="max-w-6xl mx-auto my-8 px-4">
    <h1 className="text-3xl font-bold text-center mb-8">Bài Viết</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogPosts.map((post) => (
        <Link 
          href={`/User/BlogPost/${post.blog_post_id}`} 
          key={post.blog_post_id}
          className="block border border-gray-300 rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-lg"
        >
          {post.blog_image && (
            <img
              src={`data:image/jpeg;base64,${post.blog_image}`}
              alt={post.blog_title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h2 className="text-lg font-medium text-blue-600 mb-2">
              {post.blog_title}
            </h2>
            <p className="text-gray-600 text-sm">
              Ngày đăng: {new Date(post.review_date).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  </div>
);
};

export default BlogPostsPage;