import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { UploadApiResponse } from "cloudinary";
import ejs from "ejs";
import httpStatus from "http-status";
import type { JwtPayload } from "jsonwebtoken";
import path from "path";
import config from "../../config";
import { createUserTokens } from "../../helpers/authTokens";
import { cloudinary } from "../../lib/cloudinary";
import { transporter } from "../../lib/nodemailer";
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

	const newUserPayloadKey = `new-user-payload-key:${email}`;
	const newUserPayloadData = {
		name,
		email,
		phone,
		password: hashedPassword,
	};

	const expirationValue = 60 * 5;
	const otp = crypto.randomInt(100000, 1000000).toString();
	const key = `verify-email-otp:${email}`;

	if (config.node_env === "development") {
		console.log(`[dev] OTP ${email} : ${otp}`);
	}

	await redisClient.set(newUserPayloadKey, newUserPayloadData, {
		ex: expirationValue,
	});
	await redisClient.set(key, otp, { ex: expirationValue });

	const templatePath = path.join(
		process.cwd(),
		"src/app/templates/registration-user-otp.ejs",
	);

	const templateData = {
		name,
		otp,
		expiresIn: 5,
		year: new Date().getFullYear(),
	};

	const html = await ejs.renderFile(templatePath, templateData);

	await transporter.sendMail({
		from: config.sender_email,
		to: email,
		subject: "Email Verification!",
		html,
	});
};

const verifyEmail = async (payload: UserEmailVerifyPayload) => {
	const { otp, email } = payload;

	const otpKey = `verify-email-otp:${email}`;
	const newUserPayloadKey = `new-user-payload-key:${email}`;

	const redisOtp = await redisClient.get(otpKey);

	if (!redisOtp) {
		throw new AppError(httpStatus.NOT_FOUND, "Invalid OTP");
	}

	if (redisOtp.toString() !== otp.toString()) {
		throw new AppError(httpStatus.BAD_REQUEST, "OTP Does Not Match");
	}

	const userPayload: UserRegistrationPayload | null =
		await redisClient.get(newUserPayloadKey);

	if (!userPayload) {
		throw new AppError(httpStatus.NOT_FOUND, "Cannot found the user!");
	}

	const newUser: UserRegistrationPayload = userPayload;

	const isUserExist = await prisma.user.findUnique({ where: { email } });

	if (isUserExist) {
		throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist!");
	}

	const result = await prisma.user.create({
		data: {
			name: newUser.name,
			email: newUser.email,
			password: newUser.password,
			phone: newUser.phone,
			emailVerified: true,
		},
		omit: {
			password: true,
		},
	});

	await redisClient.del(otpKey);
	await redisClient.del(newUserPayloadKey);

	return result;
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

const updateProfileImage = async (buffer: Buffer, userId?: string) => {
	let user = null;
	if (userId) {
		user = await prisma.user.findUnique({
			where: { id: userId },
			select: { profileImage: true, profileImageId: true },
		});

		if (!user) {
			throw new AppError(httpStatus.NOT_FOUND, "Cannot find user!");
		}
	}

	const cloudinaryResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},

					async (error, result) => {
						if (error) {
							return reject(error);
						}

						if (!result) {
							return reject(new Error("No result returned from Cloudinary"));
						}

						resolve(result);
					},
				)
				.end(buffer);
		},
	);

	if (user) {
		const result = await prisma.user.update({
			where: { id: userId },
			data: {
				profileImage: cloudinaryResult.secure_url,
				profileImageId: cloudinaryResult.public_id,
			},
		});

		if (user?.profileImageId && user.profileImage) {
			await cloudinary.uploader.destroy(user.profileImageId);
		}

		return result;
	}

	return {
		profileImage: cloudinaryResult.secure_url,
		profileImageId: cloudinaryResult.public_id,
	};
};

export const AuthService = {
	getMe,
	verifyEmail,
	registerUser,
	refreshToken,
	updateProfileImage,
};
