import { Request, Response } from "express";
import { Task } from "../models/Task.js";

export const getTasks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const status = req.query.status as string | undefined;

    const tasks = await Task.getTasks(page, pageSize, status);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, due_date, priority, status, reminder_date } =
      req.body;

    // Convert string dates to Date objects if they exist
    const formattedDueDate = due_date ? new Date(due_date) : null;
    const formattedReminderDate = reminder_date
      ? new Date(reminder_date)
      : null;

    if (formattedDueDate && isNaN(formattedDueDate.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format for due date" });
    }

    if (formattedReminderDate && isNaN(formattedReminderDate.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format for reminder date" });
    }

    const newTask = await Task.create(
      title,
      description,
      formattedDueDate,
      priority,
      status,
      formattedReminderDate
    );

    res.status(201).json(newTask);
  } catch (error) {
    console.log("Task creation error", error);
    res.status(500).json({ message: "Task could not be created" });
  }
};

const validateDate = (date: Date) => {
  return date instanceof Date;
};
