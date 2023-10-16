import { categoriesTypes } from "#/utils/audio_category";
import { Request } from "express";
import { RequestWithFiles } from "./user";
import { ObjectId } from "mongoose";
import { Visibility } from "#/models/playlist";

export interface CreateAudioRequest extends RequestWithFiles {
  body: {
    title: string;
    about: string;
    category: categoriesTypes;
  };
}
export interface CreatePlaylistRequest extends Request {
  body: {
    title: string;
    resId: string;
    visibility: Exclude<Visibility, "auto">;
  };
}
export interface UpdateAudioRequest extends Request {
  body: {
    id: string;
    title?: string;
    resId: string;
    visibility?: Exclude<Visibility, "auto">;
  };
}
export type PaginationQuery {
  pageNo: string;
  limit: string;
}