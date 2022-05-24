const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const walletSchema = new Schema({
    name: { type: String },
    balance: { type: Number, default: 0 },
    coins: [{ type: Schema.Types.ObjectId, ref: "coin" }],
    last_updated: { type: String }
});

const wallet = mongoose.model("wallet", walletSchema);

module.exports = wallet;