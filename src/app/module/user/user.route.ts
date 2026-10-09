import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserController } from "./user.controller";
import { ProfileUpdateZodSchema } from "./user.validation";

const router = Router();

router.get("/staffs", auth(Role.ADMIN), UserController.getAllStaffs);
router.delete("/:userId", auth(Role.ADMIN), UserController.softDeleteUser);
router.patch(
	"/update-user/:userId",
	auth(Role.ADMIN, Role.CITIZEN, Role.STAFF),
	upload.single("image"),
	validateRequest(ProfileUpdateZodSchema),
	UserController.updateUserProfile,
);

export const UserRoutes = router;
