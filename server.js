/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Devkumar Pankajbhai Patel Student ID: 171174212 Date: 10/04/2024
*
* Published URL: https://github.com/D3VIL08/WEB322.git
*
********************************************************************************/

require("dotenv").config();
const legoData = require("./modules/legoSets");
const express = require("express");
const app = express();
const path = require("path");
const layout = require("express-ejs-layouts");
const HTTP_PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.use(layout);
legoData.initialize();

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req, res) => {
  try {
    const theme = req.query.theme;
    let legoSets = theme
      ? await legoData.getSetsByTheme(theme)
      : await legoData.getAllSets();
    res.render("sets", { sets: legoSets });
  } catch (error) {
    res
      .status(404)
      .render("404", { message: "Unable to find requested sets." });
  }
});

app.get("/lego/sets/:id", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.id);
    console.log(set);
    res.render("set", { set: set });
  } catch (error) {
    res.status(404).render("404", { message: "Unable to find requested set." });
  }
});

app.get("/lego/addSet", async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render("addSet", { themes: themes });
  } catch (err) {
    res.status(404).render("404", { message: "Unable to add set." });
  }
});

app.post("/lego/addSet", async (req, res) => {
  try {
    const { name, year, num_parts, theme_id, img_url } = req.body;
    const theme = await legoData.getThemeById(theme_id);
    const allSets = await legoData.getAllSets();
    const allSetIDs = allSets.map((set) => set.set_num);

    if (allSetIDs.includes(req.body.set_num)) {
      throw new Error("ID already exists in the system.");
    }

    await legoData.addSet(req.body, theme);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

app.get("/lego/editSet/:setNum", async (req, res) => {
  try {
    const num = req.params.setNum;
    const set = await legoData.getSetByNum(num);
    console.log(set)
    const themes = await legoData.getAllThemes();
    console.log(themes)
    res.render("editSet", { themes: themes, set: set });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.post("/lego/editSet", async (req, res) => {
  try {
    const { name, year, num_parts, theme_id, img_url } = req.body;
    const theme = await legoData.getThemeById(theme_id);
    await legoData.editSet(req.body.set_num, req.body, theme);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

app.get("/lego/deleteSet/:setNum", async (req, res) => {
  try {
    const num = req.params.setNum;
    await legoData.deleteSet(num);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

app.use((req, res) => {
  res.status(404).render("404", {
    message: "I'm sorry, we're unable to find what you're looking for",
  });
});

app.listen(HTTP_PORT, () => {
  console.log(`this local server listening on the port: ${HTTP_PORT}`);
});