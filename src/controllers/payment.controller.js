import Stripe from "stripe";
import dotenv from "dotenv";
import { format_Date } from "../utils/format_date.js";

dotenv.config();

const stripe = new Stripe(
  String(process.env.STRIPE_SECRET_KEY)
);

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
      endDate
    } = req.body;

    const formatedStartDate = format_Date(startDate,true)
    const formattedEndDate = format_Date(endDate,true)

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
      success_url: `${process.env.CLIENT_URL}/SuccessFullCheckOut/${propertyId}/${formatedStartDate}/${formattedEndDate}`,
      cancel_url: `${process.env.CLIENT_URL}/FailedCheckOut`,
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
      // Verify and construct the event using the raw body and Stripe webhook secret
      event = stripe.webhooks.constructEvent(
        req.body, // this should be the raw body, not a parsed JSON object
        signature,
        WebhookSecret
      );

      // Extract the data and event type
      data = event.data.object;
      eventType = event.type;
    } catch (err) {
      // If verification fails, log the error and return a 400 response
      console.error(
        `⚠️  Webhook signature verification failed: ${err.message}`
      );
      return res.sendStatus(400);
    }
  } else {
    // If no secret, use parsed body (only for development, not recommended for production)
    data = req.body.data.object;
    eventType = req.body.type;
  }

  // Handle specific events, e.g., checkout.session.completed
  if (eventType === "checkout.session.completed") {
    stripe.customers
      .retrieve(data.customer)
      .then(async (customer) => {
        try {
          // Log customer info and process the order
          console.log("DATA", data);
          console.log("CUSTOMER: ", customer);
          // createOrder(customer, data); // Assuming you have a createOrder function
        } catch (err) {
          console.error("Error processing order: ", err);
        }
      })
      .catch((err) =>
        console.error("Customer retrieval failed: ", err.message)
      );
  }

  // Send a response to acknowledge receipt of the webhook
  res.status(200).end();
};
