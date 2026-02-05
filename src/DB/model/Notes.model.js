import mongoose from "mongoose";

const NotesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return value !== value.toUpperCase();
        },
        message: "Title must not be entirely uppercase",
      },
    },
    content: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    collection: "Notes",
  },
);

export const NotesModel = mongoose.model("Notes", NotesSchema);
