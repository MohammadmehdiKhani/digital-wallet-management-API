var express = require("express");
var router = express.Router();
var time = require("../time");
var wallet = require("../database/walletSchema");
var coin = require("../database/coinSchema");

//post one coin to a wallet
router.post("/:name/coins", async (req, res) => {
    var walletName = req.params.name;
    var coinToCreate = req.body;

    if (!coinToCreate.name || !coinToCreate.symbol)
        return res.status(400).send({ code: 400, message: "coin name or symbol is empty" });

    var findedWallet;
    try {
        findedWallet = await wallet.findOne({ name: walletName }).populate("coins");
    }
    catch (err) {
        res.status(500).send({
            error: "Internal server error",
            code: 500
        });
    }

    if (!findedWallet)
        return res.status(404).send({ code: 404, message: "there is no wallet with this wallet name" })

    var findedWalletThatHaveThisCoin = findedWallet.coins.filter(c => c.name === coinToCreate.name || c.symbol === coinToCreate.symbol);

    if (findedWalletThatHaveThisCoin.length !== 0)
        return res.status(400).send({ code: 400, message: "this coin is already exists in this wallet" });

    var newCoin = await coin.create(coinToCreate);
    findedWallet.coins.push(newCoin._id);
    findedWallet.balance = findedWallet.balance + (newCoin.amount * newCoin.rate);
    findedWallet.last_updated = time.getDate();
    await findedWallet.save();

    return res.status(200).send({
        name: coinToCreate.name, symbol: coinToCreate.symbol,
        amount: coinToCreate.amount, rate: coinToCreate.rate,
        code: 200, message: "Coin added successfully!"
    });
});

//update one coin
router.put("/:name/:symbol", async (req, res) => {
    var walletName = req.params.name;
    var symbol = req.params.symbol;
    var newCoin = req.body;

    if (!walletName || !symbol)
        return res.status(400).send({ code: 400, message: "Wallet name or coin symbol is empty" });

    var findedWallet;
    try {
        findedWallet = await wallet.findOne({ name: walletName }).populate("coins");
    }
    catch (err) {
        res.status(500).send({
            error: "Internal server error",
            code: 500
        });
    }

    if (!findedWallet)
        return res.status(404).send({ code: 404, message: `There is no wallet with name ${walletName}` })

    var findedId;
    findedWallet.coins.forEach(async (c) => {
        if (c.symbol === symbol) {
            findedId = c._id;
        }
    });

    var findedCoin = await coin.findById(findedId);

    if (!findedCoin)
        return res.status(404).send({ code: 404, message: `There is no such coin with symbol ${symbol} in this wallet` })

    findedWallet.balance = findedWallet.balance + ((newCoin.amount * newCoin.rate) - (findedCoin.amount * findedCoin.rate));
    findedWallet.last_updated = time.getDate();
    await findedWallet.save();

    findedCoin.name = newCoin.name;
    findedCoin.symbol = newCoin.symbol;
    findedCoin.amount = newCoin.amount;
    findedCoin.rate = newCoin.rate;

    await findedCoin.save();

    return res.status(200).send({
        name: findedCoin.name, symbol: findedCoin.symbol,
        amount: findedCoin.amount, rate: findedCoin.rate,
        code: 200, message: "Coin updated successfully!"
    });
});

//delete one coin
router.delete("/:name/:symbol", async (req, res) => {
    var walletName = req.params.name;
    var symbol = req.params.symbol;

    if (!walletName || !symbol)
        return res.status(400).send({ code: 400, message: "Wallet name or coin symbol is empty" });

    var findedWallet;
    try {
        findedWallet = await wallet.findOne({ name: walletName }).populate("coins");
    }
    catch (err) {
        res.status(500).send({
            error: "Internal server error",
            code: 500
        });
    }

    if (!findedWallet)
        return res.status(404).send({ code: 404, message: `There is no wallet with name ${walletName}` })

    var findedId;
    findedWallet.coins.forEach(async (c) => {
        if (c.symbol === symbol) {
            findedId = c._id;
        }
    });

    var findedCoin = await coin.findById(findedId);

    if (!findedCoin)
        return res.status(404).send({ code: 404, message: `There is no such coin with symbol ${symbol} in this wallet` })

    var index = 0;
    findedWallet.coins.forEach(async (c) => {
        if (c.symbol === symbol) {
            findedWallet.coins.splice(index, 1)
        }
        index++;
    });

    findedWallet.balance = findedWallet.balance - (findedCoin.amount * findedCoin.rate);
    await findedWallet.save();

    await coin.findByIdAndDelete(findedCoin._id);

    return res.status(200).send({
        name: findedCoin.name, symbol: findedCoin.symbol,
        amount: findedCoin.amount, rate: findedCoin.rate,
        code: 200, message: "Coin deleted  successfully!"
    });
});


module.exports = router;