import { Model, ObjectId, Schema, model, models } from "mongoose";

export type Visibility = "public" | "private" | "auto";
export const visibility = ["public", "private", "auto"];
export interface PlaylistDocument {
  title: string;
  owner: ObjectId;
  items: ObjectId[];
  visibility: Visibility;
}

const playlistSchema = new Schema<PlaylistDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Audio",
      },
    ],
    visibility: {
      type: String,
      enum: visibility,
      default: "public",
    },
  },
  { timestamps: true }
);
const Playlist = models.Playlist || model("Playlist", playlistSchema);
export default Playlist as Model<PlaylistDocument>;
