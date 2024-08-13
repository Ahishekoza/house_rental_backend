import { v2 as cloudinary } from "cloudinary";

import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageOnCloudinary = async (imagePath) => {
  if (!imagePath) throw new Error("Image path not specified");

  try {
    const image_Url = await cloudinary.uploader.upload(imagePath, {
      resource_type: "auto",
    });



    //    ---export whole Image_Url so that you can use public_id to delete the image while deleting the property details

    fs.unlinkSync(imagePath);

    return image_Url;
  } catch (error) {
    fs.unlinkSync(imagePath);
    console.log(error);
  }
};

export const updateImageOnCloudinary = async (path,previous_image_public_id) => {
  try {
    const image_Url = await cloudinary.uploader.upload(path, {
      public_id: previous_image_public_id,
      resource_type: "auto",
    });

    fs.unlinkSync(path);

    return image_Url;
  } catch (error) {
    console.log(error);
  }
};

export const deleteImageFromCloudinary = async (imageArray) => {
  try {
    const deletedImage =  await cloudinary.api.delete_resources(imageArray, {
      type: "upload",
      resource_type: "image",
    });

    console.log(deletedImage);
  } catch (error) {
    console.log(error);
  }
};
