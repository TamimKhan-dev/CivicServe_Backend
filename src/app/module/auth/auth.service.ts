import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import type { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { createUserTokens } from "../../helpers/authTokens";
import { prisma } from "../../lib/prisma";
import { redisClient } from "../../lib/redis";
import { AppError } from "../../utils/AppError";
import { jwtUtils } from "../../utils/jwt";
import type {
	UserEmailVerifyPayload,
	UserRegistrationPayload,
} from "./auth.interface";

const registerUser = async (payload: UserRegistrationPayload) => {
	const { email, password, name, phone } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (isUserExist) {
		throw new AppError(
			httpStatus.CONFLICT,
			"User with this email already Exists!",
		);
	}

	const hashedPassword = await bcrypt.hash(
		password,
		Number(config.bcrypt_salt_rounds),
	);

	await prisma.user.create({
		data: {
			name,
			password: hashedPassword,
			email,
			phone,
		},
	});

	const expirationValue = 60 * 5;
	const otp = crypto.randomInt(100000, 1000000).toString();
	const key = `verify-email-otp:${email}`;

	await redisClient.set(key, otp, { ex: expirationValue });
};

const verifyEmail = async (payload: UserEmailVerifyPayload) => {
	const { otp, email } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: { email },
	});

	if (!isUserExist) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found!");
	}

	if (isUserExist.status === "SUSPENDED") {
		throw new AppError(httpStatus.BAD_REQUEST, "User is Suspended");
	}

	if (isUserExist.emailVerified) {
		throw new AppError(httpStatus.BAD_REQUEST, "Email ALready Verified");
	}

	if (isUserExist.deletedAt) {
		throw new AppError(httpStatus.BAD_REQUEST, "User is Deleted");
	}

	const otpKey = `verify-email-otp:${email}`;

	const redisOtp = await redisClient.get(otpKey);

	if (!redisOtp) {
		throw new AppError(httpStatus.NOT_FOUND, "Invalid OTP");
	}

	if (redisOtp.toString() !== otp.toString()) {
		throw new AppError(httpStatus.BAD_REQUEST, "OTP Does Not Match");
	}

	await redisClient.del(otpKey);

	await prisma.user.update({ where: { email }, data: { emailVerified: true } });
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new Error(
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!user || user.deletedAt || user.status === "SUSPENDED") {
		throw new AppError(httpStatus.BAD_REQUEST, "User is inactive or not found");
	}

	const userTokens = createUserTokens({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	});

	return userTokens;
};

const getMe = async (userId: string) => {
	const isUserExist = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		omit: { password: true },
	});

	if (!isUserExist) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found!");
	}

	return isUserExist;
};

export const AuthService = {
	getMe,
	verifyEmail,
	registerUser,
	refreshToken,
};
