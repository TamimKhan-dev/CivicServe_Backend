import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { StatsController } from "./stats.controller";

const router = Router();

router.get("/citizen-stats", auth(Role.CITIZEN), StatsController.citizenStats);
router.get("/admin-stats", auth(Role.ADMIN), StatsController.adminStats);
router.get("/staff-stats", auth(Role.STAFF), StatsController.staffStats);

export const StatsRoutes = router;
