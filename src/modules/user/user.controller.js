import { Router } from "express";
import { profile } from "./user.service.js";
import { createUserService } from "./user.service.js";
import {
  successResponse,
  errorResponse,
} from "../../common/utils/response/index.js";
import { UserModel } from "../../DB/model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = Router();

export const signup = async (req, res) => {
  try {
    const user = await createUserService(req.body);

    return successResponse(res, "User registered successfully", 201, {
      userId: user._id,
    });
  } catch (error) {
    console.error("SIGNUP ERROR 👉", error);

    if (error.message === "EMAIL_EXISTS") {
      return errorResponse(res, "Email already exists", 409);
    }

    return errorResponse(res, "Signup failed", 500, error.message);
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return successResponse(res, "Login successful", 200, { token });
  } catch (error) {
    console.log(error);
    return errorResponse(res, "Login failed", 500, error.message);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { email, password, ...updates } = req.body || {};

    if (password) {
      return errorResponse(res, "Password cannot be updated", 400);
    }

    const user = await UserModel.findByIdAndUpdate(req.userId, updates, {
      new: true,
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "User updated successfully", 200);
  } catch (error) {
    console.error("UPDATE ERROR 👉", error);
    return errorResponse(res, "Update failed", 500, error.message);
  }
};
export const deleteUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await UserModel.findByIdAndDelete(userId);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "User deleted", 200);
  } catch (error) {
    console.error("DELETE ERROR 👉", error);
    return errorResponse(res, "Delete failed", 500, error.message);
  }
};
export const getUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "User fetched successfully", 200, user);
  } catch (error) {
    console.error("GET USER ERROR 👉", error);
    return errorResponse(res, "Failed to get user", 500, error.message);
  }
};

export default router;
