const express = require("express");
const mongoose = require("mongoose");
const Company = mongoose.model("Company");
const User = mongoose.model("User");
const router = express.Router();
const verifyToken = require("../helper/jwt");

//Get all the companies by getting the user id and token
router.get("/getCompanies", verifyToken, async (req, res) => {
  console.log("Got here");
  console.log(req.userID);

  const companiesArray = await User.findById(
    mongoose.Types.ObjectId(req.userID)
  )
    .populate("companies")
    .then((theUser) => {
      return theUser.companies;
    });

  console.log(companiesArray);

  //Mapping the companies array and return only the *name* of the company and the *id*
  const map1 = companiesArray.map((company) => {
    return { name: company.name, _id: company._id };
  });
  console.log("-------------------\n");
  console.log(map1);

  res.status(200).send(map1);
});

module.exports = router;
