import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { createMembership, getCurrentMembership } from '../controllers/membershipController.js';

const router = express.Router();

router.post('/', authMiddleware, createMembership);
router.get('/current', authMiddleware, getCurrentMembership);

export default router;