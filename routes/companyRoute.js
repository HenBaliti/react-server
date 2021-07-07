const express = require("express");
const mongoose = require("mongoose");
const Company = mongoose.model("Company");
const User = mongoose.model("User");
const router = express.Router();
const verifyToken = require("../helper/jwt");
const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
const SALTROUNDS = 10;

//Get all the companies of a user by getting the user id and token
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

  try {
    const companyData = await Company.findById(
      mongoose.Types.ObjectId(req.query.companyID)
    );

    const primeManagerData = await User.findById(
      mongoose.Types.ObjectId(companyData.primary_contact_id)
    );

    // console.log(primeManagerData);
    // console.log(companyData);

    res.status(200).send({ companyData, primaryManagerData: primeManagerData });
  } catch (err) {
    res.status(500).send(err);
  }
});

//Get All Users Of specific Company
router.get("/getCompanyUsers", verifyToken, async (req, res) => {
  const companyData = await Company.findById(
    mongoose.Types.ObjectId(req.query.companyID)
  )
    .populate("managers")
    .populate("users")
    .then((companyData) => {
      res.status(200).send({
        CompanyManagers: companyData.managers,
        CompanyUsers: companyData.users,
      });
    });
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

//Add To Existing Company A New User
router.post("/createNewUser/:id", verifyToken, async (req, res) => {
  const created_at = new Date().getTime();
  const { first_name, last_name, email, password, job_title, phone, typeUser } =
    req.query;
  const avatar = "Default image uri";

  //Find the company By The specific ID
  const company = await Company.findById(
    mongoose.Types.ObjectId(req.params.id)
  );

  //Hashing the password
  bcrypt.hash(password, SALTROUNDS, async (err, hashedPass) => {
    if (err) {
      console.log("There was an error with hashing the pass : \n");
      console.log(err);
    }

    try {
      //Building the new user
      const user = new User({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: hashedPass,
        job_title: job_title,
        phone: phone,
        avatar: avatar,
        created_at: created_at,
        companies: new Array(),
      });

      //Checking the type of the user
      if (typeUser == "Manager") {
        // insert for the company the id of the user-manager
        company.managers.push(mongoose.Types.ObjectId(user._id));
      } else {
        // insert for the company the id of the user-regular
        if (company.users != null) {
          company.users.push(mongoose.Types.ObjectId(user._id));
        } else {
          company.users = new Array(mongoose.Types.ObjectId(user._id));
        }
      }

      // insert for the new user the id of the managed company
      user.companies.push(mongoose.Types.ObjectId(company._id));

      await company.save();
      await user.save();

      // const token = jwt.sign({ userId: user._id }, MY_SECRET_KEY);
      res.status(200).send(user);
    } catch (err) {
      return res.status(422).send(err.message);
    }
  });
});

//Get all the companies of a user by getting the user id and token
router.get("/getAllCompanies", verifyToken, async (req, res) => {
  const companiesArr = await Company.find().then((companies) => {
    res.status(200).send(companies);
  });
});

//Delete Company and all her references in the users
router.delete("/delete/:id", verifyToken, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Exeption occured.\nPlease try again later",
    });
  }

  Company.deleteOne({
    _id: mongoose.Types.ObjectId(req.params.id),
  })
    .then(function () {
      //Removing the company from all the users who have this company
      User.updateMany(
        {},
        {
          $pull: {
            companies: mongoose.Types.ObjectId(req.params.id),
          },
        },
        { multi: true }
      ).then(() => {
        return res
          .status(200)
          .json({ success: true, message: "The Company has been deleted" });
      });
    })
    .catch(function (error) {
      return res
        .status(404)
        .json({ success: false, message: "Cannot find the Company" });
    });
});

//Create New Company
router.post("/createNewCompany", verifyToken, async (req, res) => {
  const created_at = new Date().getTime();
  const {
    name,
    company_phone,
    company_email,
    city,
    address,
    state,
    zip,
    website,
  } = req.query;

  try {
    //Building the company managed by this user
    const company = new Company({
      name,
      avatar:
        "https://i2.wp.com/www.iedunote.com/img/23559/what-is-a-company-scaled.jpg?fit=2560%2C1696&quality=100&ssl=1",
      city,
      address,
      state,
      zip,
      company_phone,
      company_email,
      website,
      users: new Array(),
      managers: new Array(),
      created_at: created_at,
    });

    await company.save();

    res
      .status(200)
      .send({ status: "Success", message: "Company Created Successfully" });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

module.exports = router;
