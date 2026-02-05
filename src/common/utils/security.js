import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";
import e from "express";
export const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};
export const encryptPhone = (phone) => {
  if (!phone) {
    throw new Error("PHONE_IS_REQUIRED");
  }

  return CryptoJS.AES.encrypt(
    phone.toString(),
    process.env.ENCRYPT_KEY
  ).toString();
};

