import { Request, Response } from 'express';
import { User } from '../models/User.js';

// Extend express session types
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    email: string;
  }
}

export const userLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Set up session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.email = user.email;
    // Send response (exclude password)
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const userRegister = async (req: Request, res: Response) => {    
  try {
    const { username, password, email } = req.body;

    // Check if username already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user
    const newUser = await User.create(username, password, email);

    // Set up session
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    req.session.email = newUser.email;
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add other auth-related controller methods here
export const userLogout = async (req: Request, res: Response) => {
  req.session.destroy((err: Error | null) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};