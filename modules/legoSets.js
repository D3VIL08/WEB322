const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log('MongoDB connection has been established successfully.'))
  .catch(err => console.log('Unable to connect to the database:', err));
  
const themeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String
});
const Theme = mongoose.model('Theme', themeSchema);

const setSchema = new mongoose.Schema({
  set_num: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  year: Number,
  num_parts: Number,
  theme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' },
  img_url: String
});
const Set = mongoose.model('Set', setSchema);

const setData = require("../data/setData");
const themeData = require("../data/themeData");

function initialize() {
  return new Promise(async (resolve, reject) => {
    try {
      const themeCount = await Theme.countDocuments();
      if (themeCount === 0) {
        await Theme.insertMany(themeData);
        console.log("Default themes added to the database.");
      }

      const setCount = await Set.countDocuments();
      if (setCount === 0) {
        await Set.insertMany(setData);
        console.log("Default sets added to the database.");
      }

      resolve();
    } catch (err) {
      reject(err.message);
    }
  });
}

function getAllSets() {
  return Set.find().populate('theme');
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    Set.findOne({ set_num: setNum }).populate('theme')
      .then(set => {
        if (set) {
          resolve(set);
        } else {
          reject("Unable to find requested set");
        }
      })
      .catch(err => reject(err.message));
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    Set.find({ "theme.name": new RegExp(theme, "i") }).populate('theme')
      .then(sets => {
        if (sets.length > 0) {
          resolve(sets);
        } else {
          reject("Unable to find requested sets");
        }
      })
      .catch(err => reject(err.message));
  });
}

function addSet(setData) {
  return new Promise((resolve, reject) => {
    new Set(setData).save()
      .then(() => resolve())
      .catch(err => reject(err.message));
  });
}

function getAllThemes() {
  return Theme.find();
}

function editSet(set_num, setData) {
  return new Promise((resolve, reject) => {
    Set.updateOne({ set_num }, setData)
      .then(result => {
        if (result.nModified > 0) {
          resolve();
        } else {
          reject("No set found with the specified number.");
        }
      })
      .catch(err => reject(err.message));
  });
}

function deleteSet(set_num) {
  return new Promise((resolve, reject) => {
    Set.deleteOne({ set_num })
      .then(result => {
        if (result.deletedCount > 0) {
          resolve();
        } else {
          reject("No set found with that set number.");
        }
      })
      .catch(err => reject(err.message));
  });
}

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet
};
