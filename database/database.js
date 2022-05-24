const mongoose = require("mongoose");

class Database {
    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect("mongodb://localhost:27017/cryptocurrency-db", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
            .then(() => { console.log("succecfully connect to db") })
            .catch(() => { console.log("failed to connect to db") });
    }
}

module.exports = new Database();