
import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  uppdateCategory,
} from "../controllers/categories.controller.js";

const router = express.Router();

router.post("/", createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategory);
router.put("/:id", uppdateCategory);
router.delete("/:id", deleteCategory);

export default router;

