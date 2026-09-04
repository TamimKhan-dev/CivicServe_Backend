import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";

const router = Router();

router.post(
  "/create-category",
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.CategoryCreationZodSchema),
  CategoryController.createCategory,
);

router.get("/all-categories", CategoryController.getAllCategories);

export const CategoryRoutes = router;
