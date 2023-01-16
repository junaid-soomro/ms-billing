require("dotenv").config();
const express = require("express");
const request = require("umi-request").default;
const schema = require("../schema/billingSchema.js");
const router = express.Router();


router.post("/", async (req, res) => {

  try {
    const { user_id } = req.body;
    if (!require("../mongoDbConnection").isConnected()) {
      res.status(500).json({ message: "Mongo DB not running" });
      return;
    }

    var userFound = await schema.userDetailModel
    .find({ _id: user_id})
    .then((res) => {
      return res;
    })
    .catch((ex) => ex);


    if(userFound.length > 0 ){
      //add credit
      //user found
    } else {
      console.log("user not found")
      res.send("user not found")
    }
    console.log("user Found : ", userFound[0].credit)
    res.send(userFound[0].credit);
    
  } catch (error) {
    
  }

});

  module.exports = router;
