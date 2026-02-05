import { NotesModel } from "../../DB/model/Notes.model.js";
import mongoose from "mongoose";
import {
  successResponse,
  errorResponse,
} from "../../common/utils/response/index.js";

export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.userId;

    const note = await NotesModel.create({
      title,
      content,
      userId,
    });

    return successResponse(res, "Note created successfully", 201, note);
  } catch (error) {
    console.error("CREATE NOTE ERROR 👉", error);
    return errorResponse(res, "Failed to create note", 500, error.message);
  }
};

export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;
    const updates = req.body || {};

    const note = await NotesModel.findById(noteId);

    if (!note) {
      return errorResponse(res, "Note not found", 404);
    }

    if (note.userId.toString() !== userId) {
      return errorResponse(res, "Not authorized", 403);
    }

    const updatedNote = await NotesModel.findByIdAndUpdate(noteId, updates, {
      new: true,
    });

    return successResponse(res, "Note updated successfully", 200, updatedNote);
  } catch (error) {
    console.error("UPDATE NOTE ERROR 👉", error);
    return errorResponse(res, "Update failed", 500, error.message);
  }
};

export const replaceNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    const note = await NotesModel.findById(noteId);

    if (!note) {
      return errorResponse(res, "Note not found", 404);
    }

    if (note.userId.toString() !== userId) {
      return errorResponse(res, "Not authorized", 403);
    }

    const replacedNote = await NotesModel.findOneAndReplace(
      { _id: noteId },
      { ...req.body, userId: note.userId },
      { new: true },
    );

    return successResponse(
      res,
      "Note replaced successfully",
      200,
      replacedNote,
    );
  } catch (error) {
    console.error("REPLACE NOTE ERROR 👉", error);
    return errorResponse(res, "Replace failed", 500, error.message);
  }
};

export const UpdateALLNote = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    if (!title) {
      return errorResponse(res, "Title is required", 400);
    }

    const result = await NotesModel.updateMany({ userId }, { $set: { title } });

    return successResponse(res, "All notes titles updated successfully", 200, {
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("UPDATE ALL NOTES ERROR 👉", error);
    return errorResponse(res, "Update all notes failed", 500, error.message);
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    const note = await NotesModel.findById(noteId);

    if (!note) {
      return errorResponse(res, "Note not found", 404);
    }

    if (note.userId.toString() !== userId) {
      return errorResponse(res, "Not authorized", 403);
    }

    const deletedNote = await NotesModel.findByIdAndDelete(noteId);

    return successResponse(res, "Note deleted successfully", 200, deletedNote);
  } catch (error) {
    console.error("DELETE NOTE ERROR 👉", error);
    return errorResponse(res, "Delete failed", 500, error.message);
  }
};

export const getNotesPaginatedSorted = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const notes = await NotesModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(res, "Notes fetched successfully", 200, {
      page,
      limit,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("PAGINATE NOTES ERROR 👉", error);
    return errorResponse(res, "Failed to get notes", 500, error.message);
  }
};

export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const note = await NotesModel.findById(id);

    if (!note) {
      return errorResponse(res, "Note not found", 404);
    }

    if (note.userId.toString() !== userId) {
      return errorResponse(res, "Not authorized", 403);
    }

    return successResponse(res, "Note fetched successfully", 200, note);
  } catch (error) {
    console.error("GET NOTE ERROR 👉", error);
    return errorResponse(res, "Failed to get note", 500, error.message);
  }
};

export const getNoteByContent = async (req, res) => {
  try {
    const userId = req.userId;
    const { content } = req.query;

    if (!content) {
      return errorResponse(res, "Content query is required", 400);
    }

    const note = await NotesModel.findOne({ userId, content });

    if (!note) {
      return errorResponse(res, "Note not found", 404);
    }

    return successResponse(res, "Note fetched successfully", 200, note);
  } catch (error) {
    console.error("GET NOTE BY CONTENT ERROR 👉", error);
    return errorResponse(res, "Failed", 500, error.message);
  }
};

export const getNotesWithUser = async (req, res) => {
  try {
    const userId = req.userId;

    const notes = await NotesModel.find({ userId })
      .select("title userId createdAt")
      .populate("userId", "email");

    return successResponse(res, "Notes fetched successfully", 200, notes);
  } catch (error) {
    console.error("GET NOTES WITH USER ERROR 👉", error);
    return errorResponse(res, "Failed to get notes", 500, error.message);
  }
};

export const getNotesAggregate = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const { title } = req.query;

    const pipeline = [{ $match: { userId } }];

    if (title) {
      pipeline.push({
        $match: { title: { $regex: title, $options: "i" } },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          title: 1,
          content: 1,
          createdAt: 1,
          "user.name": 1,
          "user.email": 1,
        },
      },
    );

    const notes = await NotesModel.aggregate(pipeline);

    return successResponse(res, "Notes fetched successfully", 200, notes);
  } catch (error) {
    console.error("AGGREGATE ERROR 👉", error);
    return errorResponse(res, "Aggregation failed", 500, error.message);
  }
};

export const deleteAllNotes = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await NotesModel.deleteMany({ userId });

    return successResponse(res, "All notes deleted successfully", 200, {
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("DELETE ALL NOTES ERROR 👉", error);
    return errorResponse(res, "Failed to delete notes", 500, error.message);
  }
};
