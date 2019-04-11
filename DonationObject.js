
//#region Modules

var mongoose = require("mongoose");

var schema = mongoose.Schema;

//#endregion

//#region Model

var DonationObject = new schema({
    Name : {
        type: String,
        required: true
    },
    Photo: {
        type: Buffer,
        required: true
    },
    Description: {
        type: String,
        required: false
    },
    Condition: {
        type: String,
        required: false
    },
    UserID: {
        type: schema.ObjectId,
        required: false
    },    
    UserName: {
        type: String,
        required: false
    }    
});



//#endregion

//#endregion

var DonationObject = mongoose.model("DonationObject",DonationObject);
module.exports = DonationObject;