import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true });

export default {
	node_env: process.env.NODE_ENV,
	port: process.env.PORT,
	database_url: process.env.DATABASE_URL,
	backend_url: process.env.APP_URL,
	frontend_url: process.env.FRONTEND_URL,
	bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
	jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
	jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
	jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
	jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
	tester_admin_name: process.env.TESTER_ADMIN_NAME!,
	tester_admin_email: process.env.TESTER_ADMIN_EMAIL!,
	tester_admin_password: process.env.TESTER_ADMIN_PASSWORD!,
	tester_staff_name: process.env.TESTER_STAFF_NAME!,
	tester_staff_email: process.env.TESTER_STAFF_EMAIL!,
	tester_staff_password: process.env.TESTER_STAFF_PASSWORD!,
	google_client_id: process.env.GOOGLE_CLIENT_ID!,
	google_client_secret: process.env.GOOGLE_CLIENT_SECRET!,
	google_client_callback_url: process.env.GOOGLE_CLIENT_CALLBACK_URL!,
	redis_rest_url: process.env.UPSTASH_REDIS_REST_URL!,
	redis_rest_token: process.env.UPSTASH_REDIS_REST_TOKEN!,
	stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
	stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
	cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
	cloudinary_api_key: process.env.CLOUDINARY_API_KEY!,
	cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET!,
};
