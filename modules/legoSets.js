
const themeData = require("../data/themeData");
const setData = require("../data/setData.json");
require("dotenv").config();
const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let themeSchema = new Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    name: String,
  },
  { _id: false }
);

let Theme = mongoose.model("Themes", themeSchema);

let setSchema = new Schema({
  set_num: String,
  name: String,
  year: Number,
  theme_id: Number,
  num_parts: Number,
  img_url: String,
  theme: {
    id: Number,
    name: String,
  },
});

let Set = mongoose.model("Sets", setSchema);

function initialize() {
  return new Promise(async (resolve, reject) => {
    try {
      mongoose.connect(process.env.DB_CONNECTION_STRING);
      console.log("Connected successfully.");
      resolve();
    } catch (err) {
      reject(err.message);
      process.exit(1);
    }
  });
}

function getAllSets() {
  return new Promise((resolve, reject) => {
    Set.find({})
      .sort({ set_num: "asc" })
      .exec()
      .then((sets) => {
        resolve(sets);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getAllThemes() {
  return new Promise((resolve, reject) => {
    Theme.find({})
      .exec()
      .then((themes) => {
        console.log(themes);
        resolve(themes);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    Set.findOne({
      set_num: setNum,
    })
      .exec()
      .then((sets) => {
        if (sets.length === 0) {
          reject("Unable to find requested set");
        }
        resolve(sets);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getThemeById(id) {
  return new Promise((resolve, reject) => {
    Theme.findOne({ id: id })
      .exec()
      .then((theme) => {
        resolve(theme);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    Set.find({})
      .exec()
      .then((sets) => {
        const themedSets = sets.filter((set) => set.theme.name === theme);
        resolve(themedSets);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function addSet(setData, theme) {
  return new Promise((resolve, reject) => {
    const { set_num, name, year, num_parts, theme_id, img_url } = setData;

    const newSet = new Set({
      set_num: set_num,
      name: name,
      year: year,
      theme_id: theme_id,
      num_parts: num_parts,
      img_url: img_url,
      theme: {
        id: theme.id,
        name: theme.name,
      },
    });

    newSet
      .save()
      .then((createdSet) => {
        resolve(createdSet);
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

function editSet(set_num, setData, theme) {
  return new Promise((resolve, reject) => {
    const { name, year, num_parts, theme_id, img_url } = setData;

    Set.updateOne(
      {
        set_num: set_num,
      },
      {
        $set: {
          name: name,
          year: year,
          theme_id: theme_id,
          num_parts: num_parts,
          img_url: img_url,
          theme: {
            id: theme.id,
            name: theme.name,
          },
        },
      }
    )
      .exec()
      .then((set) => {
        resolve(set);
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

function deleteSet(set_num) {
  return new Promise((resolve, reject) => {
    Set.deleteOne({
      set_num: set_num,
    })
      .exec()
      .then((set) => {
        resolve(set);
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

module.exports = {
  initialize,
  getAllSets,
  getAllThemes,
  getSetByNum,
  getThemeById,
  getSetsByTheme,
  addSet,
  editSet,
  deleteSet,
};