
//#region Constants

const UserProfile = require('../controller/UserProfileController');
const UserAuthentication = require('../controller/UserAuthenticationController');
const DonationObject = require('../controller/DonationController');

//#endregion

//#region Function

module.exports = function(app) {
   UserProfile(app);
   UserAuthentication(app);
   DonationObject(app);
};

//#endregion
