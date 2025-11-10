"use client"

import { useState } from "react"
import styled from 'styled-components'
import { useAuth } from "@/hooks/use-auth"
import { Eye, EyeOff, LogIn, UserPlus, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

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
            $active={activeTab === 'login'}
            onClick={() => setActiveTab('login')}
          >
            Đăng nhập
          </TabButton>
          <TabButton
            $active={activeTab === 'register'}
            onClick={() => setActiveTab('register')}
          >
            Đăng ký
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
        <FormTitle>Đăng nhập</FormTitle>
        <FormDescription>Nhập thông tin để truy cập hệ thống</FormDescription>
      </FormHeader>

      <form onSubmit={handleSubmit}>
        <FormContent>
          {error && (
            <ErrorAlert>{error}</ErrorAlert>
          )}

          <FormGroup>
            <Label>Tên đăng nhập</Label>
            <Input
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={loading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Mật khẩu</Label>
            <PasswordWrapper>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
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
            <Checkbox
              id="remember"
              checked={formData.remember_me}
              onCheckedChange={(checked) => setFormData({ ...formData, remember_me: checked as boolean })}
              disabled={loading}
            />
            <CheckboxLabel htmlFor="remember">
              Ghi nhớ đăng nhập (30 ngày)
            </CheckboxLabel>
          </CheckboxWrapper>
        </FormContent>

        <FormFooter>
          <Button
            type="submit"
            variant="default"
            style={{ width: '100%' }}
            disabled={loading || !formData.username || !formData.password}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          {onSwitchToRegister && (
            <SwitchText>
              Chưa có tài khoản?{' '}
              <SwitchButton
                type="button"
                onClick={onSwitchToRegister}
                disabled={loading}
              >
                Đăng ký ngay
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
        <FormTitle>Đăng ký</FormTitle>
        <FormDescription>Tạo tài khoản mới để sử dụng hệ thống</FormDescription>
      </FormHeader>

      <form onSubmit={handleSubmit}>
        <FormContent>
          {error && <ErrorAlert>{error}</ErrorAlert>}

          <FormGroup>
            <Label>Họ và tên</Label>
            <Input
              type="text"
              placeholder="Nhập họ và tên đầy đủ"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              disabled={loading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Tên đăng nhập</Label>
            <Input
              type="text"
              placeholder="3-20 ký tự, chỉ chữ, số và _"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              disabled={loading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Nhập địa chỉ email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={loading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Mật khẩu</Label>
            <PasswordWrapper>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
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
                  Độ mạnh: {getPasswordStrengthText()}
                </StrengthText>
                {passwordStrength.feedback.length > 0 && (
                  <FeedbackText>
                    Cần: {passwordStrength.feedback.join(", ")}
                  </FeedbackText>
                )}
              </PasswordStrength>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Xác nhận mật khẩu</Label>
            <PasswordWrapper>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
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
                    Mật khẩu khớp
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Mật khẩu không khớp
                  </>
                )}
              </PasswordMatch>
            )}
          </FormGroup>
        </FormContent>

        <FormFooter>
          <Button
            type="submit"
            variant="default"
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
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>

          {onSwitchToLogin && (
            <SwitchText>
              Đã có tài khoản?{' '}
              <SwitchButton
                type="button"
                onClick={onSwitchToLogin}
                disabled={loading}
              >
                Đăng nhập
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
// STYLED COMPONENTS - NEUMORPHISM
// ============================================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
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
  border-radius: 24px;
  box-shadow: 0 0.706592px 0.706592px -0.666667px #00000014,
              0 1.80656px 1.80656px -1.33333px #00000014,
              0 3.62176px 3.62176px -2px #00000012,
              0 6.8656px 6.8656px -2.66667px #00000012,
              0 13.6468px 13.6468px -3.33333px #0000000d,
              0 30px 30px -4px #00000005,
              inset 0 3px 1px #fff;
  overflow: hidden;
`

const TabsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
  padding: 8px;
  gap: 8px;
`

const TabButton = styled.button<{ $active: boolean }>`
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: ${({ $active }) => 
    $active 
      ? '#000' 
      : '#fff'
  };
  color: ${({ $active }) => $active ? '#fff' : '#000'};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ $active }) => 
    $active 
      ? `0 0.706592px 0.706592px -0.666667px #00000014,
         0 1.80656px 1.80656px -1.33333px #00000014,
         0 3.62176px 3.62176px -2px #00000012,
         0 6.8656px 6.8656px -2.66667px #00000012,
         0 13.6468px 13.6468px -3.33333px #0000000d,
         0 30px 30px -4px #00000005,
         inset 0 3px 1px #fff`
      : `0 0.706592px 0.706592px -0.666667px #00000014,
         0 1.80656px 1.80656px -1.33333px #00000014,
         0 3.62176px 3.62176px -2px #00000012,
         inset 0 3px 1px #fff`
  };

  &:hover:not([disabled]) {
    transform: translateY(-2px);
    box-shadow: ${({ $active }) => 
      $active 
        ? `0 0.706592px 0.706592px -0.666667px #00000014,
           0 1.80656px 1.80656px -1.33333px #00000014,
           0 3.62176px 3.62176px -2px #00000012,
           0 6.8656px 6.8656px -2.66667px #00000012,
           0 13.6468px 13.6468px -3.33333px #0000000d,
           0 30px 30px -4px #00000005,
           inset 0 3px 1px #fff`
        : `0 0.706592px 0.706592px -0.666667px #00000014,
           0 1.80656px 1.80656px -1.33333px #00000014,
           0 3.62176px 3.62176px -2px #00000012,
           0 6.8656px 6.8656px -2.66667px #00000012,
           inset 0 3px 1px #fff`
    };
  }

  &:active {
    transform: scale(0.98);
  }
`

const FormCard = styled.div`
  padding: 2rem;
  background: #fff;
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
  border-radius: 50%;
  background: #000;
  color: #fff;
  box-shadow: 0 0.706592px 0.706592px -0.666667px #00000014,
              0 1.80656px 1.80656px -1.33333px #00000014,
              0 3.62176px 3.62176px -2px #00000012,
              0 6.8656px 6.8656px -2.66667px #00000012,
              0 13.6468px 13.6468px -3.33333px #0000000d,
              0 30px 30px -4px #00000005,
              inset 0 3px 1px #fff;
`

const FormTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 0.5rem;
`

const FormDescription = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
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
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ErrorAlert = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background: #f44336;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 0.706592px 0.706592px -0.666667px #00000014,
              0 1.80656px 1.80656px -1.33333px #00000014,
              0 3.62176px 3.62176px -2px #00000012,
              0 6.8656px 6.8656px -2.66667px #00000012,
              0 13.6468px 13.6468px -3.33333px #0000000d,
              0 30px 30px -4px #00000005,
              inset 0 3px 1px #fff;
`

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #000;
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
  font-weight: 500;
  color: #666;
`

const SwitchButton = styled.button`
  border: none;
  background: none;
  color: #000;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    color: #333;
    text-decoration: underline;
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
  font-weight: 500;
`

const StrengthText = styled.div`
  font-weight: 600;
`

const FeedbackText = styled.div`
  color: #666;
`

const PasswordMatch = styled.div<{ $match: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $match }) => $match ? '#4caf50' : '#f44336'};
`

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 1rem;
`

const PageInner = styled.div`
  width: 100%;
  max-width: 500px;
`
