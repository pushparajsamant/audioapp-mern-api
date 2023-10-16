import {
  CLOUDINARY_APIKEY,
  CLOUDINARY_APISECRET,
  CLOUD_NAME,
} from "#/utils/variables";
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUDINARY_APIKEY,
  api_secret: CLOUDINARY_APISECRET,
  secure: true,
});

export default cloudinary;
