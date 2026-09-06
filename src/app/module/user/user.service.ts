import { prisma } from "../../lib/prisma";

const getAllStaffs = async () => {
	return await prisma.user.findMany({
		where: {
			role: "STAFF",
			status: "ACTIVE",
			deletedAt: null,
		},
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			profileImage: true,
		},
	});
};

export const UserService = {
	getAllStaffs,
};
