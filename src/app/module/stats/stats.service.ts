import { RequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";

const adminStats = async () => {
	const [totalRequests, pendingRequests, inProgress, totalUsers] =
		await Promise.all([
			prisma.request.count(),
			prisma.request.count({ where: { status: RequestStatus.SUBMITTED } }),
			prisma.request.count({ where: { status: RequestStatus.IN_PROGRESS } }),
			prisma.user.count(),
		]);

	return {
		totalRequests,
		pendingRequests,
		inProgress,
		totalUsers,
	};
};

const citizenStats = async (userInfo: RequestUser) => {
	const { userId } = userInfo;

	const [totalRequests, pendingRequests, inProgressRequests, resolvedRequests] =
		await Promise.all([
			prisma.request.count({ where: { userId } }),
			prisma.request.count({
				where: { userId, status: RequestStatus.SUBMITTED },
			}),
			prisma.request.count({
				where: { userId, status: RequestStatus.IN_PROGRESS },
			}),
			prisma.request.count({
				where: { userId, status: RequestStatus.RESOLVED },
			}),
		]);

	return {
		totalRequests,
		pendingRequests,
		inProgressRequests,
		resolvedRequests,
	};
};

const staffStats = async (staffInfo: RequestUser) => {
	const { userId: staffId } = staffInfo;

	const [totalAssigned, pendingAction, inProgress, resolved] =
		await Promise.all([
			prisma.request.count({ where: { assignedStaffId: staffId } }),
			prisma.request.count({
				where: { assignedStaffId: staffId, status: RequestStatus.ASSIGNED },
			}),
			prisma.request.count({
				where: { assignedStaffId: staffId, status: RequestStatus.IN_PROGRESS },
			}),
			prisma.request.count({
				where: { assignedStaffId: staffId, status: RequestStatus.RESOLVED },
			}),
		]);

	return {
		totalAssigned,
		pendingAction,
		inProgress,
		resolved,
	};
};

export const StatsService = {
	staffStats,
	adminStats,
	citizenStats,
};
