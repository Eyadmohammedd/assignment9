import { Router } from "express";
import { signup, login, updateUser ,deleteUser,getUser  } from "./user.controller.js";
import { auth } from "../../common/utils/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.patch("/", auth, updateUser);
router.delete("/", auth, deleteUser);
router.get("/", auth, getUser);
export default router;
