import express from "express";
import webpush from "web-push";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { initDatabase } from "./database.js";

const app = express();
const db = initDatabase();

const port = 4000;

if (!process.env.PUBLIC_KEY || !process.env.PRIVATE_KEY) {
  const keys = webpush.generateVAPIDKeys();
  throw new Error(
    "You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY " +
      "environment variables. Here are some generated keys:\n" +
      JSON.stringify(keys, null, 2) // nicely formatted output
  );
}

const email = process.env.VAPID_EMAIL;
const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;

webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);

app.use(cors());
app.use(express.json());

// const subscriptions = []; // Array to store subscriptions

app.post("/save-subscription", async (req, res) => {
  const newSubscription = req.body;
  await db.read();
  const { subscriptions } = db.data;
  const existingSubscription = subscriptions.find(
    (sub) => sub.endpoint === newSubscription.endpoint
  );
  if (!existingSubscription) {
    db.data.subscriptions.push(req.body);
    await db.write();
    console.log("/save-subscription");
    console.log(newSubscription);
    console.log(`Subscribing ${newSubscription.endpoint}`);
    res.json({ status: "Success", message: "Subscription saved!" });
  } else {
    res
      .status(400)
      .json({ status: "Error", message: "Subscription already exists!" });
  }
});

app.get("/send-notification", async (req, res) => {
  try {
    await db.read();
    const { subscriptions } = db.data;

    for (const subscription of subscriptions) {
      console.log(subscription);
      await webpush.sendNotification(subscription, "Hello world");
    }
    res.json({ status: "Success", message: "Message sent to push service" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res
      .status(500)
      .json({ status: "Error", message: "Failed to send notification" });
  }
});

// Route to remove a subscription
app.delete("/remove-subscription", async (req, res) => {
  const endpointToRemove = req.body.endpoint;
  await db.read();
  const { subscriptions } = db.data;
  const index = subscriptions.findIndex(
    (sub) => sub.endpoint === endpointToRemove
  );
  if (index !== -1) {
    subscriptions.splice(index, 1);
    await db.write();
    console.log("/remove-subscription");
    console.log(`Subscription removed: ${endpointToRemove}`);
    res.json({ status: "Success", message: "Subscription removed!" });
  } else {
    res
      .status(404)
      .json({ status: "Error", message: "Subscription not found" });
  }
});

app.post("/send-custom-notification", async (req, res) => {
  try {
    const notificationData = req.body;
    await db.read();
    const { subscriptions } = db.data;

    // Check if notification data contains required fields
    if (!notificationData.title || !notificationData.body) {
      res.status(400).json({
        status: "Error",
        message: "Notification data is missing required fields",
      });
      return;
    }

    // Send notification to all subscriptions
    for (const subscription of subscriptions) {
      // Validate subscription object
      if (!subscription.endpoint) {
        console.error("Invalid subscription:", subscription);
        continue; // Skip invalid subscription
      }

      // Send notification
      await webpush.sendNotification(
        subscription,
        JSON.stringify(notificationData)
      );
    }

    res.json({
      status: "Success",
      message: "Custom notification sent to all subscribers",
    });
  } catch (error) {
    console.error("Error sending custom notification:", error);
    res
      .status(500)
      .json({ status: "Error", message: "Failed to send custom notification" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}!`);
});
