const mongoose = require("mongoose");
const serverless = require("serverless-http");
const { config } = require("../../backend/src/config");
const { createApp } = require("../../backend/src/app");

let connectionPromise;

async function connect(settings) {
  if (mongoose.connection.readyState === 1) return;
  connectionPromise ||= mongoose.connect(settings.mongoUri);
  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = undefined;
    throw error;
  }
}

let cachedHandler;

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const settings = config();
  await connect(settings);
  cachedHandler ||= serverless(createApp(settings));
  return cachedHandler(event, context);
};
