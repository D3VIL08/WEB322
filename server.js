/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Devkumar Pankajbhai Patel Student ID: 171174212 Date: 19/03/2024
*
********************************************************************************/
const express = require("express");
const legoData = require("./modules/legoSets");
const path = require("path");
const app = express();
const HTTP_PORT = process.env.PORT || 3000;

app.use(express.static("public"));

legoData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () =>
      console.log(`server listening on: http://localhost:${HTTP_PORT}`)
    );

    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "views", "home.html"));
    });

    app.get("/about", (req, res) => {
      res.sendFile(path.join(__dirname, "views", "about.html"));
    });

    app.get("/lego/sets", async (req, res) => {
      try {
        const theme = req.query.theme;
        if (theme) {
          const themedSets = await legoData.getSetsByTheme(theme);
          res.json(themedSets);
        } else {
          const sets = await legoData.getAllSets();
          res.json(sets);
        }
      } catch (error) {
        res.status(404).send(error);
      }
    });

    app.get("/lego/sets/:setNum", async (req, res) => {
      try {
        const set = await legoData.getSetByNum(req.params.setNum);
        set ? res.json(set) : res.status(404).send("Set not found");
      } catch (error) {
        res.status(404).send(error.message);
      }
    });

    app.use((req, res) => {
      res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
    });
  })
  .catch((error) => {
    console.error(error);
  });