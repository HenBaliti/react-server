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

  //Mapping the companies array and return only the *name* of the company and the *id*
  const map1 = companiesArray.map((company) => {
    console.log("Company:");
    console.log(company);

    return { name: company.name, _id: company._id };
  });

  res.status(200).send(map1);
});

//Get Company Data by company id
router.get("/getCompanyData", verifyToken, async (req, res) => {
  // console.log(req.body.companyID);
  // console.log(req.userID);

  const companyData = await Company.findById(
    mongoose.Types.ObjectId(req.query.companyID)
  );

  const primeManagerData = await User.findById(
    mongoose.Types.ObjectId(companyData.primary_contact_id)
  );

  // console.log(primeManagerData);
  // console.log(companyData);

  res.status(200).send({ companyData, primaryManagerData: primeManagerData });
});

module.exports = router;
