"use client"
import { getAllCategoryChild, getAllCategoryParent } from '@/util/adminAPI';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CategoryPage = () => {
    const router = useRouter();
    const [parentCategories, setParentCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getAllCategoryParent();
                if (response.success) {
                    // Thêm slug cho parent categories
                    const parentsWithSlug = response.data.map(parent => ({
                        ...parent,
                        slug: generateSlug(parent.category_parent_name)
                    }));
                    setParentCategories(parentsWithSlug);
                }
                
                const childResponse = await getAllCategoryChild();
                if (childResponse.success) {
                    // Thêm slug cho child categories
                    const childrenWithSlug = childResponse.data.map(child => ({
                        ...child,
                        slug: generateSlug(child.category_child_name)
                    }));
                    setChildCategories(childrenWithSlug);
                }
            } catch (err) {
                console.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Hàm tạo slug từ tên danh mục
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleCategoryClick = (category, isParent = false) => {
        if (isParent) {
            router.push(`/User/Category/${category.slug}?parent=${category.category_parent_id}`);
        } else {
            router.push(`/User/Category/${category.slug}?child=${category.category_child_id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="text-gray-500">Đang tải danh mục...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-8 text-gray-800">Danh Mục Sản Phẩm</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {parentCategories.map(parent => (
                    <div key={parent.category_parent_id} className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                        <div 
                            className="py-4 px-6 bg-blue-50 text-blue-700 font-semibold text-lg flex justify-between items-center cursor-pointer hover:bg-blue-100"
                            onClick={() => handleCategoryClick(parent, true)}
                        >
                            {parent.category_parent_name}
                            <span className="text-sm font-medium text-gray-500">
                                {`${childCategories.filter(child => child.category_parent_id === parent.category_parent_id).length} mục`}
                            </span>
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                            {childCategories
                                .filter(child => child.category_parent_id === parent.category_parent_id)
                                .map(child => (
                                    <div
                                        key={child.category_child_id}
                                        className="py-3 px-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => handleCategoryClick(child)}
                                    >
                                        <span className="text-gray-600 font-medium">{child.category_child_name}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
            
            {parentCategories.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    Không có danh mục nào
                </div>
            )}
        </div>
    );
};

export default CategoryPage;