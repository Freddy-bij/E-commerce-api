import dotenv from "dotenv";

// Load the .env file immediately
dotenv.config();

export const ENV = {
  JWT_SECRET: process.env.JWT_SECRET_KEY,
  PORT: process.env.PORT || "3000",
  // Add other variables here as needed
};

// Logic check: Stop the server immediately if the secret is missing
if (!ENV.JWT_SECRET) {
  console.error("❌ CRITICAL ERROR: JWT_SECRET_KEY is not defined in .env");
  process.exit(1); 
}

// Export as a guaranteed string to satisfy TypeScript
export const JWT_SECRET_VALIDATED = ENV.JWT_SECRET as string;