"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { PieChart, CheckCircle2, Clock3, ListChecks, AlertCircle, Calendar, Search, Filter, TrendingUp, Users, Target, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedTaskOverviewProps {
    projects: any[]
    tasks: any[]
    accounts: any[]
}

const LazyTaskList = ({ tasks, visible, instanceId }: { tasks: any[], visible: boolean, instanceId?: string }) => {
    const [displayedTasks, setDisplayedTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const BATCH_SIZE = 10
    const listId = instanceId || `list-${Math.random().toString(36).substr(2, 9)}`

    // Create a memoized unique tasks array using Map for deduplication
    const uniqueTasks = useMemo(() => {
        const taskMap = new Map()
        tasks.forEach(task => {
            if (task && (task._id || task.id)) {
                const key = task._id || task.id
                taskMap.set(key, task)
            }
        })
        return Array.from(taskMap.values())
    }, [tasks])

    // Reset displayed tasks when input tasks change
    useEffect(() => {
        setDisplayedTasks([])
        setHasMore(uniqueTasks.length > 0)
    }, [uniqueTasks])

    useEffect(() => {
        if (visible && displayedTasks.length === 0 && uniqueTasks.length > 0) {
            loadMoreTasks()
        }
    }, [visible, uniqueTasks])

    const loadMoreTasks = () => {
        if (loading || !hasMore) return

        setLoading(true)
        setTimeout(() => {
            const nextBatch = uniqueTasks.slice(displayedTasks.length, displayedTasks.length + BATCH_SIZE)

            // Use Map for absolute deduplication based on task ID
            const currentTaskMap = new Map()
            displayedTasks.forEach(task => {
                if (task._id || task.id) {
                    currentTaskMap.set(task._id || task.id, task)
                }
            })

            nextBatch.forEach(task => {
                if (task._id || task.id) {
                    currentTaskMap.set(task._id || task.id, task)
                }
            })

            const newDisplayedTasks = Array.from(currentTaskMap.values())
            setDisplayedTasks(newDisplayedTasks)
            setHasMore(newDisplayedTasks.length < uniqueTasks.length)
            setLoading(false)
        }, 300)
    }

    if (!visible) return null

    return (
        <div className="space-y-2">
            {displayedTasks.map((task, index) => {
                // Multi-layer unique key generation with fail-safes
                const taskId = task._id || task.id || `task-${index}`
                const titleSlug = task.title?.replace(/\s+/g, '-').slice(0, 10) || 'untitled'
                const uniqueKey = `${listId}-${taskId}-${index}-${titleSlug}`

                // Additional safety check for task validity
                if (!task || (!task.title && !task._id && !task.id)) {
                    console.warn('Invalid task found:', task)
                    return null
                }

                return (
                    <div key={uniqueKey} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{task.title || 'Untitled Task'}</span>
                                <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                                    {task.priority || 'Low'}
                                </Badge>
                            </div>
                            {task.description && (
                                <p className="text-sm text-muted-foreground mt-1 truncate">{task.description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {task.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : task.status === 'in-progress' ? (
                                <Clock3 className="h-4 w-4 text-yellow-600" />
                            ) : (
                                <ListChecks className="h-4 w-4 text-gray-400" />
                            )}
                        </div>
                    </div>
                )
            }).filter(Boolean)} {/* Filter out null values from invalid tasks */}
            {hasMore && (
                <Button
                    variant="ghost"
                    onClick={loadMoreTasks}
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? "Loading..." : "Load More Tasks"}
                </Button>
            )}
        </div>
    )
}

export function EnhancedTaskOverview({ projects, tasks, accounts }: EnhancedTaskOverviewProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedProject, setSelectedProject] = useState<string>("all")
    const [selectedStatus, setSelectedStatus] = useState<string>("all")
    const [selectedPriority, setSelectedPriority] = useState<string>("all")
    const [selectedProjectView, setSelectedProjectView] = useState<string | null>(null)

    // Enhanced statistics
    const stats = useMemo(() => {
        const total = tasks.length
        const completed = tasks.filter(t => t.completed).length
        const inProgress = tasks.filter(t => t.status === 'in-progress').length
        const todo = tasks.filter(t => !t.completed && t.status !== 'in-progress').length
        const highPriority = tasks.filter(t => t.priority === 'high').length
        const overdue = tasks.filter(t => {
            if (!t.due_date) return false
            const dueDate = new Date(t.due_date)
            return dueDate < new Date() && !t.completed
        }).length

        // Time statistics
        const totalEstimated = tasks.reduce((sum, t) => sum + (parseInt(t.estimated_time) || 0), 0)
        const totalActual = tasks.reduce((sum, t) => sum + (parseInt(t.actual_time) || 0), 0)

        return {
            total,
            completed,
            inProgress,
            todo,
            highPriority,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            totalEstimated,
            totalActual,
            efficiency: totalEstimated > 0 ? Math.round((totalEstimated / Math.max(totalActual, 1)) * 100) : 0
        }
    }, [tasks])

    // Filtered tasks with enhanced deduplication and validation
    const filteredTasks = useMemo(() => {
        // First, ensure tasks is an array and filter out invalid tasks
        const validTasks = Array.isArray(tasks) ? tasks.filter(task =>
            task &&
            (task._id || task.id || task.title) && // Must have some identifier
            task.title // Must have a title
        ) : []

        // Apply filters
        const filtered = validTasks.filter(task => {
            const matchesSearch = !searchTerm ||
                task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesProject = selectedProject === "all" ||
                (task.projectId || task.project_id) === selectedProject

            const matchesStatus = selectedStatus === "all" ||
                (selectedStatus === "completed" && task.completed) ||
                (selectedStatus === "in-progress" && task.status === "in-progress") ||
                (selectedStatus === "todo" && !task.completed && task.status !== "in-progress")

            const matchesPriority = selectedPriority === "all" ||
                task.priority === selectedPriority

            return matchesSearch && matchesProject && matchesStatus && matchesPriority
        })

        // Deduplicate based on MongoDB _id or id
        const uniqueTasks = filtered.filter((task, index, array) => {
            const identifier = task._id || task.id
            if (!identifier) return true // Keep tasks without IDs (shouldn't happen after validation above)

            return array.findIndex(t => (t._id || t.id) === identifier) === index
        })

        return uniqueTasks
    }, [tasks, searchTerm, selectedProject, selectedStatus, selectedPriority])

    // Project statistics with enhanced data
    const projectStats = useMemo(() => {
        return projects.map(project => {
            const projectTasks = tasks.filter(t => (t.projectId || t.project_id) === project.id)
            const completed = projectTasks.filter(t => t.completed).length
            const inProgress = projectTasks.filter(t => t.status === 'in-progress').length
            const highPriority = projectTasks.filter(t => t.priority === 'high').length
            const overdue = projectTasks.filter(t => {
                if (!t.due_date) return false
                const dueDate = new Date(t.due_date)
                return dueDate < new Date() && !t.completed
            }).length

            return {
                ...project,
                taskStats: {
                    total: projectTasks.length,
                    completed,
                    inProgress,
                    todo: projectTasks.length - completed - inProgress,
                    highPriority,
                    overdue,
                    completionRate: projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0
                },
                tasks: projectTasks
            }
        }).sort((a, b) => b.taskStats.total - a.taskStats.total)
    }, [projects, tasks])

    if (selectedProjectView) {
        const project = projectStats.find(p => p.id === selectedProjectView)
        if (!project) return null

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => setSelectedProjectView(null)}>
                            ← Back to Overview
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{project.name}</h1>
                            <p className="text-muted-foreground">{project.taskStats.total} tasks total</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Total Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project.taskStats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <div className="text-2xl font-bold">{project.taskStats.completed}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">In Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-yellow-600" />
                                <div className="text-2xl font-bold">{project.taskStats.inProgress}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Completion Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-blue-600" />
                                <div className="text-2xl font-bold">{project.taskStats.completionRate}%</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Project Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LazyTaskList tasks={project.tasks} visible={true} instanceId={`project-${project.id}`} />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <PieChart className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Task Overview</h1>
            </div>

            {/* Enhanced Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-1">
                            <ListChecks className="h-4 w-4" />
                            Total Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-1">
                            <Clock3 className="h-4 w-4 text-yellow-600" />
                            In Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            High Priority
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{stats.highPriority}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            Overdue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">{stats.overdue}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            Completion Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{stats.completionRate}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters & Search
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search tasks..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                {projects.map(project => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="todo">To Do</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Showing {filteredTasks.length} of {stats.total} tasks
                    </div>
                </CardContent>
            </Card>

            {/* Project Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Project Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projectStats.map((project) => (
                            <div
                                key={project.id}
                                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all hover:bg-muted/30"
                                onClick={() => setSelectedProjectView(project.id)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="font-medium truncate">{project.name}</div>
                                    <Badge variant="outline">{project.taskStats.total} tasks</Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                        <span>{project.taskStats.completed} done</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock3 className="h-3 w-3 text-yellow-600" />
                                        <span>{project.taskStats.inProgress} progress</span>
                                    </div>
                                    {project.taskStats.highPriority > 0 && (
                                        <div className="flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3 text-red-600" />
                                            <span>{project.taskStats.highPriority} urgent</span>
                                        </div>
                                    )}
                                    {project.taskStats.overdue > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-orange-600" />
                                            <span>{project.taskStats.overdue} overdue</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Completion</span>
                                        <span className="font-medium">{project.taskStats.completionRate}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                project.taskStats.completionRate >= 80 ? "bg-green-500" :
                                                    project.taskStats.completionRate >= 60 ? "bg-blue-500" :
                                                        project.taskStats.completionRate >= 40 ? "bg-yellow-500" : "bg-red-500"
                                            )}
                                            style={{ width: `${project.taskStats.completionRate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Filtered Tasks */}
            {(searchTerm || selectedProject !== "all" || selectedStatus !== "all" || selectedPriority !== "all") && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Filtered Tasks ({filteredTasks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LazyTaskList tasks={filteredTasks} visible={true} instanceId="filtered-tasks" />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}