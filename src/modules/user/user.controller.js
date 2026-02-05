import { Router } from "express";
import { profile } from "./user.service.js";
import { createUserService } from "./user.service.js";
import { successResponse } from "../../common/utils/index.js";
import { UserModel } from "../../DB/model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = Router();

export const signup = async (req, res) => {
  try {
    const user = await createUserService(req.body);

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("SIGNUP ERROR 👉", error);

    if (error.message === "EMAIL_EXISTS") {
      return res.status(409).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Signup failed" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
    console.log(error);
  }
};

export const updateUser = async (req, res) => {
  try {

    const { email, password, ...updates } = req.body || {};

    if (password) {
      return res.status(400).json({ message: "Password cannot be updated" });
    }

    const user = await UserModel.findByIdAndUpdate(req.userId, updates, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("UPDATE ERROR 👉", error);
    return res.status(500).json({ message: "Update failed" });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await UserModel.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted" });
  } catch (error) {
    console.error("DELETE ERROR 👉", error);
    return res.status(500).json({ message: "Delete failed" });
  }
};
export const getUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("GET USER ERROR 👉", error);
    return res.status(500).json({ message: "Failed to get user" });
  }
};

export default router;
