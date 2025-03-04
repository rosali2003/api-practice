import { Request, Response } from "express";
import { Task } from "../models/Task";

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, due_date, priority, status, reminder_date } =
      req.body;
    if (
      !validateDate(due_date) &&
      due_date !== null &&
      due_date !== undefined
    ) {
      throw new Error("Invalid date format for due date");
    }

    if (
      !validateDate(reminder_date) &&
      reminder_date != null &&
      reminder_date != undefined
    ) {
      throw new Error("Invalid date format for reminder date");
    }
    const newTask = await Task.create(
      title,
      description,
      due_date,
      priority,
      status,
      reminder_date
    );
  } catch (error) {
    console.log("Task creation error", error);
    res.status(500).json({ message: "Task could not be created" });
  }
};

const validateDate = (date: Date) => {
  return date instanceof Date;
};
