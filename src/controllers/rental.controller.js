import { RentalSchema } from "../models/rental.model.js";
import moment from "moment";
import { days_difference, format_Date } from "../utils/format_date.js";
import { PropertySchema } from "../models/property.model.js";



const propertyPrice = async(property_id)=>{
  try {
   const property_price =  await PropertySchema.findOne({_id: property_id}).select("price -_id")
   return property_price?.price
  } catch (error) {
    throw new Error("Error while getting the price of a property")
  }
}


export const rent_a_Property = async (req, res) => {
  // -- first check the status of the property and see if its rented and if yes then show the end_date when property will get free

  // --- get the property_id , user who wants to rent the property , start and end date
  // --- on the basis of start and end date send the total amount to the user

  try {
    const { property_id, tenant, start_date, end_date } = req.body;

    const formattedStartDate = format_Date(start_date);
    const formattedEndDate = format_Date(end_date);

    const booked_for_no_days = days_difference(formattedStartDate, formattedEndDate);

    // ---- valid date
    if (moment(formattedStartDate).isAfter(formattedEndDate)) {
      return res.status(400).send("Start date must be before end date");
    }

    const alreadyRented = await RentalSchema.findOne({
      property_id: property_id,
      status: "active",
      $or: [
        {
          start_date: { $eq: formattedStartDate },
          end_date: { $eq: formattedEndDate },
        },
        {
          start_date: { $lte: formattedEndDate },
          end_date: { $gte: formattedStartDate },
        },
      ],
    });

    if (alreadyRented) {
      const availableDate = moment(alreadyRented.end_date).format("YYYY-MM-DD");

      return res
        .status(404)
        .send(
          `Property is already rented will be avalible after ${availableDate}`
        );
    }


    // ---- Get the property price
    const property_price = await propertyPrice(property_id)

    const new_rent = new RentalSchema({
      property_id: property_id,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      tenant: tenant,
      total_cost:booked_for_no_days* property_price,
      status: "active",
    });

    await new_rent.save();

    return res.status(200).send("Property Rented successfully !!");

    // --- keep the rented_property for 90 days from the end date and if user rents the same property again with in  90 days
  } catch (error) {
    return res.status(404).send("Error: " + error.message);
  }
};

export const getTenantRentalHistory = async (req, res) => {
  // -- find the properties and check the end date of the property if end date is less than current date then just change the status of the property
  try {
    const { user_id } = req.params;

    const userRentalHistory = await RentalSchema.find({
      tenant: user_id,
    }).populate({
      path: "property_id",
    });

    const currentDate = new Date()

    userRentalHistory.forEach(async rented_date_passed => {
      if(rented_date_passed.end_date < currentDate ){
        rented_date_passed.status = "completed"

        await rented_date_passed.save()
      }
    });

    return res.status(200).json(userRentalHistory);
  } catch (error) {
    return res.status(404).send("Error: " + error.message);
  }
};
