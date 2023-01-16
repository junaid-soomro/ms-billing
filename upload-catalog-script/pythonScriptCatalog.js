require("dotenv").config();
const express = require("express");
const request = require("umi-request").default;
const router = express.Router();
var fs = require("fs");

router.post("/", async (req, res) => {

    try {
  const { spawn } = require("child_process");
  const infrastructure = await spawn("python3", ["./upload-catalog-script/infrastructure.py"]);
  infrastructure.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
  }); 

  
  infrastructure.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
  });

  const products = await spawn("python3", ["./upload-catalog-script/products.py"]);
  products.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
  }); 

  products.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
  });


const infraCatalog = fs.readFileSync("./infrastructure.xml", "utf8");
const productCatalog = fs.readFileSync("./products.xml", "utf8");
// const storageCatalog = fs.readFileSync("./Storage.xml", "utf8");


    const infraCatalogUpload = await request.post(
      `${process.env.KILLBILL_ENDPOINT}/1.0/kb/catalog/xml`,
      {
        headers: {
        // Insert this key = ]C],Vv'wu37Ay?RR
          "X-Killbill-ApiKey": "X5#Y5UVm9`p$Vj^P",
          "X-Killbill-ApiSecret": "X5#Y5UVm9`p$Vj^P",
          "Content-Type": "text/xml",
          Accept: "application/json",
          "X-Killbill-CreatedBy": "admin",
          "X-Killbill-Reason": "admin",
          "X-Killbill-Comment": "admin",
          Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`
        },
        data: infraCatalog,
        getResponse: true
      }
    );
      
    if(!infraCatalogUpload.response.status === 201)
    throw "Infrastructure Catalog Exception"
   

    const productCatalogUpload = await request.post(
      `${process.env.KILLBILL_ENDPOINT}/1.0/kb/catalog/xml`,
      {
        headers: {
          // key = 	\eF-Mht27]kK,/-A
          "X-Killbill-ApiKey": "L)~G8dm:t_h7h6y<",
          "X-Killbill-ApiSecret": "L)~G8dm:t_h7h6y<",
          "Content-Type": "text/xml",
          Accept: "application/json",
          "X-Killbill-CreatedBy": "admin",
          "X-Killbill-Reason": "admin",
          "X-Killbill-Comment": "admin",
          Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`
        },
        data: productCatalog,
        getResponse: true
      }
    );
      
    if(!productCatalogUpload.response.status === 201)
    throw "Product Catalog Exception"

    // const storageUploadCatalog = await request.post(
    //   `${process.env.KILLBILL_ENDPOINT}/1.0/kb/catalog/xml`,
    //   {
    //     headers: {
    //       "X-Killbill-ApiKey": "X5#Y5UVm9`p$Vj^P",
    //       "X-Killbill-ApiSecret": "X5#Y5UVm9`p$Vj^P",
    //       "Content-Type": "text/xml",
    //       Accept: "application/json",
    //       "X-Killbill-CreatedBy": "admin",
    //       "X-Killbill-Reason": "admin",
    //       "X-Killbill-Comment": "admin",
    //       Authorization: `Basic ${process.env.KILLBILL_ADMIN_CREDENTIAL}`
    //     },
    //     data: storageCatalog,
    //     getResponse: true
    //   }
    // );
      
    // if(!storageUploadCatalog.response.status === 201)
    // throw "Storage Catalog Exception"
   
   

    res.status(200).json({ success: "Successfully Uploaded Catalog" });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  });


module.exports = router;
