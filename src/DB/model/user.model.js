import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, min: 18, max: 60 },
    phone: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "Users",
  },
);

export const UserModel = mongoose.model("User", UserSchema);
