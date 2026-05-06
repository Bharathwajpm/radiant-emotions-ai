import mongoose, { type InferSchemaType } from "mongoose";

const moodEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, required: true, trim: true }, // e.g. Great/Okay/Low
    emoji: { type: String, required: false, trim: true },
    score: { type: Number, required: false, min: 0, max: 10 },
    note: { type: String, required: false, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export type MoodEntryDoc = InferSchemaType<typeof moodEntrySchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const MoodEntryModel =
  (mongoose.models.MoodEntry as mongoose.Model<MoodEntryDoc> | undefined) ||
  mongoose.model<MoodEntryDoc>("MoodEntry", moodEntrySchema);

