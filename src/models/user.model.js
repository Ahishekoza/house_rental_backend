import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

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

    this.password = await bcrypt.hash(this.password, 10);
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
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
