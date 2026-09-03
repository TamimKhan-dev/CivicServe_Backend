
export interface UserRegistrationPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface UserEmailVerifyPayload {
    email: string;
    otp: number;
}