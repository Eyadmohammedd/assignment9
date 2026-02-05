import express from "express";
import { auth } from "../../common/utils/auth.middleware.js";
import {
  createNote,
  updateNote,
  replaceNote,
  UpdateALLNote,
  getNotesPaginatedSorted,
  deleteNote,
  getNotesAggregate,
  getNotesWithUser,
  getNoteByContent,
  getNoteById,
  deleteAllNotes,
} from "./notes.controller.js";

const router = express.Router();

router.post("/", auth, createNote);
router.patch("/all", auth, UpdateALLNote);
router.get("/paginate-sort", auth, getNotesPaginatedSorted);
router.patch("/:noteId", auth, updateNote);
router.put("/replace/:noteId", auth, replaceNote);
router.delete("/:noteId", auth, deleteNote);
router.get("/aggregate", auth, getNotesAggregate);
router.get("/note-with-user", auth, getNotesWithUser);
router.get("/note-by-content", auth, getNoteByContent);
router.get("/:id", auth, getNoteById);
router.delete("/", auth, deleteAllNotes);

export default router;
