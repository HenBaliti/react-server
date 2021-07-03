const express = require("express");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const router = express.Router();

router.post("/signup", async (req, res) => {
    const created_at = new Date().getTime();
  const { first_name, last_name, email, password, job_title, phone } = req.body;
  const avatar = "Default image uri";
  try {
    const user = new User({
      first_name:first_name,
      last_name:last_name,
      email:email,
      password:password,
      job_title:job_title,
      phone:phone,
      avatar:avatar,
      created_at:created_at
    });

    await user.save();
    
    // const company = new Company({name:`${first_name} ${last_name}` , avatar ,phone, email , created_at })

    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(422).send({ error: "Must provide email and password" });
    }
  
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(422).send({ error: "Invalid email" });
    }
  
    try {
      await user.comparePassword(password);
      const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
      const userID = user.id;
      res.send({
        token,
        userID,
        name: user.name,
        phone: user.phone,
        image: user.imageUrl,
        favIds: user.favorite,
      });
    } catch (err) {
      return res.status(422).send({ error: "Invalid password or email" });
    }
  });

  module.exports = router;
