const mongoose = require("mongoose");
require("dotenv").config();

function isConnected() {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  return false;
}

function initiliazeConnection() {
  mongoose
    .connect(process.env.BILLING_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((result) => console.log("Successfully connected to ms-billing"))
    .catch((error) => console.log("catch", error));

  mongoose
    .connect(process.env.KILLBILL_REPLACEMENT_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((result) =>
      console.log("Successfully connected to killbill_replacement")
    )
    .catch((error) => console.log("catch", error));
}

module.exports = { isConnected, initiliazeConnection };
