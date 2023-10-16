import express from "express";
import "dotenv/config";
import "express-async-errors";
import "./db";
import "./cloud";
import authRouter from "./routers/auth";
import audioRouter from "./routers/audio";
import favoriteRouter from "./routers/favorite";
import playlistRouter from "./routers/playlist";
import profileRouter from "./routers/profile";
import historyRouter from "./routers/history";
import { createPlaylist } from "./controllers/playlist";
import "./utils/schedule";
import { errorHandler } from "./middleware/error";
const PORT = process.env.PORT || 8989;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/auth", authRouter);
app.use("/audio", audioRouter);
app.use("/favorite", favoriteRouter);
app.use("/playlist", playlistRouter);
app.use("/profile", profileRouter);
app.use("/history", historyRouter);

app.use(errorHandler);
app.use(express.static("./src/public"));

app.listen(PORT, () => {
  console.log("Server is running at " + PORT);
});
