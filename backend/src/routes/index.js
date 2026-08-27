import express from 'express';
import { checkDbConnection } from '../controllers/healthController.js';
import paymentRoutes from './paymentRoutes.js';
import membershipRoutes from './membershipRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

router.get('/db', checkDbConnection);
router.use('/payments', paymentRoutes);
router.use('/memberships', membershipRoutes);

export default router;