const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const coinSchema = new Schema({
    name: { type: String },
    symbol: { type: String },
    amount: { type: Number },
    rate: { type: Number }
});

const coin = mongoose.model("coin", coinSchema);

module.exports = coin;