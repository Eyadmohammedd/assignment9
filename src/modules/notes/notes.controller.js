import mongoose from "mongoose";
import {
  createNoteService,
  updateNoteService,
  replaceNoteService,
  updateAllNotesService,
  deleteNoteService,
  getNotesPaginatedService,
  getNoteByIdService,
  getNoteByContentService,
  getNotesWithUserService,
  getNotesAggregateService,
  deleteAllNotesService,
} from "./notes.service.js";

import {
  successResponse,
  errorResponse,
} from "../../common/utils/response/index.js";

/* ================= CREATE NOTE ================= */
export const createNote = async (req, res) => {
  try {
    const note = await createNoteService({
      title: req.body.title,
      content: req.body.content,
      userId: req.userId,
    });

    return successResponse(res, "Note created successfully", 201, note);
  } catch (error) {
    console.error("CREATE NOTE ERROR 👉", error);
    return errorResponse(res, "Failed to create note", 500, error.message);
  }
};

/* ================= UPDATE NOTE ================= */
export const updateNote = async (req, res) => {
  try {
    const result = await updateNoteService({
      noteId: req.params.noteId,
      userId: req.userId,
      updates: req.body,
    });

    if (result === null)
      return errorResponse(res, "Note not found", 404);

    if (result === "FORBIDDEN")
      return errorResponse(res, "Not authorized", 403);

    return successResponse(res, "Note updated successfully", 200, result);
  } catch (error) {
    console.error("UPDATE NOTE ERROR 👉", error);
    return errorResponse(res, "Update failed", 500, error.message);
  }
};

/* ================= REPLACE NOTE ================= */
export const replaceNote = async (req, res) => {
  try {
    const result = await replaceNoteService({
      noteId: req.params.noteId,
      userId: req.userId,
      body: req.body,
    });

    if (result === null)
      return errorResponse(res, "Note not found", 404);

    if (result === "FORBIDDEN")
      return errorResponse(res, "Not authorized", 403);

    return successResponse(
      res,
      "Note replaced successfully",
      200,
      result
    );
  } catch (error) {
    console.error("REPLACE NOTE ERROR 👉", error);
    return errorResponse(res, "Replace failed", 500, error.message);
  }
};

/* ================= UPDATE ALL NOTES ================= */
export const updateAllNotes = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title)
      return errorResponse(res, "Title is required", 400);

    const result = await updateAllNotesService({
      userId: req.userId,
      title,
    });

    return successResponse(res, "All notes updated successfully", 200, {
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("UPDATE ALL NOTES ERROR 👉", error);
    return errorResponse(res, "Update all notes failed", 500, error.message);
  }
};

/* ================= DELETE NOTE ================= */
export const deleteNote = async (req, res) => {
  try {
    const result = await deleteNoteService({
      noteId: req.params.noteId,
      userId: req.userId,
    });

    if (result === null)
      return errorResponse(res, "Note not found", 404);

    if (result === "FORBIDDEN")
      return errorResponse(res, "Not authorized", 403);

    return successResponse(res, "Note deleted successfully", 200, result);
  } catch (error) {
    console.error("DELETE NOTE ERROR 👉", error);
    return errorResponse(res, "Delete failed", 500, error.message);
  }
};

/* ================= PAGINATION + SORT ================= */
export const getNotesPaginatedSorted = async (req, res) => {
  try {
    const notes = await getNotesPaginatedService({
      userId: req.userId,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 5,
    });

    return successResponse(res, "Notes fetched successfully", 200, notes);
  } catch (error) {
    console.error("PAGINATION ERROR 👉", error);
    return errorResponse(res, "Failed to get notes", 500, error.message);
  }
};

/* ================= GET NOTE BY ID ================= */
export const getNoteById = async (req, res) => {
  try {
    const result = await getNoteByIdService({
      noteId: req.params.id,
      userId: req.userId,
    });

    if (result === null)
      return errorResponse(res, "Note not found", 404);

    if (result === "FORBIDDEN")
      return errorResponse(res, "Not authorized", 403);

    return successResponse(res, "Note fetched successfully", 200, result);
  } catch (error) {
    console.error("GET NOTE ERROR 👉", error);
    return errorResponse(res, "Failed to get note", 500, error.message);
  }
};

/* ================= GET NOTE BY CONTENT ================= */
export const getNoteByContent = async (req, res) => {
  try {
    const note = await getNoteByContentService({
      userId: req.userId,
      content: req.query.content,
    });

    if (!note)
      return errorResponse(res, "Note not found", 404);

    return successResponse(res, "Note fetched successfully", 200, note);
  } catch (error) {
    console.error("GET NOTE BY CONTENT ERROR 👉", error);
    return errorResponse(res, "Failed", 500, error.message);
  }
};

/* ================= NOTES WITH USER ================= */
export const getNotesWithUser = async (req, res) => {
  try {
    const notes = await getNotesWithUserService(req.userId);
    return successResponse(res, "Notes fetched successfully", 200, notes);
  } catch (error) {
    console.error("GET NOTES WITH USER ERROR 👉", error);
    return errorResponse(res, "Failed to get notes", 500, error.message);
  }
};

/* ================= AGGREGATION ================= */
export const getNotesAggregate = async (req, res) => {
  try {
    const notes = await getNotesAggregateService({
      userId: req.userId,
      title: req.query.title,
    });

    return successResponse(res, "Notes fetched successfully", 200, notes);
  } catch (error) {
    console.error("AGGREGATE ERROR 👉", error);
    return errorResponse(res, "Aggregation failed", 500, error.message);
  }
};

/* ================= DELETE ALL ================= */
export const deleteAllNotes = async (req, res) => {
  try {
    const result = await deleteAllNotesService(req.userId);

    return successResponse(res, "All notes deleted successfully", 200, {
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("DELETE ALL NOTES ERROR 👉", error);
    return errorResponse(res, "Failed to delete notes", 500, error.message);
  }
};
