import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { userLogin, userLogout, userRegister } from '../controllers/authController.js';
import { loginLimiter } from "../middleware/rateLimiter.js";

export const authRouter = express.Router();

authRouter.post('/register', (req, res) => {
  userRegister(req, res);
});

authRouter.post('/login', loginLimiter, (req, res) => {
  userLogin(req, res);
});

authRouter.post('/logout', (req, res) => {
  userLogout(req, res);
});