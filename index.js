const express = require("express");

const app = express();

const creditManagement = require("./routes/creditManagement");
const userRegistration = require("./routes/userRegistration");
const verification = require("./routes/verification");
const subscriptionAndInvoice = require("./routes/subscription");
const userLogin = require("./routes/userLogin");
const catalogparser = require("./routes/catalogparser");
const pythonScriptCatalog = require("./upload-catalog-script/pythonScriptCatalog");
const usageReportPricing = require("./routes/usageReportPricing");

const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));

const cors = require("cors");
require("dotenv").config();

require("./mongoDbConnection").initiliazeConnection();

app.use("/creditManagement", creditManagement);
app.use("/userRegistration", userRegistration);
app.use("/verification", verification);
app.use("/subscription", subscriptionAndInvoice);
app.use("/userLogin", userLogin);
app.use("/catalog-parser", catalogparser.router);
app.use("/pythonscriptCatalog", pythonScriptCatalog);
app.use("/usage-report", usageReportPricing);

app.listen(process.env.PORT, () => {
  console.log("Billing Service is running on port: " + process.env.PORT);
});
