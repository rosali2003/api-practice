import {Request, Response} from 'express';

export const requireAuth = (req: Request, res: Response, next: () => void) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};