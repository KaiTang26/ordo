"use strict";

const express = require('express');
const router  = express.Router();
const knex = require('knex');

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
  console.log("*********");
  console.log(req.body);
  knex
    .select("*")
    .from("restaurant")
    .innerJoin("menuitem", "restaurant.id", "menuitem.restaurant_id")
    .where('restaurant_id', req.session.passport.user-1)
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
    .from("menuitem")
    .where('restaurant_id', cookieID)
    .orderBy("id")
    .then((results) => {
      res.render('restaurant_profile', {
        results: results,
        status: "restaurant"

      });
    })
  });
});

router.post("/new/lineitem", (req, res) => {
  var results = req.body
  console.log(results);
  knex('lineitem')
  .insert({order_id: results.order_id, item_id: results.item_id, quantity: results.quantity , status: 0})
  .then((results) => {
  })
})

// PUT update menu id
router.post("/update", (req, res) => {
  const menuItem = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    // category:
  };
  console.log(req.body);
  // NEED COOKIE
  // Insert into db
  knex('menuitem')
    .insert(menuItem, '*')
    .then(menuitems => {
      menuItem = menuitems[0];
      res.redirect('/:id')
    })
// knex
// .select("*")
// .from("restaurant")
// .then((results) => {
//   res.render('index', {
//     results: results
//   });
res.redirect(303, "/:id");
});


  // Current open orders page
  // formerly router.get("/:id/current", (req,res) => {

  router.get("/:id/current", (req, res) => {
    const cookieID = req.session.passport.user;

    knex.select("id", "name")
    .from("restaurant")
    .where("user_id", cookieID)
    .then((result)=>{

      console.log(result[0].id);

      if(!result[0].id){
      res.send("You do not have permission to view this page");
      }else{
        console.log(result[0].id);

        knex.select("order_id","picture", 'users.name', 'phone_number', 'item_name', 'quantity', 'price', "status", "item_id")
        .from("users")
        .innerJoin("order", "users.id", "order.user_id")
        .innerJoin("lineitem", "order.id", "lineitem.order_id")
        .innerJoin("menuitem", "lineitem.item_id", "menuitem.id")
        .where({"restaurant_id": result[0].id, "status":0})
        .then((table)=>{

          res.render('restaurant_current', {
            table:table,
            restName: result[0].name
          })

          console.log(table);
        })

      }

    })

  });

  router.post("/:id/current", (req, res)=>{

    const order_id = req.body.order_id;
    const item_id = req.body.item_id;

    knex.select("*")
        .from("lineitem")
        .where({"order_id": order_id, "item_id": item_id})
        .update({"status": 1})
        .then((result)=>{

          console.log(result);

          res.status(200);

        })

    });



router.get("/:id/history", (req, res) => {
    const cookieID = req.session.passport.user;

    knex.select("id", "name")
    .from("restaurant")
    .where("user_id", cookieID)
    .then((result)=>{

      console.log(result[0].id);

      if(!result[0].id){
      res.send("You do not have permission to view this page");
      }else{

        knex.select("order_id","picture", 'name', 'phone_number', 'item_name', 'quantity', 'price', "status", "item_id")
        .from("users")
        .innerJoin("order", "users.id", "order.user_id")
        .innerJoin("lineitem", "order.id", "lineitem.order_id")
        .innerJoin("menuitem", "lineitem.item_id", "menuitem.id")
        .where({"restaurant_id": result[0].id, "status":1})
        .then((table)=>{

          res.render('restaurant_history', {
            table:table,
            restName: result[0].name
          })

          console.log(table);
        })

      }

    })

  });

  router.post("/update-item", (req, res) => {
  const restaurant_id = req.session.passport.user-1;
  const item_id = req.body.item_id
  const menuItem = {
    item_category: req.body.category,
    item_name: req.body.item_name,
    item_description: req.body.item_description,
    price: req.body.price,
  };

  knex.select("*")
      .from("menuitem")
      .where({"restaurant_id": restaurant_id, "id": item_id})
      .update(menuItem)
      .then((result)=>{

        knex
        .select("*")
        .from("menuitem")
        .where('restaurant_id', restaurant_id)
        .orderBy("id")
        .then((results) => {
          res.render('restaurant_profile', {
          results: results,
          status: "restaurant"
          });
          console.log(results);
        })
          console.log(result);
      })
  });








  return router;
}
