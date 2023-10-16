import { Model, ObjectId, Schema, model } from "mongoose";
export interface FavoriteDocument {
  owner: ObjectId;
  favorites: ObjectId[];
}

const FavoriteSchema = new Schema<FavoriteDocument>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  favorites: [
    {
      type: Schema.Types.ObjectId,
      ref: "Audio",
    },
  ],
});

export default model("Favorite", FavoriteSchema) as Model<FavoriteDocument>;
