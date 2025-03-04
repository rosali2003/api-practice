import pool from "../db/index.js";

export interface ITask {
  title: string;
  description: string;
  due_date: Date;
  priority: string;
  status: string;
  reminder_date: Date;
  created_at: Date;
  updated_at: Date;
}

export class Task {
  private static validateStatus(status: string) {
    const statusTypes = ["triage", "in_progress", "blocked", "done"];
    return statusTypes.includes(status);
  }

  private static validateDate(date: Date) {
    return date instanceof Date;
  }
  static async create(
    title: string,
    description: string,
    due_date: Date,
    priority: string,
    status: string,
    reminder_date: Date
  ) {
    if (!this.validateStatus(status)) {
      throw new Error(
        "Status must be one of: triage, in_progress, blocked, or done"
      );
    }

    if (!this.validateDate(due_date)) {
      throw new Error("Due date must be a Date")
    }

    if (!this.validateDate(reminder_date)) {
      throw new Error("Reminder date must be a Date")
    }

    const query = `
      INSERT INTO users (title, description, due_date, priority, status, reminder_date, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
      RETURNING id, created_at
    `;

    const result = await pool.query(query, [title, description, due_date, priority, status, reminder_date]);
    return result.rows[0];
  }
}
