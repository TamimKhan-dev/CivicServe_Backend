import { Router } from "express";
import passport from "passport";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post("/register", validateRequest(AuthValidation.UserRegistrationZodSchema),AuthController.registerUser);

//Google Login
router.get("/google", passport.authenticate("google", { scope: ['profile', 'email'] }));
router.get("/google/callback", AuthController.googleLoginCallback);

export const AuthRoutes = router;