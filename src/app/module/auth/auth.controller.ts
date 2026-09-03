import type { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status';
import passport from "passport";
import config from "../../config";
import { setAuthCookie } from "../../helpers/authCookie";
import { createUserTokens } from "../../helpers/authTokens";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const result = await AuthService.registerUser(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Registered Successfully!",
        data: result,
    });
});

const credentialLogin = catchAsync((req: Request, res: Response, next: NextFunction) => {

});

const googleLoginCallback = catchAsync((req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", (err: any, user: any, info: any) => {
        try {
            if (err) {
                return next(
                    new AppError(httpStatus.INTERNAL_SERVER_ERROR, err?.message || "Google Authentication failed")
                )
            }

            if (!user) {
                return next(
                    new AppError(httpStatus.INTERNAL_SERVER_ERROR, err?.message || "Google Authentication failed")
                )
            };

            const userTokens = createUserTokens(user);

            setAuthCookie(res, userTokens)

            res.redirect(`${config.frontend_url}/login?success=true`)
        } catch (error) {
            next(error)
        }
    })(req, res, next)
});

export const AuthController = {
  registerUser,
  credentialLogin,
  googleLoginCallback,
};
