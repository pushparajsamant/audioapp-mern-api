import { RequestWithFiles } from "#/@types/user";
import cloudinary from "#/cloud";
import { categoriesTypes } from "#/utils/audio_category";
import { RequestHandler } from "express";
import formidable, { File } from "formidable";
import Audio from "#/models/audio";
import { CreateAudioRequest } from "#/@types/audio";
import Favorite from "#/models/favorite";
import { UserDocument } from "#/models/user";
export const uploadAudio: RequestHandler = async (
  req: CreateAudioRequest,
  res
) => {
  const { title, about, category } = req.body;
  const audioFile = req.files?.file as File;
  const posterFile = req.files?.poster as File;

  if (!audioFile)
    return res.status(422).json({ error: "Audio file is missing!" });
  const { secure_url: audioURL, public_id: audioPublicId } =
    await cloudinary.uploader.upload(audioFile.filepath, {
      resource_type: "video",
    });
  const audio = new Audio({
    title,
    about,
    category,
    likes: [],
    file: {
      url: audioURL,
      publicId: audioPublicId,
    },
    owner: req.user.id,
  });
  if (posterFile) {
    const { secure_url: posterURL, public_id: posterPublicId } =
      await cloudinary.uploader.upload(posterFile.filepath, {
        resource_type: "image",
        width: 200,
        height: 200,
        crop: "thumb",
        gravity: "face",
      });
    audio.poster = {
      url: posterURL,
      publicId: posterPublicId,
    };
  }
  await audio.save();
  return res.status(201).json({
    audio: { title, about, file: audio.file.url, poster: audio.poster?.url },
  });
};
export const updateAudio: RequestHandler = async (
  req: CreateAudioRequest,
  res
) => {
  const { id } = req.params;
  const { title, about, category } = req.body;
  const posterFile = req.files?.poster as File;

  const audio = await Audio.findOneAndUpdate(
    { _id: id, owner: req.user.id },
    { title, about, category },
    { new: true }
  );

  if (!audio) return res.status(404).json({ error: "Audio not found. " });

  if (posterFile) {
    const existingPoster = audio.poster;
    if (existingPoster) {
      await cloudinary.uploader.destroy(existingPoster?.publicId);
    }
    const { secure_url: posterURL, public_id: posterPublicId } =
      await cloudinary.uploader.upload(posterFile.filepath, {
        resource_type: "image",
        width: 200,
        height: 200,
        crop: "thumb",
        gravity: "face",
      });
    audio.poster = {
      url: posterURL,
      publicId: posterPublicId,
    };
  }
  await audio.save();
  return res.status(201).json({
    audio: { title, about, file: audio.file.url, poster: audio.poster?.url },
  });
};
export const getLatestUploads: RequestHandler = async (
  req: CreateAudioRequest,
  res
) => {
  const list = await Audio.find()
    .sort("-createdAt")
    .limit(10)
    .populate<{ owner: UserDocument }>("owner");
  res.json({
    audios: list.map((item) => {
      return {
        id: item._id,
        title: item.title,
        category: item.category,
        audio: item.file.url,
        poster: item.poster?.url,
        owner: {
          name: item.owner.name,
          avatar: item.owner.avatar?.url,
        },
      };
    }),
  });
};
