import { PropertySchema } from "../models/property.model.js";
import {
  deleteImageFromCloudinary,
  uploadImageOnCloudinary,
} from "../utils/cloudinary.util.js";
import fs from "fs";

export const registerProperty = async (req, res) => {
  // --get all the properties attributes from the request
  // --check if the property is already registered on the basis of the location?.address
  // --if yes then send a response with message property is present
  // --if no then first see if there are images available if yes then get the url of the images
  // --and save them in the array
  // --after that create a new property object and save it in the database

  try {
    const {
      owner,
      title,
      description,
      price,
      location,
      propertyType,
      rooms_beds,
      features,
      totalGuests
    } = req.body;
    const imageFiles = req.files;

    const propertyCount = await PropertySchema.countDocuments({
      location: location,
    });
    if (propertyCount === 1) {
      await Promise.all(imageFiles.map((file) => fs.unlinkSync(file?.path)));
      return res.status(409).send("Property is already registered !");
    }

    const imageUrls = imageFiles
      ? await Promise.all(
          imageFiles.map(async (file) => {
            try {
              const url = await uploadImageOnCloudinary(file?.path);
              return {
                url: url?.secure_url,
                image_id: url?.public_id,
                original_name: url?.original_filename,
              };
            } catch (error) {
              console.error(
                `Failed to upload image ${file.filename}: ${error.message}`
              );
              return null; // Skip failed uploads
            }
          })
        )
      : [];

    const newProperty = new PropertySchema({
      owner: owner,
      title: title,
      description: description,
      price: price,
      location: location,
      propertyType: propertyType,
      rooms_beds: rooms_beds,
      images: imageUrls,
      features: features || [],
      totalGuests: totalGuests
    });

    await newProperty.save();

    return res.status(200).json(newProperty);
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

export const getProperties = async (req, res) => {
  // create a pagination so that we can limit the number of properties fetched on a page

  try {
    const {
      city,
      country,
      minPrice,
      maxPrice,
      propertyType,
      rooms,
      beds,
      bathrooms,
      features,
      totalGuests
    } = req.query;

  

    let query = {};

    if (city) {
      query["location.city"] = new RegExp(city, "i");
    }

    if (country) {
      query["location.country"] = new RegExp(country, "i");
    }


    if (totalGuests) {
      query.totalGuests = { $gte: parseInt(totalGuests,10) };
    }
    

    if (minPrice || maxPrice) {
      query.price = {};
      // query.price={
      //   $gte : minPrice,
      //   $lte : maxPrice
      // }
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (rooms) {
      query["rooms_beds.rooms"] = rooms;
    }
    if (beds) {
      query["rooms_beds.beds"] = beds;
    }

    if (bathrooms) {
      query["rooms_beds.bathrooms"] = bathrooms;
    }

    if (propertyType) {
      query.propertyType = new RegExp(propertyType, "i");
    }

    if (features) {
      const selectedFeatures = features
        .split(",")
        .map((feature) => new RegExp(feature, "i"));

      query.features = { $in: selectedFeatures };
    }


    const page = parseInt(req.params.page, 10) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const properties = await PropertySchema.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    return res.status(201).json({
      data: properties,
      pagination: {
        total: properties.length,
        page: page,
        pages: Math.ceil(properties.length / pageSize),
      },
    });
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

export const getSingleProperty = async (req, res) => {
  try {
    const { property_id } = req.params;

    if (!property_id) return res.status(404).send("No property specified");

    const query = {
      _id: property_id,
    };

    const property = await PropertySchema.findOne(query).populate("owner", {
      email: 1,
    });

    return res.status(200).json(property);
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

export const updateSingleProperty = async (req, res) => {
  try {
    const { property_id } = req.params;
    const imageFiles = req.files;

    // Fetch existing images
    const existingImages = await PropertySchema.findById({
      _id: property_id,
    }).select("images");

    if (!existingImages) {
      return res.status(404).send("Property not found");
    }

    // Create a map for existing images by original name for quick lookup
    const existingImagesMap = new Map(
      existingImages?.images.map((img) => [img.original_name, img])
    );

    // Handle new image files
    const updatedImages = await Promise.all(
      imageFiles.map(async (imageFile) => {
        const originalName = imageFile.originalname.split(".")[0];

        // Check for duplicates
        if (existingImagesMap.get(originalName)) {
          return res.send(`Image with name ${originalName} already exists`);
        }

        try {
          const url = await uploadImageOnCloudinary(imageFile?.path);
          return {
            url: url?.secure_url,
            image_id: url?.public_id,
            original_name: url?.original_filename,
          };
        } catch (error) {
          console.error(
            `Failed to upload image ${imageFile.filename}: ${error.message}`
          );
          return null;
        }
      })
    );

    // Filter out any null values (failed uploads)
    const validUpdatedImages = updatedImages.filter((image) => image !== null);

    // Update property
    await PropertySchema.findByIdAndUpdate(
      property_id,
      {
        $set: {
          images: imageFiles
            ? [...validUpdatedImages, ...existingImages?.images]
            : existingImages?.images, // Combine updated and existing images
          ...req.body,
        },
      },
      { new: true } // Return the updated document
    );

    return res.status(200).send("Property updated successfully");
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// ---- create a controller a for just deleting the images
export const deleteImages = async (req, res) => {
  // --- get the property id from the URL
  // --- get all the existing images and
  // --- get the image public _ id from and delete the image from cloudinary and pull that image from images attribute
  try {
    const { property_id, image_public_id } = req.params;
    
    await deleteImageFromCloudinary([image_public_id]);

    await PropertySchema.findByIdAndUpdate(
      { _id: property_id },
      { $pull: { images: { image_id: image_public_id } } },
      { new: true }
    );

    return res.status(200).send("Image deleted successfully")

  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const deleteProperty = async (req, res) => {
  // -- get the property_id  from the parameter
  // -- once id is received  get the images attribute from the property
  // -- create an array from the by image.id and send to deleteImageFromCloudinary
  // --and then delete the image from the cloudinary and delete the property

  try {
    const { property_id } = req.params;

    const propertyImages = await PropertySchema.findById({
      _id: property_id,
    }).select("images -_id");

    const images_public_id = await Promise.all(
      propertyImages?.images.map((image) => {
        return image?.image_id;
      })
    );

    await deleteImageFromCloudinary(images_public_id);

    await PropertySchema.findByIdAndDelete({ _id: property_id });

    return res.status(200).send("Property deleted successfully");
  } catch (error) {
    return res.status(404).send(error.message);
  }
};
