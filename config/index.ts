import dotenv from "dotenv";
dotenv.config();
// import { config } from "dotenv";
// config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_USER_NAME,
  DB_NAME,
  DB_PASSWORD,
  DB_DATABASE,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_COGNITO_USER_POOL,
  AWS_COGNITO_CLIENT_ID,
  AWS_COGNITO_CLIENT_SECRET,
  AWS_COGNITO_USER_POOL_UI,
  AWS_COGNITO_CLIENT_ID_UI,
} = process.env;
