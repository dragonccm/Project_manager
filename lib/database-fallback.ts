// Fallback functions for when database is not available
export function createLocalStorageOperations() {
  // Projects
  const getProjectsLocal = () => {
    const saved = localStorage.getItem("projects")
    return saved ? JSON.parse(saved) : []
  }

  const createProjectLocal = (projectData: any) => {
    const projects = getProjectsLocal()
    const newProject = {
      id: Date.now(),
      ...projectData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [newProject, ...projects]
    localStorage.setItem("projects", JSON.stringify(updated))
    return newProject
  }

  const updateProjectLocal = (id: string, projectData: any) => {
    const projects = getProjectsLocal()
    const updated = projects.map((p: any) =>
      p.id == id ? { ...p, ...projectData, updated_at: new Date().toISOString() } : p,
    )
    localStorage.setItem("projects", JSON.stringify(updated))
    return updated.find((p: any) => p.id == id)
  }

  const deleteProjectLocal = (id: string) => {
    const projects = getProjectsLocal()
    const updated = projects.filter((p: any) => p.id != id)
    localStorage.setItem("projects", JSON.stringify(updated))
    return true
  }

  // Accounts
  const getAccountsLocal = () => {
    const saved = localStorage.getItem("accounts")
    return saved ? JSON.parse(saved) : []
  }

  const createAccountLocal = (accountData: any) => {
    const accounts = getAccountsLocal()
    const newAccount = {
      id: Date.now(),
      ...accountData,
      // Convert project_id to projectId for component compatibility
      projectId: accountData.project_id?.toString() || "1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [newAccount, ...accounts]
    localStorage.setItem("accounts", JSON.stringify(updated))
    return newAccount
  }

  const deleteAccountLocal = (id: string) => {
    const accounts = getAccountsLocal()
    const updated = accounts.filter((a: any) => a.id != id)
    localStorage.setItem("accounts", JSON.stringify(updated))
    return true
  }

  // Tasks
  const getTasksLocal = () => {
    const saved = localStorage.getItem("tasks")
    return saved ? JSON.parse(saved) : []
  }

  const createTaskLocal = (taskData: any) => {
    const tasks = getTasksLocal()
    const newTask = {
      id: Date.now(),
      ...taskData,
      // Convert project_id to projectId for component compatibility  
      projectId: taskData.project_id?.toString() || null,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [newTask, ...tasks]
    localStorage.setItem("tasks", JSON.stringify(updated))
    return newTask
  }

  const updateTaskLocal = (id: string, taskData: any) => {
    const tasks = getTasksLocal()
    const updated = tasks.map((t: any) =>
      t.id == id ? { ...t, ...taskData, updated_at: new Date().toISOString() } : t,
    )
    localStorage.setItem("tasks", JSON.stringify(updated))
    return updated.find((t: any) => t.id == id)
  }

  const deleteTaskLocal = (id: string) => {
    const tasks = getTasksLocal()
    const updated = tasks.filter((t: any) => t.id != id)
    localStorage.setItem("tasks", JSON.stringify(updated))
    return true
  }

  const toggleTaskLocal = (id: string) => {
    const tasks = getTasksLocal()
    const updated = tasks.map((t: any) =>
      t.id == id ? { ...t, completed: !t.completed, updated_at: new Date().toISOString() } : t,
    )
    localStorage.setItem("tasks", JSON.stringify(updated))
    return updated.find((t: any) => t.id == id)
  }

  // Templates
  const getEmailTemplatesLocal = () => {
    const saved = localStorage.getItem("emailTemplates")
    return saved ? JSON.parse(saved) : []
  }

  const createEmailTemplateLocal = (templateData: any) => {
    const templates = getEmailTemplatesLocal()
    const newTemplate = {
      id: Date.now().toString(),
      ...templateData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [newTemplate, ...templates]
    localStorage.setItem("emailTemplates", JSON.stringify(updated))
    return newTemplate
  }

  const deleteEmailTemplateLocal = (id: string) => {
    const templates = getEmailTemplatesLocal()
    const updated = templates.filter((t: any) => t.id !== id)
    localStorage.setItem("emailTemplates", JSON.stringify(updated))
    return true
  }

  // Code Components
  const getCodeComponentsLocal = () => {
    const saved = localStorage.getItem("codeComponents")
    return saved ? JSON.parse(saved) : []
  }

  const createCodeComponentLocal = (componentData: any) => {
    const components = getCodeComponentsLocal()
    const newComponent = {
      id: Date.now(),
      ...componentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [newComponent, ...components]
    localStorage.setItem("codeComponents", JSON.stringify(updated))
    return newComponent
  }

  const updateCodeComponentLocal = (id: string, componentData: any) => {
    const components = getCodeComponentsLocal()
    const updated = components.map((c: any) =>
      c.id == id ? { ...c, ...componentData, updated_at: new Date().toISOString() } : c,
    )
    localStorage.setItem("codeComponents", JSON.stringify(updated))
    return updated.find((c: any) => c.id == id)
  }

  const deleteCodeComponentLocal = (id: string) => {
    const components = getCodeComponentsLocal()
    const updated = components.filter((c: any) => c.id != id)
    localStorage.setItem("codeComponents", JSON.stringify(updated))
    return true
  }

  return {
    // Projects
    getProjects: getProjectsLocal,
    createProject: createProjectLocal,
    updateProject: updateProjectLocal,
    deleteProject: deleteProjectLocal,

    // Accounts
    getAccounts: getAccountsLocal,
    createAccount: createAccountLocal,
    deleteAccount: deleteAccountLocal,

    // Tasks
    getTasks: getTasksLocal,
    createTask: createTaskLocal,
    updateTask: updateTaskLocal,
    deleteTask: deleteTaskLocal,
    toggleTask: toggleTaskLocal,

    // Templates
    getEmailTemplates: getEmailTemplatesLocal,
    createEmailTemplate: createEmailTemplateLocal,
    deleteEmailTemplate: deleteEmailTemplateLocal,

    // Code Components
    getCodeComponents: getCodeComponentsLocal,
    createCodeComponent: createCodeComponentLocal,
    updateCodeComponent: updateCodeComponentLocal,
    deleteCodeComponent: deleteCodeComponentLocal,
  }
}
