import Stripe from "stripe";
import dotenv from "dotenv";
import { PaymentSchema } from "../models/payment.model.js";
import { PropertySchema } from "../models/property.model.js";

dotenv.config();

const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY));

export const getPropertyOwner = async (propertyId) => {
  try {
    if (!propertyId) {
      throw new Error("No property specified");
    }

    const query = { _id: propertyId };

    const property = await PropertySchema.findOne(query).populate("owner", {
      email: 1,
    });

    if (!property || !property.owner) {
      throw new Error("Property owner not found");
    }

    return property.owner;
  } catch (error) {
    console.error(error.message);
    return null; // return null if there's an error
  }
};


export const checkOutSession = async (req, res) => {
  // --- verify token and you will receive the user_Id
  try {
    const {
      propertyId,
      propertyName,
      propertyDescription,
      propertyImages,
      totalAmount,
      startDate,
      endDate,
    } = req.body;

    const customer = await stripe.customers.create({
      metadata: {
        userId: req.user_Id,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      phone_number_collection: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: propertyName,
              images: [...propertyImages],
              description: propertyDescription,
            },
            unit_amount: totalAmount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer: customer?.id,
      success_url: `${process.env.CLIENT_URL}/SuccessFullCheckOut/${propertyId}/${startDate}/${endDate}`,
      cancel_url: `${process.env.CLIENT_URL}/FailedCheckOut`,
      metadata: {
        propertyId: propertyId, // Adding propertyId at the session level
      },
    });

    console.log(session);

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

export const webhook = async (req, res) => {
  let data;
  let eventType;

  const WebhookSecret = String(process.env.WEBHOOK_SECRET);

  if (WebhookSecret !== "") {
    let event;
    let signature = req.headers["stripe-signature"];
    console.log(signature);

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        WebhookSecret
      );

      data = event.data.object;
      eventType = event.type;
    } catch (err) {
      console.error(
        `⚠️  Webhook signature verification failed: ${err.message}`
      );
      return res.sendStatus(400);
    }
  } else {
    data = req.body.data.object;
    eventType = req.body.type;
  }

  if (eventType === "checkout.session.completed") {
    stripe.customers
      .retrieve(data.customer)
      .then(async (customer) => {
        try {
          const owner = await getPropertyOwner(data?.metadata?.propertyId);

          if (owner?.email) {
            const paymentSchemma = new PaymentSchema({
              propertyId: data?.metadata?.propertyId,
              owner: owner.email, // Using the correct owner email
              tenant: customer.email,
              totalAmount: data?.amount_total / 100,
              customerId: customer?.id,
              tenantPhoneNumber: customer?.phone,
            });

            await paymentSchemma.save();

            return res
              .status(200)
              .json({ message: "Payment successful", payment: paymentSchemma });
          } else {
            return res.status(400).send("Property owner not found.");
          }
        } catch (err) {
          console.error("Error processing order: ", err);
          return res.status(500).send("Error processing order.");
        }
      })
      .catch((err) =>
        console.error("Customer retrieval failed: ", err.message)
      );
  }

  res.status(200).end();
};

