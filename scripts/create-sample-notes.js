#!/usr/bin/env node

import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project_manager'

async function createSampleNotes() {
  let client
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db()
    const collection = db.collection('codecomponents')

    // Sample notes data
    const sampleNotes = [
      {
        name: "React Hook Sample",
        description: "Custom hook for API data fetching",
        component_type: "snippet",
        content_type: "code",
        content: {
          code: [
            {
              language: "typescript",
              title: "useApi Hook",
              code: `import { useState, useEffect } from 'react'

export function useApi<T>(url: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}`
            }
          ]
        },
        tags: ["react", "typescript", "hooks", "api"],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Useful Development Links",
        description: "Collection of helpful development resources",
        component_type: "bookmark",
        content_type: "link",
        content: {
          links: [
            {
              url: "https://react.dev",
              title: "React Documentation",
              description: "Official React documentation with guides and API reference"
            },
            {
              url: "https://nextjs.org/docs",
              title: "Next.js Documentation",
              description: "Complete guide to building applications with Next.js"
            },
            {
              url: "https://tailwindcss.com/docs",
              title: "Tailwind CSS",
              description: "Utility-first CSS framework documentation"
            }
          ]
        },
        tags: ["documentation", "react", "nextjs", "css"],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Project Setup Notes",
        description: "Important notes for project configuration",
        component_type: "note",
        content_type: "text",
        content: {
          text: `# Project Setup Checklist

## Environment Setup
- [ ] Install Node.js (v18 or higher)
- [ ] Install dependencies: npm install
- [ ] Configure environment variables in .env
- [ ] Setup database connection
- [ ] Configure authentication

## Development Workflow
1. Start development server: npm run dev
2. Check code quality: npm run lint
3. Run tests: npm test
4. Build for production: npm run build

## Important Notes
- Always test authentication before deploying
- Database migrations should be reviewed
- Environment variables must be configured in production
- SSL certificates are required for production deployment

## Useful Commands
\`\`\`bash
# Start development with socket server
npm run dev:socket

# Check database connectivity
curl http://localhost:3000/api/test-db

# Clear authentication cookies
curl http://localhost:3000/api/auth/clear
\`\`\`
`
        },
        tags: ["setup", "checklist", "development", "deployment"],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Database Query Examples",
        description: "Common MongoDB queries for the project",
        component_type: "snippet",
        content_type: "mixed",
        content: {
          text: "Collection of frequently used database queries and operations.",
          code: [
            {
              language: "javascript",
              title: "Find with Filters",
              code: `// Find documents with specific criteria
const notes = await db.collection('codecomponents').find({
  component_type: 'note',
  tags: { $in: ['important'] },
  created_at: { $gte: new Date('2024-01-01') }
}).toArray()

// Count documents by type
const counts = await db.collection('codecomponents').aggregate([
  { $group: { _id: '$component_type', count: { $sum: 1 } } }
]).toArray()`
            },
            {
              language: "javascript", 
              title: "Update Operations",
              code: `// Update note content
await db.collection('codecomponents').updateOne(
  { _id: ObjectId(noteId) },
  { 
    $set: { 
      content: updatedContent,
      updated_at: new Date()
    }
  }
)

// Add tag to existing note
await db.collection('codecomponents').updateOne(
  { _id: ObjectId(noteId) },
  { $addToSet: { tags: 'new-tag' } }
)`
            }
          ],
          links: [
            {
              url: "https://docs.mongodb.com/manual/reference/operator/query/",
              title: "MongoDB Query Operators",
              description: "Complete reference for MongoDB query operators"
            }
          ]
        },
        tags: ["mongodb", "queries", "database", "examples"],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "CSS Animations Snippets",
        description: "Reusable CSS animations for UI components",
        component_type: "snippet",
        content_type: "code",
        content: {
          code: [
            {
              language: "css",
              title: "Fade In Animation",
              code: `@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.fade-in-delayed {
  opacity: 0;
  animation: fadeIn 0.5s ease-out 0.2s forwards;
}`
            },
            {
              language: "css",
              title: "Loading Spinner",
              code: `@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.spinner-lg {
  width: 40px;
  height: 40px;
  border-width: 4px;
}`
            }
          ]
        },
        tags: ["css", "animations", "ui", "components"],
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    // Insert sample notes
    const result = await collection.insertMany(sampleNotes)
    console.log(`✅ Successfully created ${result.insertedCount} sample notes`)
    
    // Display created notes
    console.log('\nCreated notes:')
    sampleNotes.forEach((note, index) => {
      console.log(`${index + 1}. ${note.name} (${note.component_type}) - ${note.content_type}`)
    })

  } catch (error) {
    console.error('❌ Error creating sample notes:', error)
  } finally {
    if (client) {
      await client.close()
      console.log('\nDisconnected from MongoDB')
    }
  }
}

// Run the script
createSampleNotes()

export { createSampleNotes }