import { Router } from "express";
import passport from "passport";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post("/register", validateRequest(AuthValidation.UserRegistrationZodSchema),AuthController.registerUser);

// Credential Login
router.post("/credential-login", validateRequest(AuthValidation.UserCredentialLoginZodSchema), AuthController.credentialLogin);

//Google Login
router.get("/google", passport.authenticate("google", { scope: ['profile', 'email'] }));
router.get("/google/callback", AuthController.googleLoginCallback);

router.post("/verify-email", validateRequest(AuthValidation.UserEmailVerifyZodSchema), AuthController.verifyEmail);

export const AuthRoutes = router;