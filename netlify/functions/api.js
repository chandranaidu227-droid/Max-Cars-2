const serverless = require("serverless-http");
const { config } = require("../../backend/src/config");
const { createApp } = require("../../backend/src/app");
let handler;
exports.handler = async (event, context) => {
  handler ||= serverless(createApp(config()));
  return handler(event, context);
};
