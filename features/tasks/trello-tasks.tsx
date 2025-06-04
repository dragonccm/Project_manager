"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getLocalDateString, getTodayDateString } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Clock, Circle, Inbox, Loader, Check, X, Eye } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useEmail } from "@/hooks/use-email"
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Textarea } from "@/components/ui/textarea"
import { MobileKanbanBoard } from "@/components/mobile-kanban"
import { useIsMobile } from "@/hooks/use-mobile"

interface Task {
  id: string
  title: string
  description: string
  projectId: string
  priority: "low" | "medium" | "high"
  completed: boolean
  date: string
  estimatedTime: number
  actualTime?: number
  status: "todo" | "in-progress" | "done"
}

interface TrelloTasksProps {
  projects: any[]
  tasks: any[]
  onAddTask?: (taskData: any) => Promise<any>
  onEditTask?: (id: number, taskData: any) => Promise<any>
  onDeleteTask?: (id: number) => Promise<void>
  onToggleTask?: (id: number, completed: boolean) => Promise<any>
  emailNotifications?: {
    enabled: boolean
    recipients: string[]
  }
}

// Tạo component cho task có thể kéo thả
interface DraggableTaskCardProps {
  task: any;
  project: any;
  onToggle: (taskId: string, completed: boolean) => void;
  getPriorityColor: (priority: string) => string;
  onViewDetails: (task: any) => void;
}

// Component cho cột droppable
interface DroppableColumnProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  tasks: any[];
  bgColor: string;
  onToggle: (taskId: string, completed: boolean) => void;
  getPriorityColor: (priority: string) => string;
  projects: any[];
  onViewDetails: (task: any) => void;
}

function DraggableTaskCard({ task, project, onToggle, getPriorityColor, onViewDetails }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: task.id,
    data: { ...task }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`border rounded-lg p-4 mb-3 bg-card shadow hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing touch-manipulation ${task.completed ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id, task.completed)}
          className="mt-1 touch-manipulation h-5 w-5"
        />
        <div className="flex-1 min-w-0">          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-medium text-sm truncate ${task.completed ? "line-through" : ""}`}>{task.title}</h3>
            <Badge variant={getPriorityColor(task.priority) as any} className="shrink-0">{task.priority}</Badge>
          </div>
          {task.description && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
            {project && (
              <span className="flex items-center gap-1">
                <Circle className="h-3 w-3 shrink-0" />
                <span className="truncate">{project.name}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {task.estimated_time || task.estimatedTime}min
            </span>
            <span className="text-xs truncate">
              {task.date ? getLocalDateString(new Date(task.date)) : 'Chưa có ngày'}
            </span>
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(task);
              }}
              className="h-8 px-2 text-xs touch-manipulation"
            >
              <Eye className="h-3 w-3 mr-1" />
              Xem chi tiết
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({ id, title, icon, tasks, bgColor, onToggle, getPriorityColor, projects, onViewDetails }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <Card className="touch-manipulation">
      <CardHeader className={`${bgColor} rounded-t-lg pb-3`}>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          <span className="truncate">{title}</span>
          <Badge variant="outline" className="ml-auto shrink-0">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef} className="p-3 min-h-[200px] max-h-[400px] lg:max-h-[500px] overflow-y-auto overscroll-contain">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => {
            const taskProjectId = task.projectId || task.project_id?.toString();
            const project = projects.find((p) => p.id == taskProjectId);
            return (
              <DraggableTaskCard 
                key={task.id}
                task={task}
                project={project}
                onToggle={onToggle}
                getPriorityColor={getPriorityColor}
                onViewDetails={onViewDetails}
              />
            );
          })}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm italic">
              Không có task nào trong danh sách này
            </div>
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
}

export function TrelloTasks({ projects, tasks, onAddTask, onEditTask, onDeleteTask, onToggleTask, emailNotifications }: TrelloTasksProps) {
  const { t } = useLanguage()
  const { sendTaskCreatedEmail, sendTaskCompletedEmail } = useEmail()
  const isMobile = useIsMobile()
  
  // Default to today's date using local timezone  // Sử dụng hàm tiện ích đã được cập nhật để sử dụng giờ Việt Nam
  const [selectedDate, setSelectedDate] = useState(() => {
    return getLocalDateString(new Date()); // Sử dụng getLocalDateString để nhất quán
  })
  // Ẩn/hiện form thêm task
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Task details dialog state
  const [viewingTask, setViewingTask] = useState<any>(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "none",
    priority: "medium" as const,
    estimatedTime: 60,
    status: "todo" as "todo" | "in-progress" | "done",
    // KHÔNG khởi tạo date ở đây, sẽ set khi submit
  })

  // Phân loại tasks theo trạng thái
  const [tasksByStatus, setTasksByStatus] = useState<{
    todo: any[],
    "in-progress": any[],
    done: any[]
  }>({
    todo: [],
    "in-progress": [],
    done: []
  })
  
  // Sensors cho drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
    // Xử lý phân loại tasks khi tasks thay đổi
  useEffect(() => {
    console.log("TrelloTasks: useEffect triggered");
    console.log("TrelloTasks: tasks received:", tasks?.length, tasks);
    console.log("TrelloTasks: selectedDate:", selectedDate);
    
    if (!tasks || tasks.length === 0) {
      console.log("TrelloTasks: No tasks found, setting empty states");
      setTasksByStatus({
        todo: [],
        "in-progress": [],
        done: []
      });
      return;
    }
      // Lọc tasks theo ngày đã chọn, sử dụng hàm getLocalDateString để đảm bảo timezone nhất quán
    const filteredTasks = tasks.filter((task: any) => {
      const taskDate = task.date ? getLocalDateString(new Date(task.date)) : null;
      const matches = taskDate === selectedDate;
      console.log(`TrelloTasks: Task ${task.id} - date: ${task.date}, taskDate: ${taskDate}, selectedDate: ${selectedDate}, matches: ${matches}`);
      return matches;
    });
    
    console.log("TrelloTasks: filteredTasks:", filteredTasks.length, filteredTasks);
      // Phân loại tasks theo trạng thái
    const todoTasks = filteredTasks.filter(t => {
      // Task is todo if: not completed AND (no status OR status is 'todo')
      return !t.completed && (!t.status || t.status === 'todo');
    });
    
    const inProgressTasks = filteredTasks.filter(t => {
      // Task is in-progress if: not completed AND status is 'in-progress'
      return !t.completed && t.status === 'in-progress';
    });
    
    const doneTasks = filteredTasks.filter(t => {
      // Task is done if: completed OR status is 'done'
      return t.completed || t.status === 'done';
    });
    
    console.log("TrelloTasks: Categorized tasks:", {
      todo: todoTasks.length,
      inProgress: inProgressTasks.length,
      done: doneTasks.length
    });
    
    setTasksByStatus({
      todo: todoTasks,
      "in-progress": inProgressTasks,
      done: doneTasks
    });
  }, [tasks, selectedDate]);
    const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!active || !over) return;
    
    // Lấy task và container đích
    const taskId = active.id as string;
    const overId = over.id as string;
    const task = tasks.find((t: any) => t.id == taskId);
    
    if (!task) return;
    
    console.log(`Drag ended: Task ${taskId} to ${overId}`);
    
    // Nếu kéo vào container trạng thái mới
    if (overId === 'todo' || overId === 'in-progress' || overId === 'done') {
      const newStatus = overId as "todo" | "in-progress" | "done";
      const completed = newStatus === 'done'; // Tự động đánh dấu hoàn thành nếu kéo vào cột "Hoàn thành"

      // Nếu trạng thái không thay đổi, không cần cập nhật
      if (task.status === newStatus && task.completed === completed) {
        return;
      }

      try {
        console.log(`Updating task ${taskId}: status=${newStatus}, completed=${completed}`);
        
        // Cập nhật trạng thái task
        if (onEditTask) {
          await onEditTask(Number(taskId), {
            status: newStatus,
            completed
          });
        }
        
        // Gửi email thông báo nếu task được hoàn thành
        if (completed && !task.completed && emailNotifications?.enabled && emailNotifications.recipients.length > 0) {
          try {
            const project = projects.find(p => p.id === task.projectId);
            await sendTaskCompletedEmail({
              taskTitle: task.title,
              taskDescription: task.description,
              projectName: project?.name || "Chưa chọn project",
              priority: task.priority,
              dueDate: task.date
            }, emailNotifications.recipients);
          } catch (emailError) {
            console.error("Error sending task completed email:", emailError);
          }
        }
      } catch (error) {
        console.error("Error updating task:", error);
        alert("Lỗi khi cập nhật trạng thái task. Vui lòng thử lại.");
      }
    }
  };
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!onToggleTask) {
      alert("Chức năng cập nhật task chưa được kết nối!");
      return;
    }

    try {
      await onToggleTask(Number.parseInt(taskId), !completed);
      
      // Gửi email thông báo khi task hoàn thành
      if (!completed && emailNotifications?.enabled && emailNotifications.recipients.length > 0) {
        try {
          const task = tasks.find(t => t.id == taskId);
          if (task) {
            const project = projects.find(p => p.id === task.projectId);
            await sendTaskCompletedEmail({
              taskTitle: task.title,
              taskDescription: task.description,
              projectName: project?.name || "Chưa chọn project",
              priority: task.priority,
              dueDate: task.date
            }, emailNotifications.recipients);
          }
        } catch (emailError) {
          console.error("Error sending task completed email:", emailError);
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Lỗi khi cập nhật task. Vui lòng thử lại.");
    }
  };

  const handleViewTaskDetails = (task: any) => {
    setViewingTask(task);
    setShowTaskDetails(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!onAddTask) {
      alert("Chức năng thêm task chưa được kết nối!");
      return;
    }

    try {
      const newTask = await onAddTask({
        project_id: formData.projectId && formData.projectId !== "" && formData.projectId !== "none" ? 
          Number.parseInt(formData.projectId) : null,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,        // Sử dụng ngày local yyyy-mm-dd (tz safe) để lưu vào DB, tránh lệch ngày do UTC
        date: selectedDate, // Sử dụng trực tiếp selectedDate đã được định dạng đúng
        estimated_time: formData.estimatedTime,
        status: formData.status,
        completed: formData.status === 'done' // Tự động đánh dấu hoàn thành nếu status là done
      });

      // Gửi email thông báo nếu có cài đặt
      if (emailNotifications?.enabled && emailNotifications.recipients.length > 0) {
        try {
          const project = projects.find(p => p.id === Number.parseInt(formData.projectId));
          await sendTaskCreatedEmail({
            taskTitle: formData.title,
            taskDescription: formData.description,
            projectName: project?.name || "Chưa chọn project",
            priority: formData.priority,
            dueDate: selectedDate,
            assignedTo: "Chưa phân công"
          }, emailNotifications.recipients);
        } catch (emailError) {
          console.error("Error sending task created email:", emailError);
        }
      }      // Reset form
      setFormData({
        title: "",
        description: "",
        projectId: "none",
        priority: "medium",
        estimatedTime: 60,
        status: "todo",
        // date: selectedDate
      });
      
      // Ẩn form sau khi thêm thành công
      setShowAddForm(false);
      
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Lỗi khi lưu task. Vui lòng thử lại.");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const displayProjects = projects || [];

  return (
    <div className="space-y-6">      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("dailyTasks")}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(getLocalDateString(new Date(e.target.value)))}
              className="w-auto"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedDate(getLocalDateString(new Date()))}
            >
              Hôm nay
            </Button>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Hủy' : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {t("addTask")}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Thông báo trạng thái kết nối */}
      {(!projects || projects.length === 0) && (!tasks || tasks.length === 0) ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          ⚠️ Không thể kết nối đến database hoặc chưa có dữ liệu. Vui lòng kiểm tra kết nối database.
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          ✅ Đã kết nối database thành công - {projects?.length || 0} project(s), {tasks?.length || 0} task(s) tổng cộng.          {tasks.filter((task: any) => {
            const taskDate = task.date ? getLocalDateString(new Date(task.date)) : null;
            return taskDate === selectedDate;
          }).length > 0 ? 
            ` Hôm nay có ${tasks.filter((task: any) => {
              const taskDate = task.date ? getLocalDateString(new Date(task.date)) : null;
              return taskDate === selectedDate;
            }).length} task(s).` : 
            " Hôm nay chưa có task nào."}
        </div>
      )}

      {/* Form thêm task mới - chỉ hiển thị khi nhấn nút */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t("addNewTask")}</CardTitle>
            <CardDescription>{t("createTaskForToday")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("taskTitle")}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("enterTaskTitle")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("taskDescription")}
                  rows={3}
                />
              </div>              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">{t("project")}</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectProject")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("noProject")}</SelectItem>
                      {displayProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taskDate">Ngày thực hiện</Label>                  <Input
                    id="taskDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(getLocalDateString(new Date(e.target.value)))}
                    min={getLocalDateString(new Date())}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">{t("priority")}</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("low")}</SelectItem>
                      <SelectItem value="medium">{t("medium")}</SelectItem>
                      <SelectItem value="high">{t("high")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Cần làm</SelectItem>
                      <SelectItem value="in-progress">Đang làm</SelectItem>
                      <SelectItem value="done">Hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">{t("estimatedTime")} (min)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: Number.parseInt(e.target.value) })}
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addTask")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}      {/* Enhanced mobile-responsive Kanban Board */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <MobileKanbanBoard
          columns={[
            {
              id: "todo",
              title: "Cần làm",
              icon: <Inbox className="h-4 w-4 mr-2" />,
              tasks: tasksByStatus.todo,
              bgColor: "bg-slate-50"
            },
            {
              id: "in-progress", 
              title: "Đang làm",
              icon: <Loader className="h-4 w-4 mr-2" />,
              tasks: tasksByStatus["in-progress"],
              bgColor: "bg-blue-50"
            },
            {
              id: "done",
              title: "Hoàn thành", 
              icon: <Check className="h-4 w-4 mr-2" />,
              tasks: tasksByStatus.done,
              bgColor: "bg-green-50"
            }
          ]}
          renderTask={(task) => {
            const taskProjectId = task.projectId || task.project_id?.toString();
            const project = displayProjects.find((p) => p.id == taskProjectId);
            return (
              <DraggableTaskCard 
                key={task.id}
                task={task}
                project={project}
                onToggle={handleToggleTask}
                getPriorityColor={getPriorityColor}
                onViewDetails={handleViewTaskDetails}
              />
            );          }}
        />
      </DndContext>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết Task</DialogTitle>
            <DialogDescription>
              Thông tin đầy đủ về task này
            </DialogDescription>
          </DialogHeader>
          {viewingTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tiêu đề</Label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">{viewingTask.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Độ ưu tiên</Label>
                  <div className="mt-1">
                    <Badge variant={getPriorityColor(viewingTask.priority) as any}>
                      {viewingTask.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Mô tả</Label>
                <p className="mt-1 p-2 bg-gray-50 rounded border min-h-[60px]">
                  {viewingTask.description || "Không có mô tả"}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Project</Label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">
                    {(() => {
                      const taskProjectId = viewingTask.projectId || viewingTask.project_id?.toString();
                      const project = projects.find((p) => p.id == taskProjectId);
                      return project?.name || "Chưa chọn project";
                    })()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Trạng thái</Label>
                  <div className="mt-1">
                    <Badge variant={
                      viewingTask.status === 'done' || viewingTask.completed ? 'default' :
                      viewingTask.status === 'in-progress' ? 'secondary' : 'outline'
                    }>
                      {viewingTask.status === 'done' || viewingTask.completed ? 'Hoàn thành' :
                       viewingTask.status === 'in-progress' ? 'Đang làm' : 'Cần làm'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">                <div>
                  <Label className="text-sm font-medium">Ngày thực hiện</Label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">
                    {viewingTask.date ? getLocalDateString(new Date(viewingTask.date)) : 'Chưa có ngày'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Thời gian dự kiến (phút)</Label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">
                    {viewingTask.estimated_time || viewingTask.estimatedTime || 'Chưa ước tính'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Thời gian thực tế (phút)</Label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">
                    {viewingTask.actual_time || viewingTask.actualTime || 'Chưa hoàn thành'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Ngày tạo</Label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">
                    {viewingTask.created_at ? new Date(viewingTask.created_at).toLocaleString('vi-VN') : 'Không có thông tin'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cập nhật lần cuối</Label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">
                    {viewingTask.updated_at ? new Date(viewingTask.updated_at).toLocaleString('vi-VN') : 'Không có thông tin'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox checked={viewingTask.completed} disabled />
                <Label className="text-sm">
                  {viewingTask.completed ? 'Task đã hoàn thành' : 'Task chưa hoàn thành'}
                </Label>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
