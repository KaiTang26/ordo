"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {


// ------- All routes in this file will be prepended with /restaurant -------


  // If not logged in, show the login page...
router.get("/", (req, res) => {
  res.render('restaurant');
  // add rest name variable later
  // if logged in,
  //res.redirect(303, "/:id")
});


  // Restaurant profile page (to see and edit menu items)
router.get("/profile", (req, res) => {
  console.log(req.body);
  knex
    .select("*")
    .from("restaurant")
    .innerJoin("menuitem", "restaurant.id", "menuitem.restaurant_id")
    .where('restaurant_id', req.session.passport.user - 1)
    .then((results) => {
      res.render('restaurant_profile', {
        results: results
      });
    })
});

  // Add a menu item 34
router.post("/add-item", (req, res) => {
  var cookieID = req.session.passport.user-1;
  const menuItem = {
    restaurant_id: cookieID,
    category: req.body.category,
    item_name: req.body.name,
    item_description: req.body.description,
    price: req.body.price,
  };
  console.log(req.body);
  console.log(menuItem);
  // NEED COOKIE
  // Insert into db
  knex('menuitem')
  .insert(menuItem)
  .then((results) => {
    knex
    .select("*")
    .from("restaurant")
    .innerJoin("menuitem", "restaurant.id", "menuitem.restaurant_id")
    .where('restaurant_id', cookieID)
    .then((results) => {
      console.log(results);
      res.render('restaurant_profile', {
        results: results
      });
    })
  });
});

// PUT update menu id



  // Current open orders page
  // formerly router.get("/:id/current", (req,res) => {
  router.get("/:id/menu", (req, res) => {
    knex('restaurant')
    .innerJoin("menuitem", "restaurant.id","menuitem.restaurant_id")
    .select('*')
    .where('restaurant_id',req.params.id)
    .then((results) => {
      console.log("my results",results);
      res.render('restaurant_menu', {
        results : results
      })
      // res.render('current', templateVars)
    });
  })


  // Order history page
  router.get("/:id/history", (req, res) => {
    const templateVars = {
      // "current-orders" : restaurant.current
      "name": req.params.id
    };
    res.render('history', templateVars)
  });


  return router;
}
