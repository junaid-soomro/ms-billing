require("dotenv").config();
const express = require("express");
const request = require("umi-request").default;
const router = express.Router();
var fs = require("fs");

const catalog = fs.readFileSync(__dirname + "/AllProducts.xml", "utf8");
router.post("/catalogUpload", async (req, res) => {
  const { user_id } = req.body;
  try {
    const upload_xml = await request.post(
      `${process.env.KILLBILL_ENDPOINT}/1.0/kb/catalog/xml`,
      {
        headers: {
          "X-Killbill-ApiKey": user_id,
          "X-Killbill-ApiSecret": process.env.KILLBILL_API_SECRET,
          "Content-Type": "text/xml",
          Accept: "application/json",
          "X-Killbill-CreatedBy": "admin",
          "X-Killbill-Reason": "admin",
          "X-Killbill-Comment": "admin",
          Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`
        },
        data: catalog,
        getResponse: true
      }
    );
    res.status(201).json(upload_xml);
  } catch (error) {
    res.status(400).json({ error: error.data.message });

  }
});

router.post("/", async (req, res) => {
  const { user_id, planName, objectType, name, value } = req.body[0];
  try {
    const fetch_account_id = await request.get(
      `${process.env.KILLBILL_ENDPOINT}/1.0/kb/accounts?externalKey=${user_id}`,
      {
        headers: {
          "X-Killbill-ApiKey": user_id,
          "X-Killbill-CreatedBy": "admin",
          "X-Killbill-ApiSecret": process.env.KILLBILL_API_SECRET,
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`
        },
        getResponse: true
      }
    );
    const accountId = fetch_account_id.data.accountId;

    const create_subscription = await request.post(
      `${process.env.KILLBILL_ENDPOINT}/1.0/kb/subscriptions`,
      {
        headers: {
          "X-Killbill-ApiKey": user_id,
          "X-Killbill-ApiSecret": process.env.KILLBILL_API_SECRET,
          "X-Killbill-CreatedBy": "admin",
          Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`
        },
        data: {
          accountId,
          planName: planName
        },
        getResponse: true
      }
    );

    const url = create_subscription.response.headers._headers.location[0];
    const subscriptionId = url.split("subscriptions/")[1];

    const fetch_invioce_id = await request.get(
      `${process.env.KILLBILL_ENDPOINT}/1.0/kb/accounts/${accountId}/invoices`,
      {
        headers: {
          "X-Killbill-ApiKey": user_id,
          "X-Killbill-ApiSecret": process.env.KILLBILL_API_SECRET,
          Accept: "application/json",
          Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`
        },
        getResponse: true
      }
    );

    const invoices = fetch_invioce_id.data;

    const filterdInvoices = invoices.filter(a => {
      if (a.creditAdj === 0) {
        return a;
      }
    });
    var invoice_id;
    var finalcheck = filterdInvoices.filter(obj => {
      return obj.items.find(a => {
        if (a.subscriptionId === subscriptionId) {
          invoice_id = a.invoiceId;
        }
      });
    });
    var invoiceId = invoice_id;

    const custom_field = await request.post(
      `${process.env.KILLBILL_ENDPOINT}/1.0/kb/accounts/${invoiceId}/customFields`,
      {
        headers: {
          "X-Killbill-ApiKey": user_id,
          "X-Killbill-ApiSecret": process.env.KILLBILL_API_SECRET,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Killbill-CreatedBy": "admin",
          "X-Killbill-Reason": "demo",
          "X-Killbill-Comment": "demo",
          Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`
        },
        data: [
          {
            objectType: objectType,
            name: name,
            value: value
          }
        ],
        getResponse: true
      }
    );

    return res.status(201).json({
      fetch_account_id,
      create_subscription,
      fetch_invioce_id,
      custom_field
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
