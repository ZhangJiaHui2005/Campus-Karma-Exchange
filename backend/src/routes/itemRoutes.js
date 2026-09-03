import express from 'express';
import {
  createItem,
  deleteItem,
  getItemById,
  getItems,
  getMyItems,
  updateItem,
} from '../controllers/itemController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getItems);
router.get('/my', authMiddleware, getMyItems);   // Phải trước /:id để không bị match nhầm
router.get('/:id', getItemById);
router.post('/', authMiddleware, createItem);
router.patch('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

export default router;
