var express= require('express');
var request= require('request');
var db= require('../db/dbmain');
var moment= require('moment');
var CronJob= require('cron').CronJob;
var router = express.Router();

var updated= null;

/* GET admin listing. */
router.get('/', function(req, res) {
  db.getAll(function(breweries) {
    return res.render('admin', {
      title: 'Admin Dashboard',
      breweries: breweries,
      updated: updated
    });
  });
});

/* POST new brewery */
router.post('/addBrew', function(req, res) {
  var addObj= req.body;
  findLocBeers(addObj.utvid, function(lb) {
    addObj.locbeers= lb;
    var brewery= new db.Brewery(addObj);
    db.dbsave(brewery, function() {
      console.log("saved");
      res.send("Added");
    });
  });
});

/* POST update for brewery */
router.post('/updateBrew', function(req, res) {
  var updObj= req.body;
  db.upd(db.Brewery, {utvid: updObj.utvid}, updObj, function() { //Finding brewery like this doesn't let you update utvid
    console.log("updated");
    res.send("Updated");
  });
});

/* POST utvid update */
router.post('/updateUtvid', function(req, res) {
  console.log("hello?");
  var oldu= req.body.oldutvid;
  var newu= req.body.newutvid;
  db.upd(db.Brewery, {utvid: oldu}, {utvid: newu}, function() { //Finding brewery like this doesn't let you update utvid
    console.log("updated");
    res.send("Updated");
  });
});

/* Delete brewery */
router.get('deleteBrew', function(req, res) {
  db.del(db.Brewery, {utvid: req.body.utvid}, function() {
    res.redirect("/admin");
  });
});

/* GET update for beers at location */
router.get('/forceUpdate', function(req, res) {
  var ui= 0;
  var beerList;
  db.getAll(function(breweries) {
    beerList= breweries;
    forceUpd(ui);
  });
  function forceUpd(inc) {
    findLocBeers(beerList[ui].utvid, function(holdarr) {
      db.upd(db.Brewery, {utvid: beerList[ui].utvid}, {locbeers: holdarr}, function() { //just going to pray this works
        ui+= 1;
        if(ui< beerList.length)
          forceUpd(ui);
        else {
          updated= moment().format('MM/DD/YYYY HH:mm');
          return res.send("complete");
        }
      });
    });
  }
});

module.exports = router;

function findLocBeers(vid, cb) {
  var utcid= '4149526DC899177640B7E25BBB0D40D8A7F32E48';
  var utcs= 'E0B8914BF88C67A8645643B978BE65235BED4686';
  var holdarr= [];
  request({url: 'https://api.untappd.com/v4/venue/info/'+vid+'?client_id='+utcid+'&client_secret='+utcs, json: true}, function (error, response, body) {
    if(!error&& response.statusCode== 200) {
      var tb= body.response.venue.top_beers;
      for(var i= 0; i< tb.count; i++) {
        var tbi= tb.items[i].beer;
        holdarr.push({bid: tbi.bid, name: tbi.beer_name, style: tbi.beer_style, score: tbi.rating_score});
      }
      cb(holdarr);
    }
  });
}

// ----- CRON STUFF -----
//Updates beer list hourly. May need to change if they beer popular beers list does not change that often
function cronFunc() {
  var cronBeerList;
  db.getAll(function(breweries) {
    cronBeerList= breweries;
    for(var c= 0; c< cronBeerList.length; c++)
      updInc(c);
  });
  function updInc(inc) {
    findLocBeers(cronBeerList[inc].utvid, function(holdarr) {
      db.upd(db.Brewery, {utvid: cronBeerList[inc].utvid}, {locbeers: holdarr}, function() {
        updated= moment().format('MM/DD/YYYY HH:mm');
        return console.log("brewery beer list updated");
      });
    });
  }
}
new CronJob('0 0 * * * *', function(){//runs every hour at 0m 0s
  cronFunc(); //Doesn't seem to be working right now
}, null, true, "America/Los_Angeles");
// ----- END CRON -----

/*
var beerSchema= mongoose.Schema({
  bid: {
    type: Number,
    unique: true
  },
  name: String,
  style: String,
  score: Number
});

var brewSchema= mongoose.Schema({
  name: String,
  utvid: {
    type: Number,
    unique: true
  },
  address: String,
  phone: String,
  url: String,
  lat: String,
  lng: String,
  locbeers: [beerSchema]
});
*/