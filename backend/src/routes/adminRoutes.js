import express from 'express';
import {
  adminLogin,
  createAdminAccount,
  adminLogout,
  getAdminMe,
} from '../controllers/adminController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/create', createAdminAccount);
router.post('/logout', adminLogout);
router.get('/me', adminMiddleware, getAdminMe);

export default router;
