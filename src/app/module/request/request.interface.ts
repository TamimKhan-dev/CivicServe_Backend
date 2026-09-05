import type {
	RequestStatus,
	RequestType,
} from "../../../generated/prisma/enums";

export interface ICreateRequestPayload {
	title: string;
	description: string;
	type: RequestType;
	location: string;
	departmentId: string;
	categoryId: string;
	serviceId?: string;
}

export interface IRequestQuery {
	searchTerm?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	status?: RequestStatus;
	type?: RequestType;
	departmentId?: string;
	categoryId?: string;
	serviceId?: string;
}
