var express = require("express");
var router = express.Router();
const schema = require("../schema/billingSchema");

require("dotenv").config();

let customerIds = [];
let currentDate = new Date().toISOString();

router.post("/addPromoCode", (req, res) => {
  if (!require("../mongoDbConnection").isConnected()) {
    res.status(500).json({ message: "MongoDB connection not running." });
    return;
  }

  const { name, value, expiry_date } = req.body;

  try {
    schema.promoCodeModel
      .create({
        name: name,
        value: value,
        created_date: currentDate,
        expiry_date: expiry_date,
      })
      .catch((err) => console.log(err));
    res.send("Successfully Promo-Code Added");
  } catch (ex) {
    res.send("not send");
    console.log(ex);
  }
});

router.post("/verifyPromoCode", async (req, res) => {
  if (!require("../mongoDbConnection").isConnected()) {
    res.status(500).json({ message: "MongoDB connection not running." });
    return;
  }

  const { userId, promoName, requestedDate } = req.body;
  let expiredPromoCode = false;

  var found = await schema.promoCodeModel
    .find({ name: promoName })
    .then((res) => {
      return res;
    })
    .catch((ex) => ex);

  var userFound = await schema.userDetailModel
    .find({ _id: userId })
    .then((res) => {
      return res;
    })
    .catch((ex) => ex);

  if (found.length > 0) {
    try {
      // userFound[0].credit
      let expired = new Date(requestedDate) > new Date(found[0].expiry_date);
      const Promocredit = found[0].value;

      if (expired) {
        expiredPromoCode = true;
        res.status(404).json({ message: "Promo code expired" });
        return;
      }

      if (!found[0].customerIds.includes(userId) && userFound[0]._id) {
        schema.promoCodeModel
          .updateOne(
            { name: promoName },
            { $set: { customerIds: [...found[0].customerIds, userId] } }
          )
          .then((res) => console.log("res in update = ", res))
          .catch((ex) => console.log("ex in update = ", ex));

        const totalCredit = userFound[0].credit + Promocredit;

        schema.userDetailModel
          .updateOne({ _id: userId }, { $set: { credit: Number(totalCredit) } })
          .then((res) => console.log("res in user", res))
          .catch((ex) => console.log("ex in user", ex));
        res.status(200).json({ message: "Promo credit given to user" });
      } else {
        res
          .status(404)
          .json({ message: "User has already used this promo code" });
      }
    } catch (ex) {
      res.status(404).json({ message: "User not found" });
    }
  } else {
    res.status(404).json({ message: "Promo code not found" });
  }
 
});

module.exports = router;
