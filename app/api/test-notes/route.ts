import { NextRequest, NextResponse } from "next/server"
import { getCodeComponents } from "@/lib/mongo-database"

export async function GET() {
  try {
    // Get all notes without authentication for testing
    const notes = await getCodeComponents()
    
    return NextResponse.json({
      success: true,
      count: notes.length,
      notes: notes.slice(0, 5) // Return first 5 notes for testing
    })
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    )
  }
}