import { NotesModel } from "../../DB/model/Notes.model.js";
import mongoose from "mongoose";

/* ================= CREATE ================= */
export const createNoteService = async ({ title, content, userId }) => {
  return await NotesModel.create({ title, content, userId });
};

/* ================= UPDATE ================= */
export const updateNoteService = async ({ noteId, userId, updates }) => {
  const note = await NotesModel.findById(noteId);
  if (!note) return null;
  if (note.userId.toString() !== userId) return "FORBIDDEN";

  return await NotesModel.findByIdAndUpdate(noteId, updates, { new: true });
};

/* ================= REPLACE ================= */
export const replaceNoteService = async ({ noteId, userId, body }) => {
  const note = await NotesModel.findById(noteId);
  if (!note) return null;
  if (note.userId.toString() !== userId) return "FORBIDDEN";

  return await NotesModel.findOneAndReplace(
    { _id: noteId },
    { ...body, userId: note.userId },
    { new: true }
  );
};

/* ================= UPDATE ALL ================= */
export const updateAllNotesService = async ({ userId, title }) => {
  return await NotesModel.updateMany(
    { userId },
    { $set: { title } }
  );
};

/* ================= DELETE ONE ================= */
export const deleteNoteService = async ({ noteId, userId }) => {
  const note = await NotesModel.findById(noteId);
  if (!note) return null;
  if (note.userId.toString() !== userId) return "FORBIDDEN";

  return await NotesModel.findByIdAndDelete(noteId);
};

/* ================= PAGINATION ================= */
export const getNotesPaginatedService = async ({ userId, page, limit }) => {
  const skip = (page - 1) * limit;

  const notes = await NotesModel.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return notes;
};

/* ================= GET BY ID ================= */
export const getNoteByIdService = async ({ noteId, userId }) => {
  const note = await NotesModel.findById(noteId);
  if (!note) return null;
  if (note.userId.toString() !== userId) return "FORBIDDEN";
  return note;
};

/* ================= BY CONTENT ================= */
export const getNoteByContentService = async ({ userId, content }) => {
  return await NotesModel.findOne({ userId, content });
};

/* ================= POPULATE ================= */
export const getNotesWithUserService = async (userId) => {
  return await NotesModel.find({ userId })
    .select("title userId createdAt")
    .populate("userId", "email");
};

/* ================= AGGREGATE ================= */
export const getNotesAggregateService = async ({ userId, title }) => {
  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
  ];

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
    }
  );

  return await NotesModel.aggregate(pipeline);
};

/* ================= DELETE ALL ================= */
export const deleteAllNotesService = async (userId) => {
  return await NotesModel.deleteMany({ userId });
};
