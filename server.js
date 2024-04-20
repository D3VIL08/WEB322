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

const express = require("express");
const legoData = require("./modules/legoSets");
const path = require("path");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

legoData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () =>
      console.log(`server listening on: http://localhost:${HTTP_PORT}`)
    );

    app.get("/", (req, res) => {
      res.render("home");
    });

    app.get("/about", (req, res) => {
      res.render("about");
    });

    app.get("/lego/sets", async (req, res) => {
      try {
        const theme = req.query.theme;
        let sets;
        if (theme) {
          sets = await legoData.getSetsByTheme(theme);
        } else {
          sets = await legoData.getAllSets();
        }
        res.render("sets", { sets: sets });
      } catch (error) {
        res.status(404).render("404", { message: error });
      }
    });

    app.get("/lego/sets/:setNum", async (req, res) => {
      try {
        const set = await legoData.getSetByNum(req.params.setNum);
        if (set) {
          res.render("set", { set: set });
        } else {
          res.status(404).send("Set not found");
        }
      } catch (error) {
        res.status(404).render("404", { message: error });
      }
    });

    app.get('/lego/addSet', async (req, res) => {
      try {
        const themes = await legoData.getAllThemes(); 
        res.render("addSet", { themes: themes }); 
      } catch (err) {
        res.status(500).render('500', { message: err.message }); 
      }
    });

    app.post('/lego/addSet', async (req, res) => {
      try {
        await legoData.addSet(req.body); 
        res.redirect('/lego/sets'); 
      } catch (err) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
      }
    });

    app.get("/lego/editSet/:num", async (req, res) => {
      try {
        const set = await legoData.getSetByNum(req.params.num);
        const themes = await legoData.getAllThemes();
        set ? res.render("editSet", { set, themes }) : res.status(404).render("404", { message: "Set not found" });
      } catch (err) {
        res.status(404).render("404", { message: err });
      }
    });

    app.post("/lego/editSet", async (req, res) => {
      try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect("/lego/sets");
      } catch (err) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
      }
    });

    app.get("/lego/deleteSet/:num", async (req, res) => {
      try {
          await legoData.deleteSet(req.params.num);
          res.redirect("/lego/sets");
      } catch (err) {
          res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
      }
  });

    app.use((req, res) => {
      res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for..."});
    });
  })
  .catch((error) => {
    console.error(error);
  });