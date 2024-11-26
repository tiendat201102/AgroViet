require('dotenv').config();
const express = require('express');
const configViewEngine = require('./config/viewEngine');
const userRouterAPI = require('./routes/userAPI');
const adminRouterAPI = require("./routes/adminAPI")
const connection = require('./config/database');
const { getHomepage } = require('./controllers/homeController');
const cors = require("cors");

// const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 8888;

//config cors
app.use(cors());

//config req.body
app.use(express.json({limit: '10mb'})) // for json
app.use(express.urlencoded({ limit: '10mb', extended: true })) // for form data

app.use(express.static('public'));

//config template engine
configViewEngine(app);

const webAPI = express.Router();
webAPI.get("/", getHomepage);


//Khai bao route
//luu y
app.use("/v1/api/user/",userRouterAPI )
app.use("/v1/api/admin/",adminRouterAPI)
app.use("/", webAPI);


// app.listen(port, () => console.log('Its working on port 8080'))

(async () => {
  try {
      //using mongoose
      await connection();

      app.listen(port, () => {
          console.log(`Backend Nodejs App listening on port ${port}`)
      })
  } catch (error) {
      console.log(">>> Error connect to DB: ", error)
  }
})()

