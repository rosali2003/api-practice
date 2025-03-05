import express from "express";
import { createTask, getTasks } from "../controllers/taskController.js";

export const taskRouter = express.Router();

taskRouter.get("/tasks", (req, res) => {
  getTasks(req, res);
});

taskRouter.post("/tasks", (req, res) => {
  createTask(req, res);
});
