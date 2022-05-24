var express = require('express');
var bodyParser = require('body-parser');
var database = require("./database/database")

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var port = 3003;
app.listen(port, () => { console.log(`listening on port ${port}`) });

var walletsRoute = require("./routes/wallets.js");
var coinsRoute = require("./routes/coin.js");

app.use("/wallets", walletsRoute);
app.use("/", coinsRoute);