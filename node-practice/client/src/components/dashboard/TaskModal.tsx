"use client";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  Calendar,
  Clock,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Textarea } from "@/ui/textarea";
import { Badge } from "@/ui/badge";
import { Label } from "@/ui/label";
import ReactPaginate from "react-paginate";

const serverUrl = import.meta.env.SERVER_URL || "http://localhost:5000";

// Define the task status type
type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

// Define the priority type
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// Define the Todo type based on the database schema
type Todo = {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
  status: TaskStatus;
  reminder_date?: string;
  created_at: string;
  updated_at: string;
};

export const TaskModal = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // New todo form state
  const [newTodo, setNewTodo] = useState<Partial<Todo>>({
    title: "",
    description: "",
    due_date: "",
    priority: "MEDIUM",
    status: "todo",
    reminder_date: "",
  });

  const resetNewTodo = () => {
    setNewTodo({
      title: "",
      description: "",
      due_date: "",
      priority: "MEDIUM",
      status: "todo",
      reminder_date: "",
    });
  };

  const getTasks = async (page: number = 1, status?: string) => {
    setIsLoading(true);
    try {
      const statusParam = status && status !== "all" ? `&status=${status}` : "";
      const response = await fetch(
        `${serverUrl}/api/tasks/tasks?page=${page}${statusParam}`
      );
      const data = await response.json();
      setTodos(data.tasks);
      setTotalPages(data.totalPages);
      console;
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTasks(currentPage, activeTab);
  }, [currentPage, activeTab]);

  const addTodo = async () => {
    if (!newTodo.title?.trim()) return;

    const now = new Date().toISOString();
    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title.trim(),
      description: newTodo.description,
      due_date: newTodo.due_date,
      priority: newTodo.priority as Priority,
      status: newTodo.status as TaskStatus,
      reminder_date: newTodo.reminder_date,
      created_at: now,
      updated_at: now,
    };

    try {
      const response = await fetch(`${serverUrl}/api/tasks/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      // Refresh the tasks list
      getTasks(currentPage, activeTab);
    } catch (error) {
      console.error("Error adding task:", error);
    }

    resetNewTodo();
    setIsAddDialogOpen(false);
  };

  const updateTodo = async (updatedTodo: Todo) => {
    try {
      const response = await fetch(
        `${serverUrl}/api/tasks/update/${updatedTodo.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTodo),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      // Refresh the tasks list
      getTasks(currentPage, activeTab);
    } catch (error) {
      console.error("Error updating task:", error);
    }

    setIsEditDialogOpen(false);
    setCurrentTodo(null);
  };

  const updateStatus = async (id: string, status: TaskStatus) => {
    try {
      const response = await fetch(`${serverUrl}/api/tasks/status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Refresh the tasks list
      getTasks(currentPage, activeTab);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`${serverUrl}/api/tasks/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      // Refresh the tasks list
      getTasks(currentPage, activeTab);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const openEditDialog = (todo: Todo) => {
    setCurrentTodo(todo);
    setIsEditDialogOpen(true);
  };

  const filteredTodos = todos.filter((todo) => {
    if (activeTab === "todo") return todo.status === "todo";
    if (activeTab === "in-progress") return todo.status === "in_progress";
    if (activeTab === "blocked") return todo.status === "blocked";
    if (activeTab === "done") return todo.status === "done";
    return true;
  });

  const pendingTodosCount = todos.filter(
    (todo) => todo.status !== "done"
  ).length;

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Task Manager</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Task title"
                  value={newTodo.title || ""}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Task description"
                  value={newTodo.description || ""}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={newTodo.due_date || ""}
                    onChange={(e) =>
                      setNewTodo({ ...newTodo, due_date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reminder_date">Reminder Date</Label>
                  <Input
                    id="reminder_date"
                    type="datetime-local"
                    value={newTodo.reminder_date || ""}
                    onChange={(e) =>
                      setNewTodo({ ...newTodo, reminder_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTodo.priority || "MEDIUM"}
                    onValueChange={(value) =>
                      setNewTodo({ ...newTodo, priority: value as Priority })
                    }
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newTodo.status || "todo"}
                    onValueChange={(value) =>
                      setNewTodo({ ...newTodo, status: value as TaskStatus })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={addTodo}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs
          defaultValue="all"
          onValueChange={(value) => {
            setActiveTab(value);
            setCurrentPage(1); // Reset to first page when changing tabs
          }}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="todo">To Do</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="blocked">Blocked</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <TodoList
              todos={todos}
              updateStatus={updateStatus}
              deleteTodo={deleteTodo}
              editTodo={openEditDialog}
              isLoading={isLoading}
            />
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="todo" className="mt-4">
            <TodoList
              todos={todos}
              updateStatus={updateStatus}
              deleteTodo={deleteTodo}
              editTodo={openEditDialog}
              isLoading={isLoading}
            />
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="in-progress" className="mt-4">
            <TodoList
              todos={todos}
              updateStatus={updateStatus}
              deleteTodo={deleteTodo}
              editTodo={openEditDialog}
              isLoading={isLoading}
            />
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="blocked" className="mt-4">
            <TodoList
              todos={todos}
              updateStatus={updateStatus}
              deleteTodo={deleteTodo}
              editTodo={openEditDialog}
              isLoading={isLoading}
            />
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="done" className="mt-4">
            <TodoList
              todos={todos}
              updateStatus={updateStatus}
              deleteTodo={deleteTodo}
              editTodo={openEditDialog}
              isLoading={isLoading}
            />
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <p className="text-sm text-muted-foreground">
          {pendingTodosCount} tasks pending
        </p>
      </CardFooter>

      {/* Edit Task Dialog */}
      {currentTodo && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Task title"
                  value={currentTodo.title}
                  onChange={(e) =>
                    setCurrentTodo({ ...currentTodo, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Task description"
                  value={currentTodo.description || ""}
                  onChange={(e) =>
                    setCurrentTodo({
                      ...currentTodo,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-due_date">Due Date</Label>
                  <Input
                    id="edit-due_date"
                    type="datetime-local"
                    value={currentTodo.due_date || ""}
                    onChange={(e) =>
                      setCurrentTodo({
                        ...currentTodo,
                        due_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-reminder_date">Reminder Date</Label>
                  <Input
                    id="edit-reminder_date"
                    type="datetime-local"
                    value={currentTodo.reminder_date || ""}
                    onChange={(e) =>
                      setCurrentTodo({
                        ...currentTodo,
                        reminder_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={currentTodo.priority || "MEDIUM"}
                    onValueChange={(value) =>
                      setCurrentTodo({
                        ...currentTodo,
                        priority: value as Priority,
                      })
                    }
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={currentTodo.status}
                    onValueChange={(value) =>
                      setCurrentTodo({
                        ...currentTodo,
                        status: value as TaskStatus,
                      })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => currentTodo && updateTodo(currentTodo)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

type TodoListProps = {
  todos: Todo[];
  updateStatus: (id: string, status: TaskStatus) => void;
  deleteTodo: (id: string) => void;
  editTodo: (todo: Todo) => void;
};

function TodoList({
  todos,
  updateStatus,
  deleteTodo,
  editTodo,
  isLoading,
}: TodoListProps & { isLoading: boolean }) {
  if (isLoading) {
    return (
      <p className="text-center text-muted-foreground py-4">Loading tasks...</p>
    );
  }

  if (todos.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">No tasks found</p>
    );
  }

  const getPriorityColor = (priority?: Priority) => {
    switch (priority) {
      case "LOW":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "MEDIUM":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "URGENT":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "bg-slate-100 text-slate-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      case "done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return null;
      return format(date, "MMM d, yyyy h:mm a");
    } catch (error) {
      return null;
    }
  };

  return (
    <ul className="space-y-3">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="rounded-md border bg-card hover:bg-accent/5 transition-colors"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3
                  className={`font-medium ${
                    todo.status === "done"
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {todo.title}
                </h3>
                {todo.priority && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${getPriorityColor(todo.priority)}`}
                  >
                    {todo.priority.toLowerCase()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={getStatusColor(todo.status)}
                >
                  {todo.status.replace("_", " ")}
                </Badge>
                <Select
                  value={todo.status}
                  onValueChange={(value) =>
                    updateStatus(todo.id, value as TaskStatus)
                  }
                >
                  <SelectTrigger className="h-8 w-8 p-0 border-none">
                    <ChevronDown className="h-4 w-4" />
                    <span className="sr-only">Change status</span>
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {todo.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {todo.description}
              </p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {todo.due_date && formatDate(todo.due_date) && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Due: {formatDate(todo.due_date)}</span>
                </div>
              )}

              {todo.reminder_date && formatDate(todo.reminder_date) && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Reminder: {formatDate(todo.reminder_date)}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <span>Created: {formatDate(todo.created_at)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <Button variant="ghost" size="sm" onClick={() => editTodo(todo)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTodo(todo.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
