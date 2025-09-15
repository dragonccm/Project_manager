import MigrationTool from '@/components/migration-tool'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Migration | Project Manager',
  description: 'Migrate data from old Neon database to MongoDB',
}

export default function MigrationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <MigrationTool />
      </div>
    </div>
  )
}