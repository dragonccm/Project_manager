"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/api/database"
import { createLocalStorageOperations } from "@/lib/api/database-fallback"
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/types/features"

export function useProjects(isDatabaseAvailable: boolean) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const localOps = createLocalStorageOperations()

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (isDatabaseAvailable) {
        const projectsData = await getProjects()
        const mappedProjects = projectsData.map((project: any) => ({
          ...project,
          id: project.id.toString(),
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          figmaLink: project.figma_link
        }))
        setProjects(mappedProjects as Project[])
      } else {
        const savedProjects = localStorage.getItem("projects")
        setProjects(savedProjects ? JSON.parse(savedProjects) : [])
      }
    } catch (err) {
      console.error("Error loading projects:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      const savedProjects = localStorage.getItem("projects")
      setProjects(savedProjects ? JSON.parse(savedProjects) : [])
    } finally {
      setLoading(false)
    }
  }, [isDatabaseAvailable])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const addProject = async (projectData: CreateProjectInput) => {
    try {
      if (isDatabaseAvailable) {
        const newProject = await createProject(projectData)
        setProjects((prev) => [newProject as Project, ...prev])
        return newProject
      } else {
        const newProject = localOps.createProject(projectData)
        setProjects((prev) => [newProject as Project, ...prev])
        return newProject
      }
    } catch (err) {
      console.error("Error adding project:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      // Fallback to localOps if database fails mid-operation
      const newProject = localOps.createProject(projectData)
      setProjects((prev) => [newProject as Project, ...prev])
      return newProject
    }
  }

  const editProject = async (id: string, projectData: UpdateProjectInput) => {
    try {
      if (isDatabaseAvailable) {
        const updatedProject = await updateProject(parseInt(id), projectData)
        setProjects((prev) =>
          prev.map((p:any) => (p.id === id ? (updatedProject as Project) : p)),
        )
        return updatedProject
      } else {
        const updatedProject = localOps.updateProject(id, projectData)
        setProjects((prev) =>
          prev.map((p:any) => (p.id === id ? (updatedProject as Project) : p)),
        )
        return updatedProject
      }
    } catch (err) {
      console.error("Error editing project:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      const updatedProject = localOps.updateProject(id, projectData)
      setProjects((prev) =>
        prev.map((p:any) => (p.id === id ? (updatedProject as Project) : p)),
      )
      return updatedProject
    }
  }

  const removeProject = async (id: string) => {
    try {
      if (isDatabaseAvailable) {
        await deleteProject(parseInt(id))
        setProjects((prev) => prev.filter((p:any) => p.id !== id))
      } else {
        localOps.deleteProject(id)
        setProjects((prev) => prev.filter((p:any) => p.id !== id))
      }
    } catch (err) {
      console.error("Error removing project:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      localOps.deleteProject(id)
      setProjects((prev) => prev.filter((p:any) => p.id !== id))
    }
  }

  return {
    projects,
    loadingProjects: loading,
    errorProjects: error,
    addProject,
    editProject,
    removeProject,
    reloadProjects: loadProjects
  }
}