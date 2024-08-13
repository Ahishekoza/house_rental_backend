import { UserSchema } from "../models/user.model.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, favourites } = req.body;

    const existingUser = await UserSchema.findOne({ email: email });
    if (existingUser)
      res.status(201).json({ message: "User already registered" });

    const user = new UserSchema({
      name: name,
      email: email,
      password: password,
      role: role,
      favourites: favourites || [],
    });

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserSchema.findOne({ email: email });

    if (!user) throw new Error("User does not exist");

    const isPasswordValid = user.isPasswordCorrect(password);

    if (!isPasswordValid) throw new Error("Password is incorrect");

    const token = user.generateJWTtoken();

    let loggedInUser = await UserSchema.findById(user?._id).select(
      "-password  -__v"
    );

    loggedInUser = { ...loggedInUser._doc, accessToken: token };

    res.status(200).json(loggedInUser);
  } catch (error) {
    throw new Error(error);
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

export const getUserFavoriteProperties = async(req,res)=>{
  // ---

  try {
    const {user_Id} = req.params

    const favouriteProperties = await UserSchema.findById({ _id: user_Id })
    .populate({
      path: 'favourites', // Populate the 'favourites' field
      populate: {
        path: 'owner', // Populate the 'owner' field within the 'favourites'
        select: 'name', // Select only the 'name' field of the owner
      },
    })
    .exec(); // Ensure to execute the query

  if (!favouriteProperties) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json(favouriteProperties);

  } catch (error) {
    return res.status(404).send(error.message);
  }
}