import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { UserController } from "./user.controller";

const router = Router();

router.get("/staffs", auth(Role.ADMIN), UserController.getAllStaffs);

export const UserRoutes = router;