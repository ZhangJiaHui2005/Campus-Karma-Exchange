import express from "express";
import multer from "multer";
import {
  createItem,
  deleteItem,
  getItemById,
  getItems,
  getMyItems,
  updateItem,
} from "../controllers/itemController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  },
});

router.get("/", getItems);
router.get("/my", authMiddleware, getMyItems); // Phải trước /:id để không bị match nhầm
router.get("/:id", getItemById);
router.post("/", authMiddleware, upload.single("image"), createItem);
router.patch("/:id", authMiddleware, updateItem);
router.delete("/:id", authMiddleware, deleteItem);

export default router;
