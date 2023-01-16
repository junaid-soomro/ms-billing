var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
const request = require("umi-request").default;
let killBillReplacementJSON = require("../KillBillReplacement.json");

let killBillReplacementSchema = require("../schema/billingSchema");
var cors = require("cors");
var app = express();
app.use(cors());
app.use(bodyParser.json());

var data;
var pricingData = null;

let vcpu, ram, price, com;

var yrIndex;
var commitment;

var GBIndex;
var ramGB;

var specs;
var os_name;
var SKU;

async function fetchingKillBillData() {
  let result = null;

  try {
    const categoryKey = "detasad-cloud";

    var headers = {
      "X-Killbill-ApiKey": categoryKey,
      "X-Killbill-ApiSecret": categoryKey,
      Accept: "application/JSON",
      Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`
    };

    var fetchCategory = {
      url: `${process.env.KILLBILL_ENDPOINT}/1.0/kb/catalog`,
      headers: headers
    };

    result = await request.get(
      fetchCategory.url,
      { headers: fetchCategory.headers },
      function(error, response, body) {}
    );
    if (result) {
      pricingData = result[0].products.map(listItem => {
        yrIndex = listItem["name"].lastIndexOf("Yr");
        commitment = listItem["name"][yrIndex - 1];

        if (
          listItem["name"].includes("GB") &&
          listItem["name"].includes("vCPU")
        ) {
          specs =
            listItem["name"].split("-")[2].replace("GB", "") /
            listItem["name"].split("-")[1].replace("vCPU", "");

          vcpu = listItem["name"].split("-")[1].replace("vCPU", "");
          ram = listItem["name"].split("-")[2].replace("GB", "");
        }

        SKU = listItem["prettyName"];
        if (specs === 4) {
          specs = "G01";
        } else if (specs === 2) {
          specs = "G02";
        } else if (specs === 1) {
          specs = "C01";
        } else if (specs === 0.5) {
          specs = "C02";
        } else if (specs === 8) {
          specs = "M01";
        }

        if (listItem["name"].includes("WIN")) {
          os_name = "Windows";
        } else if (listItem["name"].includes("Linux")) {
          os_name = "Free Linux";
        } else if (listItem["name"].includes("RedHat")) {
          os_name = "Redhat";
        } else if (listItem["name"].includes("HANA")) {
          os_name = "HANA";
        } else if (listItem["name"].includes("Oracle")) {
          os_name = "Oracle";
        }

        if (listItem["name"].includes("On-Demand")) {
          return {
            name: listItem["name"],
            price:
              listItem["plans"][0]["phases"][0]["usages"][0]["tiers"][0][
                "blocks"
              ][0]["prices"][0]["value"],
            Softprice:
              listItem["plans"][0]["phases"][0]["usages"][0]["tiers"][0][
                "blocks"
              ][0]["prices"][1]["value"],
            vcpu: vcpu,
            ram: ram,
            com: "OD",
            mod: "MO",
            specs: specs,
            os_name: os_name,
            SKU: SKU
          };
        } else if (listItem["name"].includes("NoUpFront")) {
          if (commitment == 1) {
            return {
              name: listItem["name"],
              price: listItem["plans"][0]["phases"][0]["prices"][0]["value"],
              Softprice:
                listItem["plans"][0]["phases"][0]["prices"][1]["value"],
              vcpu: vcpu,
              ram: ram,
              mod: "1Y",
              com: "NU",
              specs: specs,
              os_name: os_name,
              SKU: SKU
            };
          } else if (commitment == 3) {
            return {
              name: listItem["name"],
              price: listItem["plans"][0]["phases"][0]["prices"][0]["value"],
              Softprice:
                listItem["plans"][0]["phases"][0]["prices"][1]["value"],
              vcpu: vcpu,
              ram: ram,
              mod: "3Y",
              com: "NU",
              specs: specs,
              os_name: os_name,
              SKU: SKU
            };
          }
        } else if (listItem["name"].includes("PartUpFront")) {
          if (commitment == 1) {
            return {
              name: listItem["name"],
              price: listItem["plans"][0]["phases"][0]["prices"][0]["value"],
              Softprice:
                listItem["plans"][0]["phases"][0]["prices"][1]["value"],
              vcpu: vcpu,
              ram: ram,
              mod: "1Y",
              com: "PU",
              specs: specs,
              os_name: os_name,
              SKU: SKU
            };
          } else if (commitment == 3) {
            return {
              name: listItem["name"],
              price: listItem["plans"][0]["phases"][0]["prices"][0]["value"],
              Softprice:
                listItem["plans"][0]["phases"][0]["prices"][1]["value"],
              vcpu: vcpu,
              ram: ram,
              mod: "3Y",
              com: "PU",
              specs: specs,
              os_name: os_name,
              SKU: SKU
            };
          }
        } else if (listItem["name"].includes("UpFront")) {
          if (commitment == 1) {
            return {
              name: listItem["name"],
              price: listItem["plans"][0]["phases"][0]["prices"][0]["value"],
              Softprice:
                listItem["plans"][0]["phases"][0]["prices"][1]["value"],
              vcpu: vcpu,
              ram: ram,
              mod: "1Y",
              com: "FU",
              specs: specs,
              os_name: os_name,
              SKU: SKU
            };
          } else if (commitment == 3) {
            return {
              name: listItem["name"],
              price: listItem["plans"][0]["phases"][0]["prices"][0]["value"],
              Softprice:
                listItem["plans"][0]["phases"][0]["prices"][1]["value"],
              vcpu: vcpu,
              ram: ram,
              mod: "3Y",
              com: "FU",
              specs: specs,
              os_name: os_name,
              SKU: SKU
            };
          }
        } else {
          return {
            name: listItem["name"],
            price: listItem["plans"][0]["phases"][0]["prices"][0]["value"],
            Softprice: listItem["plans"][0]["phases"][0]["prices"][1]["value"],
            SKU: SKU
          };
        }
      });
    }
  } catch (e) {
    if (!require("../mongoDbConnection").isConnected()) {
      console.log("Mongo DB is not connected");
    } else {
      let allData = await killBillReplacementSchema.killBillReplacementModel.find(
        {}
      );
      if (allData.length === 0) {
        let docs = await killBillReplacementSchema.killBillReplacementModel.insertMany(
          killBillReplacementJSON
        );
        if (docs) {
          console.log("docs = ", docs[0]);

          pricingData = docs;
        }
      } else if (allData.length > 0) {
        pricingData = allData;
      }
    }
  }

  return pricingData;
}

fetchingKillBillData()
  .then(res => {
    return res;
  })
  .catch(ex => {
    console.log("ex = ", ex);
    return null;
  });

router.post("/ecs-parsed", async (req, res) => {
  const categoryKey = req.headers.key;

  var headers = {
    "X-Killbill-ApiKey": categoryKey,
    "X-Killbill-ApiSecret": categoryKey,
    Accept: "application/JSON",
    Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`
  };

  var fetchCategory = {
    url: `${process.env.KILLBILL_ENDPOINT}/1.0/kb/catalog`,
    headers: headers
  };

  try {
    if (!require("../mongoDbConnection").isConnected()) {
      return res.status(500).json({ message: "Mongo DB not running" });
    }
    if (pricingData) {
      if (req.body.list) {
        const flavorData = req.body.list.map(listItem => {
          let nameAsInKillBill = listItem.name.replace(/ /g, "-");
          let filterKillBillDetails = pricingData.find(
            item => item.name === nameAsInKillBill
          );

          if (filterKillBillDetails) {
            return {
              ...listItem,
              price: filterKillBillDetails.price
            };
          } else {
            return {
              ...listItem,
              price: 0
            };
          }
        });
        res.status(200).json({ data: { body: flavorData } });
      } else {
        res.status(200).json(pricingData);
      }
    } else {
      console.log("Neither Billing Service nor DB is running");

      return res.status(404).json({ message: "Please Contact Administrator" });
    }
  } catch (error) {}
  return null;
});
module.exports = { router, fetchingKillBillData };
