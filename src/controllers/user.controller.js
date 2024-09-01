import { UserSchema } from "../models/user.model.js";
import crypto from "crypto";
import { sendOTP } from "../utils/sendOtp.js";

export const registerUser = async (req, res) => {
  try {
    const { email, role, favourites } = req.body;

    const existingUser = await UserSchema.findOne({ email: email });
    if (existingUser) {
      return res.status(201).json({ existingUser: existingUser });
    }

    // --- otp type is string when its get saved in the database
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60000);

    const user = new UserSchema({
      email: email,
      otp: otp,
      otpExpiresAt: otpExpiresAt,
      role: role,
      favourites: favourites || [],
    });

    await user.save();
    await sendOTP(email, otp);

    res.status(200).json({
      message: "OTP sent. Please verify your email.",
      success: true,
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await UserSchema.findOne({
      email: email,
      otp: otp,
      otpExpiresAt: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP." });

    user.verified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    res.status(200).json({
      message: "Registration completed. You can now log in.",
      verified: user.verified,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const setUserPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserSchema.findOne({ email: email });

    user.password = password;

    await user.save();

    res
      .status(200)
      .json({ message: "User Registered successfully", success: true });
  } catch (error) {
    res.status(404).json({
      message: "Unable to set user password and update the user details",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserSchema.findOne({ email: email });

    if (!user) throw new Error("User does not exist");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) throw new Error("Password is incorrect");

    const token = await user.generateJWTtoken();

    let loggedInUser = await UserSchema.findById(user?._id).select(
      "-password  -__v"
    );

    loggedInUser = { ...loggedInUser._doc, accessToken: token };

    res.status(200).json({ loggedInUser: loggedInUser });
  } catch (error) {
    throw new Error(error);
  }
};

// @TODO :- if user is deleted then property should also get deleted
export const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const deleted_user = await UserSchema.findOneAndDelete({ email: email });

    if (deleted_user) {
      
      return res
        .status(200)
        .json({ message: "User deleted successfully", success: true });
    } else {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

export const registerUsersFavoriteProperities = async (req, res) => {
  // --- logged in user which we will get once we decode the JWT token
  // --- get the userId from JWT token and property Id from the from the params
  // --- find the User by the ID and $push the property Id in the favourites attribute
  // ---

  try {
    const { user_Id, property_id } = req.params;

    await UserSchema.findByIdAndUpdate(
      { _id: user_Id },
      { $push: { favourites: property_id } },
      { new: true }
    );

    return res.status(200).send("Add in Favorites List");
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

export const getUserFavoriteProperties = async (req, res) => {
  // ---

  try {
    const { user_Id } = req.params;

    const favouriteProperties = await UserSchema.findById({ _id: user_Id })
      .populate({
        path: "favourites", // Populate the 'favourites' field
        populate: {
          path: "owner", // Populate the 'owner' field within the 'favourites'
          select: "name", // Select only the 'name' field of the owner
        },
      })
      .exec(); // Ensure to execute the query

    // -- ##reference -- please refer for rental schema
    // console.log(favouriteProperties.favourites[0]?.price);

    if (!favouriteProperties) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(favouriteProperties);
  } catch (error) {
    return res.status(404).send(error.message);
  }
};
