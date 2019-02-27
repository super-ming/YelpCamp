const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//const request = require('request');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const campgroundSchema = mongoose.Schema({
    name: String,
    image: String,
    description: String
});

let Campground = mongoose.model("Campground", campgroundSchema);

/*Campground.create({
    name: "Colchuck Lake", 
    image: "https://farm3.staticflickr.com/2862/10350491664_6d0e84d55a.jpg"
}, (err, campground)=> {
    if(err){
        console.log(err);
    } else {
        console.log("Created new campground");
        console.log(campground);
    }
}); */

app.get("/", (req, res)=> {
    res.render("landing");
});

app.get("/campgrounds", (req, res)=> {
    Campground.find({}, (err, allCampgrounds)=> {
        if(err){
            console.log(err);
        } else {
            res.render("index", {campgrounds: allCampgrounds})
        }
    });
});

app.post("/campgrounds", (req, res)=> {
    console.log(req.body);
    let name = req.body.name;
    let image = req.body.image;
    let desc = req.body.description;
    let newCampground = {name: name, image: image, description: desc};
    Campground.create(newCampground, (err, newlyCreated)=> {
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

app.get("/campgrounds/new", (req,res)=> {
    res.render("new");
});

app.get("/campgrounds/:id", (req, res)=> {
    Campground.findById(req.params.id, (err, foundCampground)=> {
        if(err){
            console.log(err);
        } else {
            res.render("details", {campground: foundCampground});
        }
    });
});

//process.env.PORT, process.env.IP
app.listen("3000", ()=>{
    console.log("YelpCamp Server started!");
});
