import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const access_token = request.cookies.get('access_token')?.value
    const role_info = request.cookies.get('user_role')?.value
    
    // Đường dẫn công cộng không yêu cầu xác thực
    const publicPaths = ['/User/Login', '/User/Register', '/User']
    
    // Đường dẫn chỉ dành cho user đã đăng nhập
    const userPaths = ['/User', '/GioHang']
    
    // Lấy đường dẫn hiện tại
    const path = request.nextUrl.pathname
    
    // Kiểm tra các loại đường dẫn
    const isPublicPath = publicPaths.includes(path)
    const isUserPath = userPaths.some(userPath => path.startsWith(userPath))

    // Nếu đường dẫn là root, cho phép truy cập
    if (path === '/') {
        return NextResponse.next()
    }

    // Trường hợp 1: Người dùng chưa đăng nhập
    if (!access_token) {
        // Cho phép truy cập vào các đường dẫn công cộng
        if (isPublicPath) {
            return NextResponse.next()
        }
        // Chuyển hướng đến trang đăng nhập cho các đường dẫn bảo vệ
        return NextResponse.redirect(new URL('/User/Login', request.url))
    }

    // Trường hợp 2: Người dùng đã đăng nhập
    if (access_token) {
        // Ngăn chặn người dùng đã đăng nhập truy cập vào các trang đăng nhập/đăng ký
        if (path === '/User/Login' || path === '/User/Register') {
            return NextResponse.redirect(new URL('/User', request.url))
        }

        // Cho phép truy cập các trang user nếu đã đăng nhập
        return NextResponse.next()
    }

    // Mặc định: cho phép truy cập
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/',
        '/User',
        '/User/Login',
        '/User/Register',
        '/GioHang'
    ]
}