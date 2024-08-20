import mongoose, { Schema } from "mongoose";

const propertySchema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    propertyType: {
      type: String,
      enum: ["Flat", "House", "GuestHouse", "Hotel"],
    },
    rooms_beds: {
      rooms: { type: String, required: true },
      beds: { type: String, required: true },
      bathrooms: { type: String, required: true },
    },
    totalGuests:{type: Number, required: true},
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country:{ type: String, required: true},
      zip: { type: String, required: true },
    },

    features: [
      {
        type: String,
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        image_id: { type: String, required: true },
        original_name:{ type: String, required: true}
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const PropertySchema = mongoose.model("Property", propertySchema);
