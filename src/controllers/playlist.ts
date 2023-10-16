import { CreatePlaylistRequest, UpdateAudioRequest } from "#/@types/audio";
import Audio, { AudioDocument } from "#/models/audio";
import Playlist from "#/models/playlist";
import { UserDocument } from "#/models/user";
import { RequestHandler } from "express";
import { ObjectId, isValidObjectId } from "mongoose";

export const createPlaylist: RequestHandler = async (
  req: CreatePlaylistRequest,
  res
) => {
  const { title, resId, visibility } = req.body;
  const owner = req.user.id;

  const newPlaylist = new Playlist({
    title,
    owner,
    visibility,
  });
  if (resId) {
    const audio = await Audio.findById(resId);
    if (!audio) return res.status(404).json({ error: "Audio not found" });
    newPlaylist.items = [resId as any];
  }
  await newPlaylist.save();
  return res.status(201).json({
    id: newPlaylist._id,
    title: newPlaylist.title,
    visibility: newPlaylist.visibility,
  });
};
export const addToPlaylist: RequestHandler = async (
  req: UpdateAudioRequest,
  res
) => {
  const { id, title, resId, visibility } = req.body;

  const playlist = await Playlist.findOneAndUpdate(
    { _id: id },
    {
      title,
      visibility,
    },
    { new: true }
  );
  if (!playlist) return res.status(404).json({ error: "Playlist not found" });

  if (resId) {
    const audio = await Audio.findById(resId);
    if (!audio) return res.status(404).json({ error: "Audio not found" });
    await Playlist.findOneAndUpdate(
      { _id: id },
      {
        $addToSet: { items: resId },
      }
    );
  }

  return res.status(201).json({
    id: playlist._id,
    title: playlist.title,
    visibility: playlist.visibility,
  });
};
export const removePlaylist: RequestHandler = async (req, res) => {
  const { id, resId, all } = req.query;
  if (!isValidObjectId(id)) {
    return res.status(422).json({ message: "Invalid playlistId" });
  }
  if (all === "yes") {
    const playlist = await Playlist.findOneAndDelete({
      _id: id,
      owner: req.user.id,
    });
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    return res.status(201).json({ message: "Playlist deleted" });
  }
  if (resId) {
    if (!isValidObjectId(resId)) {
      return res.status(422).json({ message: "Invalid audio" });
    }
    const audio = await Audio.findById(resId);
    if (!audio)
      return res.status(404).json({ message: "Audio file not found" });
    const deletedAudio = await Playlist.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      { $pull: { items: resId } }
    );
    if (!deletedAudio)
      return res.status(404).json({ message: "Playlist not found" });
    return res.status(201).json({ message: "Deleted audio from playlist" });
  }
};
export const getPlaylist: RequestHandler = async (req, res) => {
  const { page = "0", limit = "20" } = req.query as {
    page: string;
    limit: string;
  };
  const skip = parseInt(page) * parseInt(limit);
  const playlists = await Playlist.find({
    owner: req.user.id,
    visibility: { $ne: "auto" },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  //.populate<{ items: AudioDocument[] }>("items")
  //.populate<{ owner: UserDocument }>("owner");
  return res.status(200).json({
    playlists: playlists.map((playlist) => {
      return {
        title: playlist.title,
        id: playlist._id,
        visibility: playlist.visibility,
        // owner: {
        //   name: playlist.owner?.name,
        //   avatar: playlist.owner?.avatar?.url,
        // },
        count: playlist.items.length,
        // items: playlist.items.map((item) => {
        //   return {
        //     title: item.title,
        //     about: item.about,
        //     category: item.category,
        //     file: item.file?.url,
        //     poster: item.poster?.url,
        //   };
        // }),
      };
    }),
  });
};

export const getSongsFromPlaylist: RequestHandler = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId)
    return res.status(422).json({ error: "Invalid PlaylistID" });

  const playlist = await Playlist.findOne({
    owner: req.user.id,
    _id: id,
  }).populate<{ items: AudioDocument<UserDocument>[] }>({
    path: "items",
    populate: {
      path: "owner",
    },
  });
  if (!playlist) return res.status(404).json({ error: "Playlist not found" });
  const audios = playlist.items.map((item) => {
    return {
      id: item._id,
      title: item.title,
      about: item.about,
      file: item.file.url,
      poster: item.poster?.url,
      category: item.category,
    };
  });
  return res.status(200).json({
    list: {
      title: playlist.title,
      id: playlist.id,
      audios,
    },
  });
};
