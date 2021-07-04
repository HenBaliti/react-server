const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");

//Import Models
require("./models/User");
require("./models/Company");
// require('./models/Invitation');

//Enable CORS policy
app.use(cors());
app.options("*", cors());

//Access to .env file (use for save global variables - UNMODIFED)
dotenv.config();
const mongoUri = process.env.DATABASE_ACCESS;

//Mongo DB - Connection
mongoose.connect(mongoUri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to mongoDB instance");
});
mongoose.connection.on("error", (err) => {
  console.error("Error with connecting to mongo", err);
});

//Body - Parser
app.use(express.json());

//Routes
const userRoutes = require("./routes/userRoute");
const companyRoutes = require("./routes/companyRoute");

//Routes Relative to the first argument string
app.use("/users", userRoutes);
app.use("/companies", companyRoutes);

app.listen(4000, () => {
  console.log("Server is up and listening on port 4000");
});
