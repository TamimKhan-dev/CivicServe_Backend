import bcrypt from "bcryptjs";
import crypto from "crypto";
import httpStatus from "http-status";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { redisClient } from "../../lib/redis";
import { AppError } from "../../utils/AppError";
import type { UserEmailVerifyPayload, UserRegistrationPayload } from "./auth.interface";

const registerUser = async (payload: UserRegistrationPayload) => {
    const { email, password, name, phone } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (isUserExist) {
        throw new AppError(httpStatus.CONFLICT, "User with this email already Exists!");
    };

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    await prisma.user.create({
        data: {
            name,
            password: hashedPassword,
            email,
            phone
        }
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
        throw new AppError(httpStatus.NOT_FOUND, "User not found!")
    };

	if (isUserExist.status === "SUSPENDED") {
		throw new AppError(httpStatus.BAD_REQUEST, "User is Suspended")
	}

	if (isUserExist.emailVerified) {
		throw new AppError(httpStatus.BAD_REQUEST, "Email ALready Verified")
	}

	if (isUserExist.deletedAt) {
		throw new AppError(httpStatus.BAD_REQUEST, "User is Deleted")
	}

	const otpKey = `verify-email-otp:${email}`

	const redisOtp = await redisClient.get(otpKey);

	if (!redisOtp) {
		throw new AppError(httpStatus.NOT_FOUND, "Invalid OTP");
	}

	if (redisOtp.toString() !== otp.toString()) {
		throw new AppError(httpStatus.BAD_REQUEST, "OTP Does Not Match")
	}

	await redisClient.del(otpKey)

    await prisma.user.update({ where: { email}, data: { emailVerified: true } });
};

export const AuthService = {
    verifyEmail,
    registerUser,
};