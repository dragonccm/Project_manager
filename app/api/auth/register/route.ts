import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/mongo-database'
import { isValidEmail, isValidUsername, isValidPassword } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, full_name } = body

    // Force role to be 'user' - admin accounts should not be created through public registration
    const role = 'user'

    // Validation
    if (!username || !email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      )
    }

    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: 'Tên đăng nhập phải từ 3-20 ký tự và chỉ chứa chữ cái, số và dấu gạch dưới' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Định dạng email không hợp lệ' },
        { status: 400 }
      )
    }

    const passwordValidation = isValidPassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    // Create user
    const newUser = await createUser({
      username,
      email,
      password,
      full_name,
      role
    })

    // Don't return sensitive data
    const { ...userResponse } = newUser

    return NextResponse.json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      user: userResponse
    })

  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof Error && (error.message.includes('đã tồn tại') || error.message.includes('đã được đăng ký'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ' },
      { status: 500 }
    )
  }
}