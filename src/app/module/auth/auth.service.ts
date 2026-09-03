import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { UserRegistrationPayload } from "./auth.interface";

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

    const result = await prisma.user.findUnique({
        where: { email }
    });

    return result;
};

// const credentialLogin = async () => {};

// const googleLogin = async () => {};

export const AuthService = {
    registerUser,
    // googleLogin,
    // credentialLogin
};