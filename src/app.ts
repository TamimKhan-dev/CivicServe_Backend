import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import httpStatus from "http-status";
import passport from "passport";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";
import "./app/config/passport";
import { CategoryRoutes } from "./app/module/category/category.route";
import { DepartmentRoutes } from "./app/module/department/department.route";
import { RequestRoutes } from "./app/module/request/request.route";
import { ServiceRoutes } from "./app/module/service/service.route";
import { StaffApplicationRoutes } from "./app/module/staffApplication/staffApplication.route";
import { UserRoutes } from "./app/module/user/user.route";

const app: Application = express();

app.use(cors({ origin: config.frontend_url, credentials: true }));
app.use(helmet());
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 100,
		standardHeaders: true,
		legacyHeaders: false,
	}),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/request", RequestRoutes);
app.use("/api/v1/service", ServiceRoutes);
app.use("/api/v1/category", CategoryRoutes);
app.use("/api/v1/department", DepartmentRoutes);
app.use("/api/v1/staff-application", StaffApplicationRoutes);

app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: `CivicServe server is running on Port: ${config.port}`,
		author: "Tamim Khan",
		project: "CivicServe",
	});
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
