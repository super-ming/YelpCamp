const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const middleware = require('../middleware');

const escapeRegex = text => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
//Campground Routes
router.get("/", (req, res)=> {
    let noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // get campgrounds by name from DB with search input
        Campground.find({name: regex}, (err, allCampgrounds) => {
            if(err){
                req.flash("error", err.message);
            } else {
                if(allCampgrounds.length < 1) {
                    noMatch = "No campgrounds match that query, please try again.";
                }
                res.render("campgrounds/index", {campgrounds: allCampgrounds, noMatch: noMatch})
            }
        });
    } else {
      // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    }
});

router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router.post("/", middleware.isLoggedIn, (req, res) => {
    let name = req.body.name;
    let cost = req.body.cost;
    let image = req.body.image;
    let desc = req.body.description;
    let author = {
        id: req.user._id,
        username: req.user.username
    };
    let newCampground = {name: name, cost: cost, image: image, description: desc, author: author};
    Campground.create(newCampground, (err, newlyCreated) => {
        if(err){
            req.flash("error", err.message);
        } else {
            req.flash("success", "Campground created");
            res.redirect("/campgrounds");
        }
    });
});

router.get("/:id", (req, res) => {
    //Find campground by id and populate its comments
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            res.render("campgrounds/details", {campground: foundCampground});
        }
    });
});

router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
        }
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if(err){
            req.flash("error", "Something went wrong");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground updated");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if(err){
             console.log(err);
            req.flash("error", "Something went wrong");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground deleted");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;
