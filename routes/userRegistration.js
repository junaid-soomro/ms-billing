var express = require("express");
var router = express.Router();
const request = require("umi-request").default;
const schema = require("../schema/billingSchema.js");
const constant = require("../constant");
const { FREE_CREDIT } = constant;

// let auth =
//   "Basic " +
//   new Buffer(
//     process.env.KILLBILL_ADMIN_USERNAME + ":" + process.env.KILLBILL_ADMIN_PASS
//   ).toString("base64");*

// API secret in tenant is null;

router.post("/", async (req, res) => {
  try {
    const { user_id, account_status } = req.body;
    if (!require("../mongoDbConnection").isConnected()) {
      res.status(500).json({ message: "Mongo DB not running" });
      return;
    }

    const tenantResponse = await request.post(
      `${process.env.KILLBILL_ENDPOINT}/1.0/kb/tenants`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Killbill-CreatedBy": "admin",
          Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`,
        },
        data: {
          apiKey: user_id,
          apiSecret: process.env.KILLBILL_API_SECRET,
        },
        getResponse: true,
      }
    );

    if (!tenantResponse.response.status === 201) {
      throw "Tenant Create Exception";
    }

    const accountResponse = await request.post(
      `${process.env.KILLBILL_ENDPOINT}/1.0/kb/accounts`,
      {
        headers: {
          "X-Killbill-ApiKey": user_id,
          "X-Killbill-CreatedBy": "admin",
          "X-Killbill-ApiSecret": process.env.KILLBILL_API_SECRET,
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`,
        },
        data: {
          currency: "USD",
          externalKey: user_id,
        },
        getResponse: true,
      }
    );
    if (!accountResponse.response.status === 201) {
      throw "Account Create Exception";
    }

    const fetchAccountId = await request.get(
      `${process.env.KILLBILL_ENDPOINT}/1.0/kb/accounts?externalKey=${user_id}`,
      {
        headers: {
          "X-Killbill-ApiKey": user_id,
          "X-Killbill-CreatedBy": "admin",
          "X-Killbill-ApiSecret": process.env.KILLBILL_API_SECRET,
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`,
        },
        getResponse: true,
      }
    );
    if (!fetchAccountId.response.status === 200) {
      throw "Fetch AccountID Exception";
    }

    const account_id = fetchAccountId.data.accountId;

    let amount = 0;
    account_status === "trial" ? (amount = 500.0) : (amount = 2500.0);

    const creditResponse = await request.post(
      `${process.env.KILLBILL_ENDPOINT}/1.0/kb/credits`,
      {
        headers: {
          "X-Killbill-ApiKey": user_id,
          "X-Killbill-CreatedBy": "admin",
          "X-Killbill-ApiSecret": process.env.KILLBILL_API_SECRET,
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`,
        },
        data: [
          {
            amount,
            currency: "USD",
            accountId: account_id,
          },
        ],
      }
    );
    if (!creditResponse[0]["amount"]) {
      throw "Credit Add Exception";
    }
    try {
      await schema.userDetailModel.create({
        _id: user_id,
        credit: "500",
      });

      res.status(200).json({ success: true, Invoice: creditResponse });
    } catch (ex) {
      res.status(500).json({ message: e });
      console.log(ex);
    }
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

module.exports = router;
