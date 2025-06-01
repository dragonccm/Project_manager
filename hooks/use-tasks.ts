"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { getLocalDateString } from "@/lib/date-utils"
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/api/database"
import { createLocalStorageOperations } from "@/lib/api/database-fallback"
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/types/features"

export function useTasks(isDatabaseAvailable: boolean) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Memoize localOps to prevent recreation on every render
  const localOps = useMemo(() => createLocalStorageOperations(), [])

  // Helper function to normalize task data
  const normalizeTask = useCallback((task: any): Task => ({
    id: typeof task.id === 'string' ? parseInt(task.id) : task.id,
    title: task.title,
    description: task.description || "",
    project_id: task.project_id || undefined,
    assigned_to: task.assigned_to || undefined,
    status: task.status || (task.completed ? "done" : "todo"),
    priority: task.priority || "medium",
    date: task.date ? (typeof task.date === "string" ? task.date : getLocalDateString(new Date(task.date))) : getLocalDateString(new Date()),
    estimated_time: task.estimated_time || undefined,
    actual_time: task.actual_time || undefined,
    completed: typeof task.completed === "boolean" ? task.completed : !!task.completed,
    created_at: task.created_at || new Date().toISOString(),
    updated_at: task.updated_at || new Date().toISOString()
  }), [])

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (isDatabaseAvailable) {
        const tasksData = await getTasks()
        const mappedTasks = tasksData.map(normalizeTask)
        setTasks(mappedTasks)
      } else {
        const savedTasks = localStorage.getItem("tasks")
        const parsedTasks = savedTasks ? JSON.parse(savedTasks) : []
        setTasks(parsedTasks.map(normalizeTask))
      }
    } catch (err) {
      console.error("Error loading tasks:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      const savedTasks = localStorage.getItem("tasks")
      const parsedTasks = savedTasks ? JSON.parse(savedTasks) : []
      setTasks(parsedTasks.map(normalizeTask))
    } finally {
      setLoading(false)
    }
  }, [isDatabaseAvailable, normalizeTask])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const addTask = async (taskData: CreateTaskInput) => {
    try {
      if (isDatabaseAvailable) {
        const newTask = await createTask(taskData)
        const normalizedTask = normalizeTask(newTask)
        setTasks((prev) => [normalizedTask, ...prev])
        return normalizedTask
      } else {
        const newTask = localOps.createTask(taskData)
        const normalizedTask = normalizeTask(newTask)
        setTasks((prev) => [normalizedTask, ...prev])
        return normalizedTask
      }
    } catch (err) {
      console.error("Error adding task:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      const newTask = localOps.createTask(taskData)
      const normalizedTask = normalizeTask(newTask)
      setTasks((prev) => [normalizedTask, ...prev])
      return normalizedTask
    }
  }

  const editTask = async (id: number, taskData: UpdateTaskInput) => {
    try {
      if (isDatabaseAvailable) {
        const updatedTask = await updateTask(id, taskData)
        const normalizedTask = normalizeTask(updatedTask)
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? normalizedTask : t)),
        )
        return normalizedTask
      } else {
        const updatedTask = localOps.updateTask(id.toString(), taskData)
        const normalizedTask = normalizeTask(updatedTask)
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? normalizedTask : t)),
        )
        return normalizedTask
      }
    } catch (err) {
      console.error("Error editing task:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      const updatedTask = localOps.updateTask(id.toString(), taskData)
      const normalizedTask = normalizeTask(updatedTask)
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? normalizedTask : t)),
      )
      return normalizedTask
    }
  }

  const removeTask = async (id: number) => {
    try {
      if (isDatabaseAvailable) {
        await deleteTask(id)
        setTasks((prev) => prev.filter((t) => t.id !== id))
      } else {
        localOps.deleteTask(id.toString())
        setTasks((prev) => prev.filter((t) => t.id !== id))
      }
    } catch (err) {
      console.error("Error removing task:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      localOps.deleteTask(id.toString())
      setTasks((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const toggleTask = async (id: number, completed: boolean) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === id);
      if (!taskToUpdate) throw new Error("Task not found");

      const updatedStatus = completed ? 'done' : (taskToUpdate.status === 'done' ? 'todo' : taskToUpdate.status);

      if (isDatabaseAvailable) {
        const updatedTask = await updateTask(id, { completed, status: updatedStatus })
        const normalizedTask = normalizeTask(updatedTask)
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? normalizedTask : t)),
        )
        return normalizedTask;
      } else {
        const updatedTask = localOps.updateTask(id.toString(), { completed, status: updatedStatus })
        const normalizedTask = normalizeTask(updatedTask)
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? normalizedTask : t)),
        )
        return normalizedTask;
      }
    } catch (err) {
      console.error("Error toggling task:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      const taskToUpdate = tasks.find(t => t.id === id);
      if (!taskToUpdate) throw new Error("Task not found");
      const updatedStatus = completed ? 'done' : (taskToUpdate.status === 'done' ? 'todo' : taskToUpdate.status);
      const updatedTask = localOps.updateTask(id.toString(), { completed, status: updatedStatus })
      const normalizedTask = normalizeTask(updatedTask)
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? normalizedTask : t)),
      )
      return normalizedTask;
    }
  }

  return {
    tasks,
    loadingTasks: loading,
    errorTasks: error,
    addTask,
    editTask,
    removeTask,
    toggleTask,
    reloadTasks: loadTasks
  }
}