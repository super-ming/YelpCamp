const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');

router.get("/", (req, res)=> {
    Campground.find({}, (err, allCampgrounds)=> {
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds})
        }
    });
});

router.post("/", (req, res)=> {
    console.log(req.body);
    let name = req.body.name;
    let image = req.body.image;
    let desc = req.body.description;
    let newCampground = {name: name, image: image, description: desc};
    Campground.create(newCampground, (err, newlyCreated) => {
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

router.get("/new", (req, res)=> {
    res.render("campgrounds/new");
});

router.get("/:id", (req, res)=> {
    //Find campground by id and populate its comments
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground);
            res.render("campgrounds/details", {campground: foundCampground});
        }
    });
});

module.exports = router;