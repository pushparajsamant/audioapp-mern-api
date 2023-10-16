import { Request } from "express";
import { File } from "formidable";
import { ObjectId } from "mongoose";

export interface CreateUser extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}
export interface VerifyEmailRequest extends Request {
  body: {
    userId: string;
    token: string;
  };
}
export interface VerifyResetTokenRequest extends Request {
  body: {
    userId: string;
    token: string;
  };
}
export interface RequestWithFiles extends Request {
  files?: { [key: string]: File };
}

//This is to allow request object send from middleware function to have a user key
declare global {
  namespace Express {
    interface Request {
      user: {
        email: string;
        name: string;
        avatar?: string;
        followers: number;
        following: number;
        id: any;
        verified: boolean;
      };
      token: string;
    }
  }
}
