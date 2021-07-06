const express = require("express");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Company = mongoose.model("Company");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../helper/jwt");
const SALTROUNDS = 10;
const jwt_decode = require("jwt-decode");

const MY_SECRET_KEY = process.env.SECRET_KEY;

router.post("/signup", async (req, res) => {
  const created_at = new Date().getTime();
  const { first_name, last_name, email, password, job_title, phone } = req.body;
  const avatar = "Default image uri";

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
      });

      //Building the company managed by this user
      const company = new Company({
        name: `${first_name} ${last_name}'s Company`,
        avatar:
          "https://i2.wp.com/www.iedunote.com/img/23559/what-is-a-company-scaled.jpg?fit=2560%2C1696&quality=100&ssl=1",
        city: "",
        address: "",
        state: "",
        zip: "",
        company_phone: "",
        company_email: "",
        website: "",
        users: new Array(),
        primary_contact_id: user._id,
        created_at: created_at,
      });

      // insert for the new company the id of the user-manager
      company.managers.push(mongoose.Types.ObjectId(user._id));

      // insert for the new user the id of the managed company
      user.companies.push(mongoose.Types.ObjectId(company._id));

      await company.save();
      await user.save();

      const token = jwt.sign({ userId: user._id }, MY_SECRET_KEY);
      res.send({ token, user });
    } catch (err) {
      return res.status(422).send(err.message);
    }
  });
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send({ error: "Must provide email and password" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send({ error: "Invalid email" });
  }

  //check if the password is correct
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ userId: user._id }, MY_SECRET_KEY);
    res.status(200).send({ user: user, token: token });
  } else {
    res.status(401).send("Invalid password or email");
  }
});

//Get User Data By Token
router.get("/getUserData/:token", verifyToken, async (req, res) => {
  var decoded = jwt_decode(req.params.token);

  try {
    const user = await User.findById(mongoose.Types.ObjectId(decoded.userId));
    res.status(200).send({ user: user });
  } catch (err) {
    res.status(400).send(err);
  }
});

//Get User Data By userID
router.get("/getUserDataById/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(mongoose.Types.ObjectId(req.params.id));
    res.status(200).send({ user: user });
  } catch (err) {
    res.status(400).send(err);
  }
});

//Update User Data
router.put("/editUser/:id", verifyToken, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("User not exist");
  }

  let newPass = "";

  //Checking if the user editing the password
  if (req.query.newPassword != "") {
    //Hashing the password
    bcrypt.hash(req.query.newPassword, SALTROUNDS, (err, hashedPass) => {
      if (err) {
        console.log("There was an error with hashing the pass : \n");
        console.log(err);
      }
      newPass = hashedPass;

      //Updating the user
      const user = User.findByIdAndUpdate(
        mongoose.Types.ObjectId(req.params.id),
        {
          first_name: req.query.firstName,
          last_name: req.query.lastName,
          email: req.query.email,
          password: newPass,
          job_title: req.query.jobTitle,
          phone: req.query.phone,
        },
        { new: true }
      )
        .then((user) => {
          console.log(user);
          return res.status(200).send(user);
        })
        .catch((err) => {
          res.status(400).send("Error With Editing User: " + err);
        });
    });
  } else {
    newPass = req.query.oldPassword;

    //Updating the user
    const user2 = User.findByIdAndUpdate(
      mongoose.Types.ObjectId(req.params.id),
      {
        first_name: req.query.firstName,
        last_name: req.query.lastName,
        email: req.query.email,
        password: newPass,
        job_title: req.query.jobTitle,
        phone: req.query.phone,
      },
      { new: true }
    )
      .then((user) => {
        console.log(user);
        return res.status(200).send(user);
      })
      .catch((err) => {
        res.status(400).send("Error With Editing User: " + err);
      });
  }
});

//Delete user
router.delete("/delete/:id", verifyToken, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Exeption occured.\nPlease try again later",
    });
  }

  User.deleteOne({
    _id: mongoose.Types.ObjectId(req.params.id),
  })
    .then(function () {
      //Removing the user from this company
      Company.updateOne(
        {},
        {
          $pull: {
            managers: mongoose.Types.ObjectId(req.params.id),
            users: mongoose.Types.ObjectId(req.params.id),
          },
        },
        { multi: true }
      ).then(() => {
        return res
          .status(200)
          .json({ success: true, message: "The User has been deleted" });
      });
    })
    .catch(function (error) {
      return res
        .status(404)
        .json({ success: false, message: "Cannot find the User" });
    });
});

module.exports = router;
