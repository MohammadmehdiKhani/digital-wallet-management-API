var express = require("express");
var router = express.Router();
var fs = require("fs");
var time = require("../time");
var wallet = require("../database/walletSchema");
var coin = require("../database/coinSchema");

//post one wallet
router.post("/", async (req, res) => {
    var walletToCreate = req.body;

    if (!walletToCreate.name)
        return res.status(400).send({ code: 400, message: "Wallet name can not be empty" });

    walletToCreate.last_updated = time.getDate();

    var newWallet;

    try {
        var findedWallet = await wallet.findOne({ name: walletToCreate.name });

        if (findedWallet)
            return res.status(400).send({ code: 400, message: "Wallet with this name already exists" });

        newWallet = await wallet.create(walletToCreate);
    }
    catch (error) {
        res.status(500).send({
            error: "Internal server error",
            code: 500
        });
    }

    return res.status(201).send({
        name: newWallet.name, balance: newWallet.balance,
        coins: newWallet.coins, last_updated: newWallet.last_updated,
        code: 201, message: "Wallet added successfully!"
    });
});

//get all wallets
router.get("/", async (req, res) => {
    var wallets;
    try {
        wallets = await wallet.find()
            .populate("coins", "-_id -__v")
            .select("-_id -__v");
    }
    catch (err) {
        return res.send({ code: 500, message: "Internal server error" });
    }

    return res.send({ size: wallets.length, wallets: wallets, code: 200, message: "All wallets received successfully!" });
});

//update one wallet
router.put("/:name", async (req, res) => {
    var name = req.params.name;
    var newName = req.body.name;

    if (!newName)
        return res.status(400).send({ code: 400, message: "Wallet name can not be empty" });

    var walletToUpdate;
    try {
        walletToUpdate = await wallet.findOne({ name: name })
            .populate("coins", "-_id -__v")
    }
    catch (err) {
        return res.send({ code: 500, message: "Internal server error" });
    }

    if (!walletToUpdate)
        return res.status(404).send({ code: 404, message: `There is no wallet with name "${name}"` });

    walletToUpdate.name = newName;
    walletToUpdate.last_updated = time.getDate();
    await walletToUpdate.save();

    return res.send({
        name: walletToUpdate.name, balance: walletToUpdate.balance,
        coins: walletToUpdate.coins, last_updated: walletToUpdate.last_updated,
        code: 200, message: "Wallet name changed successfully!"
    });
});

//get one wallet
router.get("/:name", async (req, res) => {
    var name = req.params.name;

    var findedWallet;
    try {
        findedWallet = await wallet.findOne({ name: name })
            .populate("coins", "-_id -__v")
    }
    catch (err) {
        return res.send({ code: 500, message: "Internal server error" });
    }

    if (!findedWallet)
        return res.status(404).send({ code: 404, message: `There is no wallet with name "${name}"` });

    return res.send({
        name: findedWallet.name, balance: findedWallet.balance,
        coins: findedWallet.coins, last_updated: findedWallet.last_updated,
        code: 200, message: "All coins received successfully!"
    });
});

//delete one wallet
router.delete("/:name", async (req, res) => {
    var name = req.params.name;

    if (!name)
        return res.status(400).send({ code: 400, message: "Wallet name can not be empty" });

    var findedWallet;
    try {
        findedWallet = await wallet.findOne({ name: name })
            .populate("coins", "-_id -__v")
    }
    catch (err) {
        return res.send({ code: 500, message: "Internal server error" });
    }

    if (!findedWallet)
        return res.status(404).send({ code: 404, message: `There is no wallet with name "${name}"` });

    var myWallet;
    try {
        myWallet = await wallet.findOne({ name: name })
            .populate("coins")
    }
    catch (err) {
        return res.send({ code: 500, message: "Internal server error" });
    }

    myWallet.coins.forEach(async (c) => {
        await coin.findByIdAndDelete(c._id)
    });

    await wallet.findByIdAndDelete(findedWallet._id);

    return res.send({
        name: findedWallet.name, balance: findedWallet.balance,
        coins: findedWallet.coins, last_updated: findedWallet.last_updated,
        code: 200, message: "Wallet deleted (logged out) successfully!"
    });
});

module.exports = router;