import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongo-database'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-session'
import { handleApiError, validateRequired } from '@/lib/api-base'
import { CreateA4TemplateInput, UpdateA4TemplateInput } from '@/types/database'
import { ObjectId } from 'mongodb'

// GET - Get all templates or by ID
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { db } = await connectToDatabase()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const category = searchParams.get('category')
    const isPublic = searchParams.get('isPublic')
    const isTemplate = searchParams.get('isTemplate')
    const tag = searchParams.get('tag')
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')

    // Get specific template by ID
    if (id) {
      const template = await db.collection('a4templates').findOne({ 
        _id: new ObjectId(id),
        $or: [
          { user_id: request.user.id },
          { isPublic: true },
          { 'sharedWith.userId': request.user.id }
        ]
      })
      
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        ...template,
        id: template._id.toString(),
        _id: undefined
      })
    }

    // Build query
    const query: any = {
      $or: [
        { user_id: request.user.id },
        { isPublic: true },
        { 'sharedWith.userId': request.user.id }
      ]
    }
    
    if (category) {
      query.category = category
    }
    
    if (isPublic !== null) {
      query.isPublic = isPublic === 'true'
    }
    
    if (isTemplate !== null) {
      query.isTemplate = isTemplate === 'true'
    }
    
    if (tag) {
      query.tags = tag
    }
    
    if (entityType && entityId) {
      query['linkedEntities.entityType'] = entityType
      query['linkedEntities.entityId'] = entityId
    }

    // Get all templates with filters
    const templates = await db.collection('a4templates')
      .find(query)
      .sort({ updated_at: -1 })
      .toArray()

    const formattedTemplates = templates.map((template: any) => ({
      ...template,
      id: template._id.toString(),
      _id: undefined
    }))

    return NextResponse.json(formattedTemplates)
  } catch (error) {
    return handleApiError(error, 'fetching templates')
  }
})

// POST - Create new template
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body: CreateA4TemplateInput = await request.json()
    
    // Validate required fields
    const missingFields = validateRequired(body, ['name'])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Create new template with default canvas settings
    const newTemplate = {
      user_id: request.user.id,
      name: body.name,
      description: body.description || '',
      canvasSettings: {
        mode: body.canvasSettings?.mode || 'a4',
        width: body.canvasSettings?.width || 794,
        height: body.canvasSettings?.height || 1123,
        backgroundColor: body.canvasSettings?.backgroundColor || '#ffffff',
        backgroundImage: body.canvasSettings?.backgroundImage,
        gridEnabled: body.canvasSettings?.gridEnabled !== undefined ? body.canvasSettings.gridEnabled : true,
        gridSize: body.canvasSettings?.gridSize || 20,
        gridColor: body.canvasSettings?.gridColor || '#e0e0e0',
        snapToGrid: body.canvasSettings?.snapToGrid !== undefined ? body.canvasSettings.snapToGrid : true,
        snapTolerance: body.canvasSettings?.snapTolerance || 5,
        padding: body.canvasSettings?.padding || 40,
        autoExpand: body.canvasSettings?.autoExpand || false
      },
      shapes: body.shapes || [],
      linkedEntities: body.linkedEntities || [],
      category: body.category || 'custom',
      tags: body.tags || [],
      isPublic: body.isPublic || false,
      isTemplate: body.isTemplate || false,
      version: 1,
      versionHistory: [],
      usageCount: 0,
      lastUsed: null,
      sharedWith: [],
      createdBy: request.user.email || request.user.id,
      updatedBy: request.user.email || request.user.id,
      created_at: new Date(),
      updated_at: new Date()
    }

    const result = await db.collection('a4templates').insertOne(newTemplate)

    return NextResponse.json({
      ...newTemplate,
      id: result.insertedId.toString(),
      _id: undefined
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'creating template')
  }
})

// PUT - Update template
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const body: UpdateA4TemplateInput = await request.json()
    const { db } = await connectToDatabase()

    // Find existing template
    const existingTemplate = await db.collection('a4templates').findOne({ 
      _id: new ObjectId(id),
      user_id: request.user.id // Only owner can update
    })
    
    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found or you do not have permission to edit' },
        { status: 404 }
      )
    }

    // Prepare update object
    const updateData: any = {
      updated_at: new Date(),
      updatedBy: request.user.email || request.user.id
    }

    // Save current version to history if significant changes
    if (body.changeDescription) {
      const versionEntry = {
        version: existingTemplate.version,
        templateData: {
          canvasSettings: existingTemplate.canvasSettings,
          shapes: existingTemplate.shapes,
          linkedEntities: existingTemplate.linkedEntities
        },
        changedBy: request.user.email || request.user.id,
        changeDescription: body.changeDescription,
        timestamp: new Date()
      }
      updateData.$push = { versionHistory: versionEntry }
      updateData.version = existingTemplate.version + 1
    }

    // Update fields
    if (body.name) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.canvasSettings) updateData.canvasSettings = { ...existingTemplate.canvasSettings, ...body.canvasSettings }
    if (body.shapes) updateData.shapes = body.shapes
    if (body.linkedEntities) updateData.linkedEntities = body.linkedEntities
    if (body.category) updateData.category = body.category
    if (body.tags) updateData.tags = body.tags
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic
    if (body.isTemplate !== undefined) updateData.isTemplate = body.isTemplate

    const result = await db.collection('a4templates').findOneAndUpdate(
      { _id: new ObjectId(id), user_id: request.user.id },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...result,
      id: result._id.toString(),
      _id: undefined
    })
  } catch (error) {
    return handleApiError(error, 'updating template')
  }
})

// DELETE - Delete template
export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    const result = await db.collection('a4templates').deleteOne({ 
      _id: new ObjectId(id),
      user_id: request.user.id // Only owner can delete
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Template not found or you do not have permission to delete' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Template deleted successfully' 
    })
  } catch (error) {
    return handleApiError(error, 'deleting template')
  }
})
