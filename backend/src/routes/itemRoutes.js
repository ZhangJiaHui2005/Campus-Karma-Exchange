import express from 'express';
import {
  createItem,
  deleteItem,
  getItemById,
  getItems,
  getMyItems,
  uploadItemImage,
  updateItem,
} from '../controllers/itemController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { itemImageUpload } from '../middlewares/itemImageUpload.js';

const router = express.Router();

router.get('/', getItems);
router.get('/mine', authMiddleware, getMyItems);
router.get('/:id', getItemById);
router.post('/upload', authMiddleware, (req, res, next) => {
  itemImageUpload.single('image')(req, res, (error) => {
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return next();
  });
}, uploadItemImage);
router.post('/', authMiddleware, createItem);
router.patch('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

export default router;
