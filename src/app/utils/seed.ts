import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "./AppError";

export const seedTesterAdmin = async () => {
	try {
		const isAdminExist = await prisma.user.findUnique({
			where: {
				email: config.tester_admin_email,
			},
		});

		if (isAdminExist) {
			console.log("Tester Admin already Exists!");
			return;
		}

		const name = config.tester_admin_name;
		const email = config.tester_admin_email;
		const password = config.tester_admin_password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Admin Name , Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.ADMIN,
				emailVerified: true,
			},
		});

		console.log("Tester Admin Created Successfully!");
	} catch (error: any) {
		console.log("Error Seeding Tester Admin : ", error);

		await prisma.user.delete({
			where: {
				email: config.tester_admin_email,
			},
		});
	}
};

export const seedTesterStaff = async () => {
	try {
		const isTesterStaffExist = await prisma.user.findUnique({
			where: {
				email: config.tester_staff_email,
			},
		});

		if (isTesterStaffExist) {
			console.log("Tester Staff Already Exist!");
			return;
		}

		const name = config.tester_staff_name;
		const email = config.tester_staff_email;
		const password = config.tester_staff_password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Staff Name , Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.STAFF,
				emailVerified: true,
			},
		});

		console.log("Tester Staff Created Successfully!");
	} catch (error: any) {
		console.log("Error Seeding Tester Staff: ", error);

		await prisma.user.delete({
			where: {
				email: config.tester_staff_email,
			},
		});
	}
};
