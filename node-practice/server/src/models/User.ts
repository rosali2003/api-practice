import pool from '../db/index.js';
import bcrypt from 'bcrypt';

export interface IUser {
  id?: number;
  username: string;
  password: string;
  email: string;
  created_at?: Date;
}

export class User {
  static async findByUsername(username: string) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  private static validateUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 30;
  }

  private static validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  private static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static async create(username: string, password: string, email: string) {
    // Validate input
    if (!this.validateUsername(username)) {
      throw new Error('Username must be between 3 and 30 characters');
    }
    if (!this.validatePassword(password)) {
      throw new Error('Password must be at least 6 characters long');
    }
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email address');
    }

    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (username, password, email, created_at) 
      VALUES ($1, $2, $3, NOW()) 
      RETURNING id, username, email, created_at
    `;
    
    const result = await pool.query(query, [username, hashedPassword, email]);
    return result.rows[0];
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
} 