const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const fs = require("fs");

const getCoordsForAddress = require("../util/location");
const User = require("../models/user");
const Place = require("../models/place");

const getPlaceByID = async (req, res, next) => {
  const placeID = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeID);
  } catch (err) {
    const error = new HttpError("Unable to find a place", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided place id.",
      404,
    );
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserID = async (req, res, next) => {
  const userID = req.params.uid;

  // let places;
  // try {
  //   places = await Place.find({ creator: userID });
  // } catch (err) {
  //   const error = new HttpError(
  //     "Fetching places with user data has failed. ",
  //     500,
  //   );
  //   return next(error);
  // }

  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userID).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later.",
      500,
    );
    return next(error);
  }

  // (!places || places.length === 0)
  if (!userWithPlaces) {
    const error = new HttpError(
      "Could not find a place for the provided user id.",
      404,
    );
    return next(error);
  }
  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true }),
    ),
  });
  // res.json({
  //   places: places.map((place) => place.toObject({ getters: true })),
  // });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userID,
  });

  let user;

  try {
    user = await User.findById(req.userData.userID);
  } catch (err) {
    const error = new HttpError("Creating a place failed. ", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("We could not find user for provided id", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace._id);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating place failed to load.", 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { title, description } = req.body;
  const placeID = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeID);
  } catch (err) {
    const error = new HttpError("Unable to update the place.", 500);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userID) {
    const error = new HttpError("You're not allowed to edit this place.", 403);
    return next(error);
  }

  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError("Unable to update the place.", 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeID = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeID).populate("creator");
  } catch (err) {
    const error = new HttpError("Unable to delete the place.", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find a place for this id.", 404);
    return next(error);
  }

  if (place.creator.id !== req.userData.userID) {
    const error = new HttpError(
      "You are not allowed to delete this place.",
      403,
    );
    return next(error);
  }

  const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Unable to delete the place.", 500);
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceByID = getPlaceByID;
exports.getPlacesByUserID = getPlacesByUserID;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
