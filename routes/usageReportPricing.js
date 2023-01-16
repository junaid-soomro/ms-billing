var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
const eipPriceList = require("./eipList");
const pricingdata = require("./catalogparser");

const request = require("umi-request").default;

async function ecsWithPrice(body, flavor) {
  totalECS = body.payload.ecs;
  let ecsMode = Object.keys(totalECS);
  let ecsTotalPrice = 0;
  for (let mode in ecsMode) {
    let modePrice = 0;
    let totalOS = Object.keys(totalECS[ecsMode[mode]]);
    for (let os in totalOS) {
      let osPrice = 0;
      let totalSpecsType = Object.keys(totalECS[ecsMode[mode]][totalOS[os]]);
      for (let spec_type in totalSpecsType) {
        let specPrice = 0;

        for (let spec in totalECS[ecsMode[mode]][totalOS[os]][
          totalSpecsType[spec_type]
        ].data) {
          let valueToCompare = totalECS[ecsMode[mode]][totalOS[os]][
            totalSpecsType[spec_type]
          ].data[spec].children.name.replace(/ /g, "-");
          console.log("Value to Compare", valueToCompare);

          //Change oracle to ValueToCompare
          let ecsPrice = flavor.find(item => {
            if (item.name === valueToCompare) return item.price;
            else return null;
          });
          console.log(ecsPrice);

          // let price = flavor.find(item => {
          //   console.log(item.name);
          //   if (item.name.includes("ECS-Compute-1-1vCPU-1GB-Linux-On-Demand")) {
          //     return item.price;
          //   }
          // });

          // flavo

          //       .map(item => console.log(item))

          // await flavor
          //   .findOne({
          //     "flavor.name":
          //       totalECS[ecsMode[mode]][totalOS[os]][totalSpecsType[spec_type]]
          //         .data[spec].children.name
          //   })
          try {
            totalECS[ecsMode[mode]][totalOS[os]][
              totalSpecsType[spec_type]
            ].data[spec]["unit_price"] = parseFloat(
              Math.floor(ecsPrice.price)
            ).toFixed(2);
            totalECS[ecsMode[mode]][totalOS[os]][
              totalSpecsType[spec_type]
            ].data[spec]["total_price"] = parseFloat(
              parseFloat(
                (Math.floor(ecsPrice.price) *
                  totalECS[ecsMode[mode]][totalOS[os]][
                    totalSpecsType[spec_type]
                  ].data[spec].total_calculated) /
                  3.6e6
              ).toFixed(2)
            );
          } catch (err) {
            totalECS[ecsMode[mode]][totalOS[os]][
              totalSpecsType[spec_type]
            ].data[spec]["unit_price"] = 0;
            totalECS[ecsMode[mode]][totalOS[os]][
              totalSpecsType[spec_type]
            ].data[spec]["total_price"] = 0;
          }
          specPrice =
            specPrice +
            totalECS[ecsMode[mode]][totalOS[os]][totalSpecsType[spec_type]]
              .data[spec]["total_price"];
        }
        totalECS[ecsMode[mode]][totalOS[os]][totalSpecsType[spec_type]][
          "total_price"
        ] = parseFloat(specPrice).toFixed(2);

        osPrice = osPrice + specPrice;
      }
      totalECS[ecsMode[mode]][totalOS[os]]["total_price"] = parseFloat(
        osPrice
      ).toFixed(2);

      modePrice = modePrice + osPrice;
    }
    totalECS[ecsMode[mode]]["total_price"] = parseFloat(modePrice).toFixed(2);

    ecsTotalPrice = ecsTotalPrice + modePrice;
  }
  totalECS["total_price"] = parseFloat(ecsTotalPrice).toFixed(2);
  return {
    ...totalECS
  };
}

async function evsWithPrice(body, flavor) {
  let volumeTypeWithPrice = {};
  let total_evs_price = 0;

  for (let items in body.payload.evs) {
    let total_type_price = 0;
    let volumeWithPrice = [];

    // body.payload.evs(item => {
    //   item.maps
    // });

    // flavor.filter(item => {
    //   console.log(item.volume_type_name);
    // });

    for (let volume in body.payload.evs[items]) {
      let evsPrice = flavor.find(item => {
        if (item.name.includes("-SSD")) {
          return item.price;
        }
      });

      console.log(evsPrice);

      // await evs
      //   .findOne({
      //     "volume.evstype": body.payload.evs[items][volume].volume_type_name,
      //   })
      //   // .then((result) => {
      // if (result) {
      volumeWithPrice.push({
        ...body.payload.evs[items][volume],
        price: parseFloat(
          evsPrice.price * body.payload.evs[items][volume].totalGBUsed
        ).toFixed(2),
        unitPrice: evsPrice.price
      });
      total_type_price =
        total_type_price +
        evsPrice.price * body.payload.evs[items][volume].totalGBUsed;
      // }
      // res.send({ result: result });
      // })
      // .catch((ex) => {
      //    ("ex", ex);
      //   volumeWithPrice.push({ ...volume, price: 0, unitPrice: 0 });
      //   // res.send({ result: result });
      // });
    }

    volumeTypeWithPrice[volumeWithPrice[0]["volume_type_name"]] = {
      details: volumeWithPrice,
      total_price: parseFloat(total_type_price).toFixed(2)
    };
    total_evs_price = total_evs_price + total_type_price;
  }

  return {
    ...volumeTypeWithPrice,
    total_price: parseFloat(total_evs_price).toFixed(2)
  };
}

async function eipWithPrice(body, flavor) {
  //kill bill find here
  singleEipPrice = eipPriceList[0].elastic_ip.price;
  let eipDetails = [];
  let totalPrice = 0;
  eipDetails = body.payload.elasticip.map(item => {
    item["unit_price"] = process.env.ELASTIC_IP_PRICE !== undefined ? parseInt(process.env.ELASTIC_IP_PRICE) : 80;
    item['total_price'] = item['unit_price'] * Math.ceil(item.totalUsageCalculated/2.62e9);
    let evsPrice = [];
    flavor.filter(item => {
      if (item["unit_price"] == item["unit_price"]);
    });

    totalPrice = totalPrice + item["total_price"];
    return item;
  });
  return { details: eipDetails, total_price: totalPrice };
}

async function egressPricing(body,flavor){
try {
let price = flavor.find(item => item.name.includes('Egress')).price;        //Name should match case.


  let total_price = 0;
  if(body.payload.egress.length <= 0 ){
    
    return {paginatedEIPs : body.payload.egress , total_price : 0}
  }
  let egressDetails = body.payload.egress.paginatedEIPs.map(item=>{
//numeric value is bytes in 1 GB

    total_price = total_price + (item.BYTES / 1000000000) * price;
    Object.assign(item,{price : (item.BYTES / 1000000000) * price})

    return item;
  })

  return { paginatedEIPs: egressDetails, total_price: total_price, totalPages :body.payload.egress.totalPages };
}
catch(e){
  throw "Egress price calculation error";
}

}

router.post("/pricing", async (req, res) => {
  try {
    let { body } = req;
    console.log(pricingdata);

    // KillBill fetch function
    const flavor = await pricingdata
      .fetchingKillBillData()
      .then(res => {
        console.log("killbill response");
        return res;
      })
      .catch(ex => {
        console.log("killbill response ex = ", ex);
        return null;
      });
    

    if (Object.keys(body.payload).includes("evs")) {
      body.payload.evs = await evsWithPrice(body, flavor);
      // .then(res => {
      //   console.log("res in EVS = ", res);
      //   return res;
      // })
      // .catch(ex => {
      //   console.log("ex = ", ex);
      //   return null;
      // });
    }
    if (Object.keys(body.payload).includes("ecs")) {
      body.payload.ecs = await ecsWithPrice(body, flavor);
      // .then(res => {
      //   console.log("res in ECS = ", res);
      //   return res;
      // })
      // .catch(ex => {
      //   console.log("ex = ", ex);
      //   return null;
      // });
    }
    if (Object.keys(body.payload).includes("elasticip")) {
      body.payload.elasticip = await eipWithPrice(body, flavor);
      // .then(res => {
      //   console.log("res in elastic IP= ", res);
      //   return res;
      // })
      // .catch(ex => {
      //   console.log("ex = ", ex);
      //   return null;
      // });
    }
    if (Object.keys(body.payload).includes("egress")) {
      body.payload.egress = await egressPricing(body,flavor);
    }

    res.status(200).json({ ...body });
  } catch (ex) {
    console.log('body exception ',ex);
    res.status(404).json({
       message: typeof ex === 'string' ? ex : "Please contact Administrator" 
    });
  }
});

module.exports = router;
