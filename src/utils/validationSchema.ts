import * as yup from "yup";
import { isValidObjectId } from "mongoose";
import { categories } from "./audio_category";
import { visibility } from "#/models/playlist";
export const CreateUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name is missing")
    .min(3, "Name is too short")
    .max(20, "Name is too long"),
  email: yup.string().email("Invalid email id").required("Email is required"),
  password: yup
    .string()
    .trim()
    .required("Password is missing")
    .min(8, "Password is too short")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Password needs one letter, special character and one number"
    ),
});
export const SignInValidationSchema = yup.object().shape({
  email: yup.string().email("Invalid email id").required("Email is required"),
  password: yup.string().trim().required("Password is missing"),
});
export const IDandTokenValidationSchema = yup.object().shape({
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("Invalid UserID"),
  token: yup.string().trim().required("Invalid Token"),
});
export const PasswordResetValidationSchema = yup.object().shape({
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("Invalid UserID"),
  token: yup.string().trim().required("Invalid Token"),
  password: yup
    .string()
    .trim()
    .required("Password is missing")
    .min(8, "Password is too short")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Password needs one letter, special character and one number"
    ),
});
export const AudioValidationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  about: yup.string().required("About is required"),
  category: yup
    .string()
    .oneOf(categories, "Category value needs to be from the list of categories")
    .required("Category is required"),
});
export const FavoriteValidationSchema = yup.object().shape({
  audioId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("Invalid AudioId"),
});
export const PlaylistValidationScheme = yup.object().shape({
  title: yup.string().required("Invalid owner"),
  resId: yup.string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : "";
  }),
  visibility: yup
    .string()
    .oneOf(["p ublic", "private"], "Invalid visibility value"),
});
export const UpdatePlaylistValidationScheme = yup.object().shape({
  resId: yup
    .string()
    .transform(function (value) {
      return this.isType(value) && isValidObjectId(value) ? value : "";
    })
    .required("Invalid AudioID"),
  id: yup
    .string()
    .transform(function (value) {
      return this.isType(value) && isValidObjectId(value) ? value : "";
    })
    .required("Invalid PlaylistID"),
  visibility: yup
    .string()
    .oneOf(["public", "private"], "Invalid visibility value"),
});
export const UpdateHistoryValidationSchema = yup.object().shape({
  audio: yup
    .string()
    .transform(function (value) {
      return this.isType(value) && isValidObjectId(value) ? value : "";
    })
    .required("Invalid AudioID"),
  progress: yup.number().required("Progress is missing"),
  date: yup
    .string()
    .transform(function (value) {
      const date = new Date(value);
      if (date instanceof Date) return value;
      return "";
    })
    .required("Date value is invalid"),
});
// CreateUserSchema.validate()
