import express from 'express';
import { checkDbConnection } from '../controllers/healthController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

router.get('/db', checkDbConnection);

export default router;