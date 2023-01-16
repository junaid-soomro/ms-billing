const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const promoCode = new Schema({
  name: String,
  created_date: { type: Date, default: Date.now },
  expiry_date: { type: Date, default: Date.now },
  value: Number,
  customerIds: [Number],
});

const userDetails = new Schema({
  _id: String,
  name: String,
  credit: Number,
});

const KillBillReplacementSchema = new Schema({
  name: String,
  price: Number,
  Softprice: Number,
  vcpu: String,
  ram: String,
  mod: String,
  com: String,
  specs: String,
  os_name: String,
  SKU: String,
});

var promoCodeModel = mongoose.model("PromoCodeDetails", promoCode);
var userDetailModel = mongoose.model("userDetails", userDetails);
let killBillReplacementModel = mongoose.model(
  "killbill_replacements",
  KillBillReplacementSchema
);
module.exports = { userDetailModel, promoCodeModel, killBillReplacementModel };
