import mongoose, { Schema } from "mongoose";
// import bcrypt from "bcrypt";
import dotenv from "dotenv";
import CryptoJs from "crypto-js";
import JWT from "jsonwebtoken";

dotenv.config();

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },

    role: {
      type: String,
      enum: ["tenant", "landlord", "admin"],
      default: "tenant",
    },
    favourites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    const encryptedPassword = CryptoJs.AES.encrypt(
      this.password,
      process.env.SECRET_KEY
    ).toString();

    this.password = encryptedPassword;
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
 try {
  const bytes =  CryptoJs.AES.decrypt(this.password,process.env.SECRET_KEY)
  const decryptedPassword = bytes.toString(CryptoJs.enc.Utf8)
  return password === decryptedPassword
 } catch (error) {
  return false;
 }
};

userSchema.methods.generateJWTtoken = async function () {
  const payload = {
    user_Id: this._id,
    user_role: this.role,
  };

  const secret_key = process.env.SECRET_KEY;

  const options = {
    expiresIn: "1d",
  };

  const token = await JWT.sign(payload, secret_key, options);

  return token;
};

export const UserSchema = mongoose.model("User", userSchema);
