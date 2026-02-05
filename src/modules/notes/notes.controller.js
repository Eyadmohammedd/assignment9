import { NotesModel } from "../../DB/model/Notes.model.js";
import mongoose from "mongoose";

export const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.userId;
    const note = await NotesModel.create({
      title,
      content,
      userId,
    });

    res.json(note);

    return res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    console.error("CREATE NOTE ERROR 👉", error);
    return res.status(500).json({ message: "Failed to create note" });
  }
};
export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;   
    const userId = req.userId;       
    const updates = req.body || {};

    const note = await NotesModel.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedNote = await NotesModel.findByIdAndUpdate(
      noteId,
      updates,
      { new: true }
    );

    return res.json({
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error("UPDATE NOTE ERROR 👉", error);
    return res.status(500).json({ message: "Update failed" });
  }
};
export const replaceNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    const note = await NotesModel.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const replacedNote = await NotesModel.findOneAndReplace(
      { _id: noteId },
      {
        ...req.body,        
        userId: note.userId 
      },
      { new: true }
    );

    return res.json({
      message: "Note replaced successfully",
      note: replacedNote,
    });
  } catch (error) {
    console.error("REPLACE NOTE ERROR 👉", error);
    return res.status(500).json({ message: "Replace failed" });
  }
};
export const UpdateALLNote = async (req, res) => {
  try {
    const userId = req.userId;       
   const { title } = req.body;  
   
    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

   const result = await NotesModel.updateMany(
      { userId },                        
      { $set: { title } }              
    );
      return res.json({
      message: "All notes titles updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("UPDATE ALL NOTES ERROR 👉", error);
    console.log(Error);
    
    return res.status(500).json({ message: "Update all notes failed" });
  }
};           
export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    const note = await NotesModel.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // owner check
    if (note.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const deletedNote = await NotesModel.findByIdAndDelete(noteId);

    return res.json({
      message: "Note deleted successfully",
      note: deletedNote,
    });
  } catch (error) {
    console.error("DELETE NOTE ERROR 👉", error);
    return res.status(500).json({ message: "Delete failed" });
  }
};
export const getNotesPaginatedSorted = async (req, res) => {
  try {
    const userId = req.userId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const notes = await NotesModel.find({ userId })
      .sort({ createdAt: -1 })   // 👈 DESC
      .skip(skip)
      .limit(limit);

    return res.json({
      page,
      limit,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("PAGINATE NOTES ERROR 👉", error);
    return res.status(500).json({ message: "Failed to get notes" });
  }
};
export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const note = await NotesModel.findById(id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    return res.json({ note });
  } catch (error) {
    console.error("GET NOTE ERROR 👉", error);
    return res.status(500).json({ message: "Failed to get note" });
  }
};
export const getNoteByContent = async (req, res) => {
  try {
    const userId = req.userId;
    const { content } = req.query;

    if (!content) {
      return res.status(400).json({ message: "Content query is required" });
    }

    const note = await NotesModel.findOne({
      userId,
      content,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.json({ note });
  } catch (error) {
    console.error("GET NOTE BY CONTENT ERROR 👉", error);
    return res.status(500).json({ message: "Failed" });
  }
};
export const getNotesWithUser = async (req, res) => {
  try {
    const userId = req.userId;

    const notes = await NotesModel.find({ userId })
      .select("title userId createdAt")
      .populate("userId", "email");

    return res.json({ notes });
  } catch (error) {
    console.error("GET NOTES WITH USER ERROR 👉", error);
    return res.status(500).json({ message: "Failed to get notes" });
  }
};

export const getNotesAggregate = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const { title } = req.query;

    const pipeline = [
      { $match: { userId } },
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

    const notes = await NotesModel.aggregate(pipeline);

    return res.json({ notes });
  } catch (error) {
    console.error("AGGREGATE ERROR 👉", error);
    return res.status(500).json({ message: "Aggregation failed" });
  }
};
export const deleteAllNotes = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await NotesModel.deleteMany({ userId });

    return res.json({
      message: "All notes deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("DELETE ALL NOTES ERROR 👉", error);
    return res.status(500).json({ message: "Failed to delete notes" });
  }
};
