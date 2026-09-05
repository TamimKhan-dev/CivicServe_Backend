import { Router } from "express";
import passport from "passport";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
	"/register",
	validateRequest(AuthValidation.UserRegistrationZodSchema),
	AuthController.registerUser,
);

// Credential Login
router.post(
	"/credential-login",
	validateRequest(AuthValidation.UserCredentialLoginZodSchema),
	AuthController.credentialLogin,
);

//Google Login
router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get("/google/callback", AuthController.googleLoginCallback);

router.post("/logout", AuthController.logout);

router.post(
	"/verify-email",
	validateRequest(AuthValidation.UserEmailVerifyZodSchema),
	AuthController.verifyEmail,
);
router.post("/refresh-token", AuthController.refreshToken);

router.get(
	"/get-me",
	auth(Role.ADMIN, Role.CITIZEN, Role.STAFF),
	AuthController.getMe,
);

export const AuthRoutes = router;
