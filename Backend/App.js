const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

require("dotenv").config();
const dbURL = process.env.MONGODB_URI;

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-with, Content-Type, Accept, Authorization",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Cannot find this route.", 404);
  throw error;
});

// app.use((error, req, res, next) => {
//   if (res.file) {
//     fs.unlink(req.file.path, (err) => {
//       console.log(err);
//     });
//   }
//   if (res.headerSent) {
//     return next(error);
//   }
//   res.status(error.code || 500);
//   res.json({ message: error.message || "An unknown error occurred!" });
// });

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Image cleanup failed:", err);
      } else {
        console.log("Unused uploaded image deleted.");
      }
    });
  }

  if (res.headersSent) {
    return next(error);
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: "Image is too large. Maximum allowed size is 500 KB.",
    });
  }

  res.status(error.code || 500);
  res.json({
    message: error.message || "An unknown error occurred!",
  });
});

mongoose
  .connect(dbURL)
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });
