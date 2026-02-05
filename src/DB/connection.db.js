import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

export const authenticationDB = async () => {
  try {
    const databaseConnectionResult = await mongoose.connect(DB_URI);

    console.log(
      "Database connected successfully",
      databaseConnectionResult.connection.name,
    );
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

