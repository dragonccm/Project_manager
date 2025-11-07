"use client"

import type React from "react"
import { useState } from "react"
import styled from 'styled-components'
import { Eye, EyeOff, Copy, Mail, RefreshCw, Plus, Search, Grid3X3, List, ExternalLink, Trash2, Share2 } from "lucide-react"
import { AdvancedEmailComposer } from "@/components/advanced-email-composer"
import { useLanguage } from "@/hooks/use-language"
import { getLocalDateString } from "@/lib/date-utils"
import { generateStrongPassword } from "@/lib/password-generator"
import { ShareModal } from "@/features/share/ShareModal"
import { 
  BrutalismButton, 
  BrutalismInput, 
  BrutalismSelect, 
  BrutalismCard,
  BrutalismCardHeader,
  BrutalismCardTitle,
  BrutalismCardContent,
  BrutalismBadge,
  BrutalismLabel,
  BrutalismH1
} from "@/components/ui/brutalism"

interface Account {
  id: string
  projectId: string
  username: string
  password: string
  email: string
  website: string
  notes: string
  createdAt: string
}

interface AccountManagerProps {
  projects: any[]
  accounts: any[]
  onAddAccount: (accountData: any) => Promise<any>
  onDeleteAccount: (id: string) => Promise<any>
}

export function AccountManager({
  projects,
  accounts,
  onAddAccount,
  onDeleteAccount
}: AccountManagerProps) {
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [showForm, setShowForm] = useState(false)
  const [showEmailComposer, setShowEmailComposer] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedAccountForShare, setSelectedAccountForShare] = useState<Account | null>(null)

  const [formData, setFormData] = useState({
    projectId: "",
    username: "",
    password: "",
    email: "",
    website: "",
    notes: "",
  })
  const { t } = useLanguage()

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.website?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.notes?.toLowerCase().includes(searchQuery.toLowerCase())

    const accountProjectId = account.projectId || account.project_id
    const matchesProject = projectFilter === 'all' || accountProjectId === projectFilter

    return matchesSearch && matchesProject
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.projectId || formData.projectId.trim() === "") {
      alert("Dự án là bắt buộc.")
      return
    }
    if (!formData.username || formData.username.trim() === "") {
      alert("Tên đăng nhập là bắt buộc.")
      return
    }
    if (!formData.password || formData.password.trim() === "") {
      alert("Mật khẩu là bắt buộc.")
      return
    }
    if (!formData.website || formData.website.trim() === "") {
      alert("Website là bắt buộc.")
      return
    }

    try {
      await onAddAccount({
        project_id: formData.projectId,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        website: formData.website,
        notes: formData.notes,
      })

      setFormData({
        projectId: "",
        username: "",
        password: "",
        email: "",
        website: "",
        notes: "",
      })
      setShowForm(false)
    } catch (error) {
      console.error("Error saving account:", error)
      alert("Error saving account. Please try again.")
    }
  }

  const autoFillFromWebsite = async () => {
    if (formData.website && formData.username) {
      try {
        const url = new URL(formData.website)
        const domain = url.hostname.replace("www.", "")
        const password = generateStrongPassword()

        setFormData({
          ...formData,
          password,
          email: formData.email || `${formData.username}@${domain}`,
        })
      } catch (error) {
        console.error("Invalid URL")
      }
    }
  }

  const copyToClipboard = async (text: string) => {
    if (!text || text.trim() === '') {
      alert('❌ Không có nội dung để sao chép!')
      return
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        showNotification(`✅ ĐÃ SAO CHÉP: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (success) {
          showNotification(`✅ ĐÃ SAO CHÉP: "${text}"`)
        } else {
          throw new Error('execCommand failed')
        }
      }
    } catch (err) {
      console.error('Copy failed:', err)
      prompt('Không thể tự động sao chép. Vui lòng copy thủ công:', text)
    }
  }

  const showNotification = (message: string) => {
    const notification = document.createElement('div')
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ffeb3b;
      color: #000;
      padding: 1rem 1.5rem;
      border: 3px solid #000;
      box-shadow: 5px 5px 0 #000;
      z-index: 9999;
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 2000)
  }

  const sendEmailWithCredentials = (account: Account) => {
    setSelectedAccount(account)
    setShowEmailComposer(true)
  }

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }))
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <BrutalismH1>TÀI KHOẢN</BrutalismH1>
          <Stats>{filteredAccounts.length} TÀI KHOẢN</Stats>
        </HeaderLeft>
        <BrutalismButton onClick={() => {
          setFormData({ projectId: "", username: "", password: "", email: "", website: "", notes: "" })
          setShowForm(true)
        }}>
          <Plus size={20} />
          THÊM TÀI KHOẢN
        </BrutalismButton>
      </Header>

      {/* Search and Filters */}
      <Controls>
        <SearchBox>
          <SearchIcon>
            <Search size={20} />
          </SearchIcon>
          <BrutalismInput
            placeholder="TÌM KIẾM TÀI KHOẢN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '3rem' }}
          />
        </SearchBox>

        <ControlButtons>
          <BrutalismSelect
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="all">TẤT CẢ DỰ ÁN</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </BrutalismSelect>

          <ViewToggle>
            <ViewButton
              active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <List size={20} />
            </ViewButton>
            <ViewButton
              active={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={20} />
            </ViewButton>
          </ViewToggle>
        </ControlButtons>
      </Controls>

      {/* Content Grid */}
      <ContentGrid $showForm={showForm}>
        {/* Form */}
        {showForm && (
          <BrutalismCard>
            <BrutalismCardHeader>
              <BrutalismCardTitle>THÊM TÀI KHOẢN MỚI</BrutalismCardTitle>
            </BrutalismCardHeader>
            <BrutalismCardContent>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <BrutalismLabel>DỰ ÁN *</BrutalismLabel>
                  <BrutalismSelect
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    required
                  >
                    <option value="">CHỌN DỰ ÁN</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </BrutalismSelect>
                </FormGroup>

                <FormGroup>
                  <BrutalismLabel>WEBSITE *</BrutalismLabel>
                  <BrutalismInput
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <BrutalismLabel>TÊN ĐĂNG NHẬP *</BrutalismLabel>
                  <InputGroup>
                    <BrutalismInput
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="USERNAME"
                      required
                      style={{ flex: 1 }}
                    />
                    <BrutalismButton type="button" onClick={autoFillFromWebsite}>
                      <RefreshCw size={16} />
                    </BrutalismButton>
                  </InputGroup>
                </FormGroup>

                <FormGroup>
                  <BrutalismLabel>MẬT KHẨU *</BrutalismLabel>
                  <InputGroup>
                    <BrutalismInput
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="PASSWORD"
                      required
                      style={{ flex: 1 }}
                    />
                    <BrutalismButton
                      type="button"
                      onClick={() => setFormData({ ...formData, password: generateStrongPassword() })}
                    >
                      <RefreshCw size={16} />
                    </BrutalismButton>
                  </InputGroup>
                </FormGroup>

                <FormGroup>
                  <BrutalismLabel>EMAIL</BrutalismLabel>
                  <BrutalismInput
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </FormGroup>

                <FormGroup>
                  <BrutalismLabel>GHI CHÚ</BrutalismLabel>
                  <BrutalismInput
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="GHI CHÚ THÊM..."
                  />
                </FormGroup>

                <FormActions>
                  <BrutalismButton type="submit" style={{ flex: 1 }}>
                    <Plus size={16} />
                    TẠO TÀI KHOẢN
                  </BrutalismButton>
                  <BrutalismButton type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    HỦY
                  </BrutalismButton>
                </FormActions>
              </Form>
            </BrutalismCardContent>
          </BrutalismCard>
        )}

        {/* Accounts Display */}
        <BrutalismCard>
          <BrutalismCardHeader>
            <BrutalismCardTitle>TÀI KHOẢN ĐÃ LƯU</BrutalismCardTitle>
          </BrutalismCardHeader>
          <BrutalismCardContent>
            {filteredAccounts.length === 0 ? (
              <EmptyState>
                {searchQuery || projectFilter !== 'all' ? 'KHÔNG TÌM THẤY TÀI KHOẢN NÀO' : 'CHƯA CÓ TÀI KHOẢN NÀO'}
              </EmptyState>
            ) : viewMode === 'list' ? (
              <AccountsList>
                {filteredAccounts.map((account) => {
                  const accountProjectId = account.projectId || account.project_id
                  const project = projects.find((p) => p.id == accountProjectId)
                  return (
                    <AccountCard key={account.id}>
                      <AccountHeader>
                        <div>
                          <AccountWebsite>{account.website}</AccountWebsite>
                          <BrutalismBadge>{project?.name || "UNKNOWN PROJECT"}</BrutalismBadge>
                        </div>
                        <AccountActions>
                          <IconButton
                            onClick={() => {
                              setSelectedAccountForShare(account)
                              setShareModalOpen(true)
                            }}
                            title="Share"
                          >
                            <Share2 size={16} />
                          </IconButton>
                          {account.email && (
                            <IconButton onClick={() => sendEmailWithCredentials(account)} title="Send Email">
                              <Mail size={16} />
                            </IconButton>
                          )}
                          <IconButton
                            onClick={() => onDeleteAccount(account.id)}
                            title="Delete"
                            $danger
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </AccountActions>
                      </AccountHeader>

                      <AccountDetails>
                        <DetailRow>
                          <DetailLabel>TÊN ĐĂNG NHẬP:</DetailLabel>
                          <DetailValue>
                            <code>{account.username}</code>
                            <IconButton onClick={() => copyToClipboard(account.username)}>
                              <Copy size={14} />
                            </IconButton>
                          </DetailValue>
                        </DetailRow>

                        <DetailRow>
                          <DetailLabel>MẬT KHẨU:</DetailLabel>
                          <DetailValue>
                            <code>{showPasswords[account.id] ? account.password : "••••••••"}</code>
                            <IconButton onClick={() => togglePasswordVisibility(account.id)}>
                              {showPasswords[account.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </IconButton>
                            <IconButton onClick={() => copyToClipboard(account.password)}>
                              <Copy size={14} />
                            </IconButton>
                          </DetailValue>
                        </DetailRow>

                        {account.email && (
                          <DetailRow>
                            <DetailLabel>EMAIL:</DetailLabel>
                            <code>{account.email}</code>
                          </DetailRow>
                        )}
                      </AccountDetails>
                    </AccountCard>
                  )
                })}
              </AccountsList>
            ) : (
              <AccountsGrid>
                {filteredAccounts.map((account) => {
                  const accountProjectId = account.projectId || account.project_id
                  const project = projects.find((p) => p.id == accountProjectId)
                  return (
                    <GridCard key={account.id}>
                      <GridCardHeader>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <GridCardTitle>{account.website}</GridCardTitle>
                          <BrutalismBadge style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                            {project?.name || "UNKNOWN"}
                          </BrutalismBadge>
                        </div>
                        <GridCardActions>
                          <IconButton
                            onClick={() => {
                              setSelectedAccountForShare(account)
                              setShareModalOpen(true)
                            }}
                            style={{ padding: '0.25rem' }}
                          >
                            <Share2 size={14} />
                          </IconButton>
                          <IconButton
                            onClick={() => onDeleteAccount(account.id)}
                            $danger
                            style={{ padding: '0.25rem' }}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </GridCardActions>
                      </GridCardHeader>

                      <GridCardBody>
                        <GridDetailRow>
                          <GridLabel>USERNAME:</GridLabel>
                          <GridValueRow>
                            <code style={{ fontSize: '0.75rem' }}>{account.username}</code>
                            <IconButton onClick={() => copyToClipboard(account.username)} style={{ padding: '0.125rem' }}>
                              <Copy size={12} />
                            </IconButton>
                          </GridValueRow>
                        </GridDetailRow>

                        <GridDetailRow>
                          <GridLabel>PASSWORD:</GridLabel>
                          <GridValueRow>
                            <code style={{ fontSize: '0.75rem' }}>
                              {showPasswords[account.id] ? account.password : "••••••••"}
                            </code>
                            <IconButton onClick={() => togglePasswordVisibility(account.id)} style={{ padding: '0.125rem' }}>
                              {showPasswords[account.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                            </IconButton>
                            <IconButton onClick={() => copyToClipboard(account.password)} style={{ padding: '0.125rem' }}>
                              <Copy size={12} />
                            </IconButton>
                          </GridValueRow>
                        </GridDetailRow>

                        {account.email && (
                          <GridDetailRow>
                            <GridLabel>EMAIL:</GridLabel>
                            <code style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {account.email}
                            </code>
                          </GridDetailRow>
                        )}

                        {account.website && (
                          <BrutalismButton
                            variant="secondary"
                            onClick={() => window.open(account.website, '_blank')}
                            style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.5rem' }}
                          >
                            <ExternalLink size={12} />
                            WEBSITE
                          </BrutalismButton>
                        )}

                        {account.email && (
                          <BrutalismButton
                            variant="secondary"
                            onClick={() => sendEmailWithCredentials(account)}
                            style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.5rem' }}
                          >
                            <Mail size={12} />
                            GỬI EMAIL
                          </BrutalismButton>
                        )}
                      </GridCardBody>
                    </GridCard>
                  )
                })}
              </AccountsGrid>
            )}
          </BrutalismCardContent>
        </BrutalismCard>
      </ContentGrid>

      {/* Email Composer */}
      {showEmailComposer && selectedAccount && (
        <AdvancedEmailComposer
          isOpen={showEmailComposer}
          onClose={() => {
            setShowEmailComposer(false)
            setSelectedAccount(null)
          }}
          initialEmailType="accountCredentials"
          contextData={{
            accountId: selectedAccount.id,
            website: selectedAccount.website,
            username: selectedAccount.username,
            password: selectedAccount.password,
            email: selectedAccount.email,
            projectName: projects.find(p => p.id === selectedAccount.projectId)?.name || "Unknown Project"
          }}
        />
      )}

      {/* Share Modal */}
      {selectedAccountForShare && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          resourceType="account"
          resourceId={selectedAccountForShare.id || ''}
          resourceName={selectedAccountForShare.website || 'Untitled Account'}
        />
      )}
    </Container>
  )
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Stats = styled.p`
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #666;
`

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`

const SearchBox = styled.div`
  position: relative;
  flex: 1;
`

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #000;
  pointer-events: none;
`

const ControlButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`

const ViewToggle = styled.div`
  display: flex;
  border: 3px solid #000;
  background: #fff;
`

const ViewButton = styled.button<{ active?: boolean }>`
  padding: 0.75rem;
  background: ${({ active }) => active ? '#ffeb3b' : '#fff'};
  border: none;
  border-right: ${({ active }) => !active && '2px solid #000'};
  cursor: pointer;
  transition: all 0.2s;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: ${({ active }) => active ? '#ffeb3b' : '#e0e0e0'};
  }
`

const ContentGrid = styled.div<{ $showForm: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 1024px) {
    grid-template-columns: ${({ $showForm }) => $showForm ? '1fr 2fr' : '1fr'};
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const InputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`

const FormActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`

const EmptyState = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  font-size: 1rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #666;
`

const AccountsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const AccountCard = styled.div`
  padding: 1.5rem;
  border: 3px solid #000;
  background: #fff;
  box-shadow: 4px 4px 0 #000;
`

const AccountHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
`

const AccountWebsite = styled.h3`
  font-size: 1rem;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`

const AccountActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const IconButton = styled.button<{ $danger?: boolean }>`
  padding: 0.5rem;
  border: 2px solid #000;
  background: ${({ $danger }) => $danger ? '#ff0000' : '#fff'};
  color: ${({ $danger }) => $danger ? '#fff' : '#000'};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #000;

  &:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #000;
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: none;
  }
`

const AccountDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;

  code {
    font-family: 'Courier New', monospace;
    font-weight: 700;
  }
`

const DetailLabel = styled.span`
  font-weight: 900;
  text-transform: uppercase;
  color: #666;
`

const DetailValue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const AccountsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`

const GridCard = styled.div`
  border: 3px solid #000;
  background: #fff;
  box-shadow: 4px 4px 0 #000;
  transition: all 0.2s;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #000;
  }
`

const GridCardHeader = styled.div`
  padding: 1rem;
  border-bottom: 2px solid #000;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
`

const GridCardTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 900;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const GridCardActions = styled.div`
  display: flex;
  gap: 0.25rem;
`

const GridCardBody = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const GridDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;

  code {
    font-family: 'Courier New', monospace;
    font-weight: 700;
  }
`

const GridLabel = styled.span`
  font-weight: 900;
  text-transform: uppercase;
  color: #666;
  white-space: nowrap;
`

const GridValueRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`
