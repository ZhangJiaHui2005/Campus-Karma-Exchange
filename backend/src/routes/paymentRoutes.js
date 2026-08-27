import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  createKarmaTopup,
  handlePayOSWebhook,
  confirmKarmaTopup,
} from '../controllers/paymentController.js';
import { getPaymentHistory } from '../controllers/walletController.js';

const router = express.Router();

router.get('/history', authMiddleware, getPaymentHistory);
router.post('/karma-topup', authMiddleware, createKarmaTopup);
router.post('/karma-topup/confirm', authMiddleware, confirmKarmaTopup);
router.post('/payos/webhook', handlePayOSWebhook);

export default router;