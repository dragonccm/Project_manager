"use client"

import { useState } from "react"
import styled from 'styled-components'
import { useAuth } from "@/hooks/use-auth"
import { Eye, EyeOff, LogIn, UserPlus, CheckCircle, XCircle } from "lucide-react"
import {
  BrutalismButton,
  BrutalismInput,
  BrutalismLabel,
  BrutalismCard,
  BrutalismCardHeader,
  BrutalismCardTitle,
  BrutalismCardContent,
  BrutalismCheckbox,
} from "@/components/ui/brutalism"

// ============================================
// AUTH MODAL
// ============================================

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'register'
}

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const { user } = useAuth()

  if (user && open) {
    onOpenChange(false)
  }

  const handleSuccess = () => {
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <ModalOverlay onClick={() => onOpenChange(false)}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <TabsContainer>
          <TabButton
            active={activeTab === 'login'}
            onClick={() => setActiveTab('login')}
          >
            ĐĂNG NHẬP
          </TabButton>
          <TabButton
            active={activeTab === 'register'}
            onClick={() => setActiveTab('register')}
          >
            ĐĂNG KÝ
          </TabButton>
        </TabsContainer>

        {activeTab === 'login' ? (
          <LoginForm
            onSwitchToRegister={() => setActiveTab('register')}
            onLoginSuccess={handleSuccess}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setActiveTab('login')}
            onRegisterSuccess={handleSuccess}
          />
        )}
      </ModalContent>
    </ModalOverlay>
  )
}

// ============================================
// LOGIN FORM
// ============================================

interface LoginFormProps {
  onSwitchToRegister?: () => void
  onLoginSuccess?: () => void
}

function LoginForm({ onSwitchToRegister, onLoginSuccess }: LoginFormProps) {
  const { login, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember_me: false
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const success = await login(formData)
    if (success) {
      onLoginSuccess?.()
    }
  }

  return (
    <FormCard>
      <FormHeader>
        <IconCircle>
          <LogIn size={32} />
        </IconCircle>
        <FormTitle>ĐĂNG NHẬP</FormTitle>
        <FormDescription>Nhập thông tin để truy cập hệ thống</FormDescription>
      </FormHeader>

      <form onSubmit={handleSubmit}>
        <FormContent>
          {error && (
            <ErrorAlert>{error}</ErrorAlert>
          )}

          <FormGroup>
            <BrutalismLabel>TÊN ĐĂNG NHẬP</BrutalismLabel>
            <BrutalismInput
              type="text"
              placeholder="NHẬP TÊN ĐĂNG NHẬP"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={loading}
              required
            />
          </FormGroup>

          <FormGroup>
            <BrutalismLabel>MẬT KHẨU</BrutalismLabel>
            <PasswordWrapper>
              <BrutalismInput
                type={showPassword ? "text" : "password"}
                placeholder="NHẬP MẬT KHẨU"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </PasswordWrapper>
          </FormGroup>

          <CheckboxWrapper>
            <BrutalismCheckbox
              id="remember"
              checked={formData.remember_me}
              onChange={(e) => setFormData({ ...formData, remember_me: e.target.checked })}
              disabled={loading}
            />
            <CheckboxLabel htmlFor="remember">
              GHI NHỚ ĐĂNG NHẬP (30 NGÀY)
            </CheckboxLabel>
          </CheckboxWrapper>
        </FormContent>

        <FormFooter>
          <BrutalismButton
            type="submit"
            style={{ width: '100%' }}
            disabled={loading || !formData.username || !formData.password}
          >
            {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
          </BrutalismButton>

          {onSwitchToRegister && (
            <SwitchText>
              CHƯA CÓ TÀI KHOẢN?{' '}
              <SwitchButton
                type="button"
                onClick={onSwitchToRegister}
                disabled={loading}
              >
                ĐĂNG KÝ NGAY
              </SwitchButton>
            </SwitchText>
          )}
        </FormFooter>
      </form>
    </FormCard>
  )
}

// ============================================
// REGISTER FORM
// ============================================

interface RegisterFormProps {
  onSwitchToLogin?: () => void
  onRegisterSuccess?: () => void
}

function RegisterForm({ onSwitchToLogin, onRegisterSuccess }: RegisterFormProps) {
  const { register, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'user' as const
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] })

  const validatePassword = (password: string) => {
    const feedback = []
    let score = 0

    if (password.length >= 8) score += 1
    else feedback.push("Ít nhất 8 ký tự")

    if (/(?=.*[a-z])/.test(password)) score += 1
    else feedback.push("Ít nhất 1 chữ thường")

    if (/(?=.*[A-Z])/.test(password)) score += 1
    else feedback.push("Ít nhất 1 chữ hoa")

    if (/(?=.*\d)/.test(password)) score += 1
    else feedback.push("Ít nhất 1 số")

    setPasswordStrength({ score, feedback })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (formData.password !== formData.confirmPassword) return
    if (passwordStrength.score < 4) return

    const success = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      role: formData.role
    })

    if (success) {
      onRegisterSuccess?.()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'password') validatePassword(value)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score === 0) return "#666"
    if (passwordStrength.score <= 2) return "#ff0000"
    if (passwordStrength.score === 3) return "#ff9800"
    return "#00ff00"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength.score === 0) return "CHƯA NHẬP"
    if (passwordStrength.score <= 2) return "YẾU"
    if (passwordStrength.score === 3) return "TRUNG BÌNH"
    return "MẠNH"
  }

  return (
    <FormCard>
      <FormHeader>
        <IconCircle>
          <UserPlus size={32} />
        </IconCircle>
        <FormTitle>ĐĂNG KÝ</FormTitle>
        <FormDescription>Tạo tài khoản mới để sử dụng hệ thống</FormDescription>
      </FormHeader>

      <form onSubmit={handleSubmit}>
        <FormContent>
          {error && <ErrorAlert>{error}</ErrorAlert>}

          <FormGroup>
            <BrutalismLabel>HỌ VÀ TÊN</BrutalismLabel>
            <BrutalismInput
              type="text"
              placeholder="NHẬP HỌ VÀ TÊN ĐẦY ĐỦ"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              disabled={loading}
              required
            />
          </FormGroup>

          <FormGroup>
            <BrutalismLabel>TÊN ĐĂNG NHẬP</BrutalismLabel>
            <BrutalismInput
              type="text"
              placeholder="3-20 KÝ TỰ, CHỈ CHỮ, SỐ VÀ _"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              disabled={loading}
              required
            />
          </FormGroup>

          <FormGroup>
            <BrutalismLabel>EMAIL</BrutalismLabel>
            <BrutalismInput
              type="email"
              placeholder="NHẬP ĐỊA CHỈ EMAIL"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={loading}
              required
            />
          </FormGroup>

          <FormGroup>
            <BrutalismLabel>MẬT KHẨU</BrutalismLabel>
            <PasswordWrapper>
              <BrutalismInput
                type={showPassword ? "text" : "password"}
                placeholder="NHẬP MẬT KHẨU"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={loading}
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </PasswordWrapper>
            {formData.password && (
              <PasswordStrength>
                <StrengthText style={{ color: getPasswordStrengthColor() }}>
                  ĐỘ MẠNH: {getPasswordStrengthText()}
                </StrengthText>
                {passwordStrength.feedback.length > 0 && (
                  <FeedbackText>
                    CẦN: {passwordStrength.feedback.join(", ").toUpperCase()}
                  </FeedbackText>
                )}
              </PasswordStrength>
            )}
          </FormGroup>

          <FormGroup>
            <BrutalismLabel>XÁC NHẬN MẬT KHẨU</BrutalismLabel>
            <PasswordWrapper>
              <BrutalismInput
                type={showConfirmPassword ? "text" : "password"}
                placeholder="NHẬP LẠI MẬT KHẨU"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                disabled={loading}
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </PasswordWrapper>
            {formData.confirmPassword && (
              <PasswordMatch $match={formData.password === formData.confirmPassword}>
                {formData.password === formData.confirmPassword ? (
                  <>
                    <CheckCircle size={16} />
                    MẬT KHẨU KHỚP
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    MẬT KHẨU KHÔNG KHỚP
                  </>
                )}
              </PasswordMatch>
            )}
          </FormGroup>
        </FormContent>

        <FormFooter>
          <BrutalismButton
            type="submit"
            style={{ width: '100%' }}
            disabled={
              loading ||
              !formData.username ||
              !formData.email ||
              !formData.password ||
              formData.password !== formData.confirmPassword ||
              passwordStrength.score < 4
            }
          >
            {loading ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ'}
          </BrutalismButton>

          {onSwitchToLogin && (
            <SwitchText>
              ĐÃ CÓ TÀI KHOẢN?{' '}
              <SwitchButton
                type="button"
                onClick={onSwitchToLogin}
                disabled={loading}
              >
                ĐĂNG NHẬP
              </SwitchButton>
            </SwitchText>
          )}
        </FormFooter>
      </form>
    </FormCard>
  )
}

// ============================================
// STANDALONE AUTH PAGE
// ============================================

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <PageContainer>
      <PageInner>
        {mode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setMode('login')} />
        )}
      </PageInner>
    </PageContainer>
  )
}

// ============================================
// STYLED COMPONENTS
// ============================================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`

const ModalContent = styled.div`
  width: 100%;
  max-width: 500px;
  background: #fff;
  border: 5px solid #000;
  box-shadow: 15px 15px 0 #000;
`

const TabsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 4px solid #000;
`

const TabButton = styled.button<{ active: boolean }>`
  padding: 1rem;
  font-size: 1rem;
  font-weight: 900;
  text-transform: uppercase;
  border: none;
  border-right: ${({ active }) => !active && '2px solid #000'};
  background: ${({ active }) => active ? '#ffeb3b' : '#fff'};
  color: #000;
  cursor: pointer;
  transition: all 0.2s;

  &:last-child {
    border-right: none;
  }

  &:hover:not([disabled]) {
    background: ${({ active }) => active ? '#ffeb3b' : '#e0e0e0'};
  }
`

const FormCard = styled.div`
  padding: 2rem;
`

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`

const IconCircle = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #000;
  background: #ffeb3b;
  box-shadow: 6px 6px 0 #000;
`

const FormTitle = styled.h2`
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`

const FormDescription = styled.p`
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #666;
`

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const PasswordWrapper = styled.div`
  position: relative;
`

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #000;

  &:hover:not(:disabled) {
    color: #296fbb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ErrorAlert = styled.div`
  padding: 1rem;
  border: 3px solid #000;
  background: #ff0000;
  color: #fff;
  font-weight: 900;
  text-transform: uppercase;
  box-shadow: 4px 4px 0 #000;
`

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
`

const FormFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const SwitchText = styled.div`
  text-align: center;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
`

const SwitchButton = styled.button`
  border: none;
  background: none;
  color: #296fbb;
  font-weight: 900;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;

  &:hover:not(:disabled) {
    color: #1e5a8e;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const PasswordStrength = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
`

const StrengthText = styled.div`
  font-weight: 900;
`

const FeedbackText = styled.div`
  color: #666;
`

const PasswordMatch = styled.div<{ $match: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 900;
  text-transform: uppercase;
  color: ${({ $match }) => $match ? '#00ff00' : '#ff0000'};
`

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 1rem;
`

const PageInner = styled.div`
  width: 100%;
  max-width: 500px;
`
