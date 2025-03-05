import pool from "../db/index.js";

export interface ITask {
  title: string;
  description: string;
  due_date: Date | null;
  priority: string;
  status: string;
  reminder_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface PaginatedTasks {
  tasks: ITask[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class Task {
  private static validateStatus(status: string) {
    const statusTypes = ["todo", "in_progress", "blocked", "done"];
    return statusTypes.includes(status);
  }

  private static validateDate(date: Date | null) {
    if (date === null) return true;
    return date instanceof Date && !isNaN(date.getTime());
  }

  static async getTasks(
    page: number = 1,
    pageSize: number = 10,
    status?: string
  ): Promise<PaginatedTasks> {
    const offset = (page - 1) * pageSize;

    // Build the WHERE clause based on status filter
    const whereClause = status ? "WHERE status = $3" : "";

    // Count total tasks
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tasks
      ${whereClause}
    `;

    // Get paginated tasks
    const tasksQuery = `
      SELECT *
      FROM tasks
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countParams = status ? [status] : [];
    const tasksParams = status
      ? [pageSize, offset, status]
      : [pageSize, offset];

    const [countResult, tasksResult] = await Promise.all([
      pool.query(countQuery, countParams),
      pool.query(tasksQuery, tasksParams),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / pageSize);

    return {
      tasks: tasksResult.rows,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  static async create(
    title: string,
    description: string,
    due_date: Date | null,
    priority: string,
    status: string,
    reminder_date: Date | null
  ) {
    if (!this.validateStatus(status)) {
      throw new Error("Invalid status");
    }

    if (!this.validateDate(due_date)) {
      throw new Error("Invalid due date");
    }

    if (!this.validateDate(reminder_date)) {
      throw new Error("Invalid reminder date");
    }

    const query = `
      INSERT INTO tasks (title, description, due_date, priority, status, reminder_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      title,
      description,
      due_date,
      priority,
      status,
      reminder_date,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}
