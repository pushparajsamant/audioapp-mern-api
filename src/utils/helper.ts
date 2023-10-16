import History from "#/models/history";
import { UserDocument } from "#/models/user";
import { Request } from "express";
import moment from "moment";

export const generateToken = (length: number) => {
  let token = "";
  for (let i = 0; i < length; i++) {
    token += Math.floor(Math.random() * 10);
  }
  //console.log(token);
  return token;
};

export const formatProfile = (user: UserDocument) => {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar?.url,
    verified: user.verified,
    followers: user.followers.length,
    following: user.following.length,
  };
};
export const getUsersPreviousHistory = async (req: Request) => {
  const [result] = await History.aggregate([
    { $match: { owner: req.user.id } },
    { $unwind: "$all" },
    {
      $match: {
        "all.date": {
          // only those histories which are not older than 30 days
          $gte: moment().subtract(30, "days").toDate(),
        },
      },
    },
    { $group: { _id: "$all.audio" } },
    {
      $lookup: {
        from: "audios",
        localField: "_id",
        foreignField: "_id",
        as: "audioData",
      },
    },
    { $unwind: "$audioData" },
    { $group: { _id: null, category: { $addToSet: "$audioData.category" } } },
  ]);
  return result;
};
