import History, { HistoryDocument, HistoryType } from "#/models/history";
import { RequestHandler } from "express";

export const updateHistory: RequestHandler = async (req, res) => {
  const { audio, date, progress } = req.body;

  const oldHistory = await History.findOne({ owner: req.user.id });
  if (!oldHistory) {
    await History.create({
      owner: req.user.id,
      last: {
        audio: audio,
        progress: 0,
        date: date,
      },
      all: [
        {
          audio: audio,
          progress: 0,
          date: date,
        },
      ],
    });
    return res.json({ message: "Created history" });
  }
  const history: HistoryType = { audio, progress, date };
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );
  const histories = await History.aggregate([
    { $match: { owner: req.user.id } },
    { $unwind: "$all" },
    {
      $match: {
        "all.date": {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      },
    },
    {
      $project: {
        _id: 0,
        audio: "$all.audio",
      },
    },
  ]);
  const sameDayHistory = histories.find((item) => {
    if (item.audio.toString() === audio) return item;
  });

  if (sameDayHistory) {
    await History.findOneAndUpdate(
      {
        owner: req.user.id,
        "all.audio": audio,
      },
      {
        $set: {
          "all.$.progress": progress,
          "all.$.date": date,
        },
      }
    );
  } else {
    await History.findByIdAndUpdate(oldHistory._id, {
      $push: { all: { $each: [history], $position: 0 } },
      $set: { last: history },
    });
  }

  res.json({ success: true });
};

export const removeHistory: RequestHandler = async (req, res) => {
  const removeAll = req.query.all === "yes";

  if (removeAll) {
    // remove all the history
    await History.findOneAndDelete({ owner: req.user.id });
    return res.json({ success: true });
  }

  const histories = req.query.histories as string;
  const ids = JSON.parse(histories) as string[];
  await History.findOneAndUpdate(
    { owner: req.user.id },
    {
      $pull: { all: { _id: ids } },
    }
  );

  res.json({ success: true });
};
export const getHistory: RequestHandler = async (req, res) => {
  const { limit = "20", page = "0" } = req.query as {
    page: string;
    limit: string;
  };
  const histories = await History.aggregate([
    { $match: { owner: req.user.id } },
    {
      $project: {
        all: {
          $slice: ["$all", parseInt(limit) * parseInt(page), parseInt(limit)],
        },
      },
    },
    { $unwind: "$all" },
    {
      $lookup: {
        from: "audios",
        localField: "all.audio",
        foreignField: "_id",
        as: "audioInfo",
      },
    },
    { $unwind: "$audioInfo" },
    {
      $project: {
        id: "$all._id",
        audioId: "$audioInfo._id",
        date: "$all.date",
        title: "$audioInfo.title",
        audio: "$audioInfo.file.url",
        poster: "$audioInfo.poster.url",
        about: "$audioInfo.about",
        category: "$audioInfo.category",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        audios: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        date: "$_id",
        audios: "$$ROOT.audios",
      },
    },
    { $sort: { date: -1 } },
  ]);
  res.json(histories);
};
export const getRecentlyPlayed: RequestHandler = async (req, res) => {
  const match = { $match: { owner: req.user.id } };
  const sliceMatch = {
    $project: {
      myHistory: { $slice: ["$all", 10] },
    },
  };

  const dateSort = {
    $project: {
      histories: {
        $sortArray: {
          input: "$myHistory",
          sortBy: { date: -1 },
        },
      },
    },
  };

  const unwindWithIndex = {
    $unwind: { path: "$histories", includeArrayIndex: "index" },
  };

  const audioLookup = {
    $lookup: {
      from: "audios",
      localField: "histories.audio",
      foreignField: "_id",
      as: "audioInfo",
    },
  };

  const unwindAudioInfo = {
    $unwind: "$audioInfo",
  };

  const userLookup = {
    $lookup: {
      from: "users",
      localField: "audioInfo.owner",
      foreignField: "_id",
      as: "owner",
    },
  };

  const unwindUser = { $unwind: "$owner" };

  const projectResult = {
    $project: {
      _id: 0,
      id: "$audioInfo._id",
      title: "$audioInfo.title",
      about: "$audioInfo.about",
      file: "$audioInfo.file.url",
      poster: "$audioInfo.poster.url",
      category: "$audioInfo.category.url",
      owner: { name: "$owner.name", id: "$owner._id" },
      date: "$histories.date",
      progress: "$histories.progress",
    },
  };

  const audios = await History.aggregate([
    match,
    sliceMatch,
    dateSort,
    unwindWithIndex,
    audioLookup,
    unwindAudioInfo,
    userLookup,
    unwindUser,
    projectResult,
  ]);

  res.json({ audios });
};
