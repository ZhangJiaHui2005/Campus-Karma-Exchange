import express from 'express';
import { googleLogin, logout, me } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/google-login', googleLogin);
router.post('/logout', logout);
router.get('/me', authMiddleware, me); // Middleware backend kiểm tra HttpOnly Cookie

export default router;
