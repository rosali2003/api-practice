import express from "express";
import { createTask } from "../controllers/taskController";

export const taskRouter = express.Router();

taskRouter.post("/create", (req, res) => {
  createTask(req, res);
});
