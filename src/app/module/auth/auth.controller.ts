import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import passport from "passport";
import config from "../../config";
import { clearAuthCookie, setAuthCookie } from "../../helpers/authCookie";
import { createUserTokens } from "../../helpers/authTokens";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    await AuthService.registerUser(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "OTP sent to your Email(Redis)!",
      data: null,
    });
  },
);

const credentialLogin = catchAsync(
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      try {
        if (err) {
          return next(new AppError(httpStatus.INTERNAL_SERVER_ERROR, err?.message || "Something went wrong!"));
        }

        if (!user) {
          return next(new AppError(httpStatus.NOT_FOUND, info?.message || "Invalid Credential!"));
        }

        const userTokens = createUserTokens({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });

        setAuthCookie(res, userTokens);

        const { password, ...restUserInfo } = user;

        sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "login successful",
          data: {
            accessToken: userTokens.accessToken,
            refreshToken: userTokens.refreshToken,
            restUserInfo,
          },
        });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  },
);

const googleLoginCallback = catchAsync(
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", (err: any, user: any, info: any) => {
      try {
        if (err) {
          return next(
            new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              err?.message || "Google Authentication failed",
            ),
          );
        }

        if (!user) {
          return next(
            new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              info?.message || "Google Authentication failed",
            ),
          );
        }

        const userTokens = createUserTokens({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });

        setAuthCookie(res, userTokens);

        res.redirect(`${config.frontend_url}/login?success=true`);
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  },
);

const verifyEmail = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    await AuthService.verifyEmail(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Email Verified Successfully!",
      data: null,
    });
    },
);

const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies.refreshToken) {
    throw new AppError(httpStatus.NOT_FOUND, "Refresh token is missing");
  }
  const result = await AuthService.refreshToken(req.cookies.refreshToken);

  setAuthCookie(res, result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New tokens generated successfully",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  clearAuthCookie(res)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "You have been logout Successfully!",
    data: null,
  });
});

export const AuthController = {
  logout,
  verifyEmail,
  registerUser,
  refreshToken,
  credentialLogin,
  googleLoginCallback,
};
