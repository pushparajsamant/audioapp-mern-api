import { RequestHandler } from "express";
import { CreateAudioRequest, PaginationQuery } from "#/@types/audio";
import Favorite from "#/models/favorite";
import User, { UserDocument } from "#/models/user";
import Audio, { AudioDocument } from "#/models/audio";
import { isValidObjectId } from "mongoose";

export const toggleFavorite: RequestHandler = async (req, res) => {
  const audioId = req.query.audioId as string;
  let status: "added" | "removed";
  if (!isValidObjectId(audioId))
    return res.status(422).json({ error: "Unprocessable entity" });

  const audio = await Audio.findById(audioId);
  if (!audio) return res.status(404).send({ error: "Audio not found" });

  const alreadyExists = await Favorite.findOne({
    owner: req.user.id,
    favorites: audioId,
  });
  if (alreadyExists) {
    status = "removed";
    await Favorite.updateOne(
      { owner: req.user.id },
      { $pull: { favorites: audioId } }
    );
  } else {
    status = "added";
    const exists = await await Favorite.findOne({
      owner: req.user.id,
    });
    if (!exists) {
      await Favorite.create({
        owner: req.user.id,
        favorites: [audioId],
      });
    } else {
      await Favorite.updateOne(
        { owner: req.user.id },
        { $addToSet: { favorites: audioId } }
      );
    }
  }
  if (status == "added") {
    await Audio.findOneAndUpdate(
      { _id: audioId },
      { $addToSet: { likes: req.user.id } }
    );
  } else {
    await Audio.findOneAndUpdate(
      { _id: audioId },
      { $pull: { likes: req.user.id } }
    );
  }
  return res.status(200).json({ status });
};
export const listFavorites: RequestHandler = async (req, res) => {
  const { limit = "20", pageNo = "0" } = req.query as PaginationQuery;

  const favorites = await Favorite.aggregate([
    { $match: { owner: req.user.id } },
    {
      $project: {
        audioIds: {
          $slice: [
            "$favorites",
            parseInt(pageNo) * parseInt(limit),
            parseInt(limit),
          ],
        },
      },
    },
    { $unwind: "$audioIds" },
    {
      $lookup: {
        from: "audios",
        localField: "audioIds",
        foreignField: "_id",
        as: "audioInfo",
      },
    },
    { $unwind: "$audioInfo" },
    {
      $lookup: {
        from: "users",
        localField: "audioInfo.owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    { $unwind: "$ownerInfo" },
    {
      $project: {
        _id: 0,
        id: "$audioInfo._id",
        title: "$audioInfo.title",
        about: "$audioInfo.about",
        file: "$audioInfo.file.url",
        category: "$audioInfo.category",
        poster: "$audioInfo.poster.url",
        owner: {
          name: "$ownerInfo.name",
          id: "$ownerInfo._id",
        },
      },
    },
  ]);

  return res.status(200).json({ audios: favorites });
};
export const isFavorite: RequestHandler = async (req, res) => {
  const audioId = req.query.audioId;
  if (!isValidObjectId(audioId))
    return res.status(422).json({ error: "Invalid AudioId" });
  const favoriteDocument = await Favorite.findOne({
    owner: req.user.id,
    favorites: audioId,
  });
  return res.status(200).json({ result: favoriteDocument ? true : false });
};
