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

//Update User Data
router.put("/editCompany/:id", verifyToken, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Company not exist");
  }

  //Updating the Company
  const companyNew = Company.findByIdAndUpdate(
    mongoose.Types.ObjectId(req.params.id),
    {
      // avatar: req.query.avatar,
      city: req.query.city,
      address: req.query.address,
      state: req.query.CompanyStateRes,
      zip: req.query.zipCode,
      website: req.query.website,
      managers: req.query.managersCompany,
      users: req.query.usersCompany,
      name: req.query.company_name,
      company_phone: req.query.company_phone,
      company_email: req.query.company_email,
      primary_contact: req.query.primary_contact_id,
    },
    { new: true }
  )
    .then((company) => {
      return res.status(200).send(company);
    })
    .catch((err) => {
      res.status(400).send("Error With Editing Company: " + err);
    });
});

module.exports = router;
