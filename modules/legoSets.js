const setData = require("../data/setData.json");
const themeData = require("../data/themeData.json");

let sets = [];

function initialize() {
  return new Promise((resolve, reject) => {
    try {
      sets = setData.map(set => {
        const theme = themeData.find(theme => theme.id === set.theme_id)?.name;
        return { ...set, theme: theme || "Unknown" };
      });
      resolve();
    } catch (error) {
      reject("Initialization failed: " + error);
    }
  });
}

function getAllSets() {
  return Promise.resolve(sets);
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    const set = sets.find(set => set.set_num === setNum);
    set ? resolve(set) : reject("Set not found");
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    const filteredSets = sets.filter(set => set.theme.toLowerCase().includes(theme.toLowerCase()));
    filteredSets.length ? resolve(filteredSets) : reject("No sets found for theme: " + theme);
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };
