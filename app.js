var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var FB = require('fbgraphapi');
var request = require('request');
var app = express();



var mongoose = require('mongoose');
//mongoose.connect("mongodb://localhost/csiproject",{useMongoClient: true});

mongoose.connect("mongodb://rohitsuri:password@ds129003.mlab.com:29003/csinsit",{useMongoClient: true});



//USER AUTHENTICATION USING PASSPORT-FACEBOOK

passport.use(new Strategy({
    clientID: '774249796068621' ,
    clientSecret: '2d3c25556391ef227e0d848c748766b1' ,
    callbackURL: 'http://localhost:3000/login/facebook/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    
    return cb(null, profile);
  }));

//SERIALIZE USER

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

//DESERIALIZE USER

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});





// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(require('body-parser').urlencoded({ extended: true }));

//USING EXPRESS SESSION SO THAT USER REMAINS LOGGED IN EVEN IF PAGE REFRESHES OR UNTILL USER EXPLICITLY LOGS OUT

app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home',{currentUser: req.user});
  });

app.get('/login',
  function(req, res){
    res.redirect('/login/facebook');
  });

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


  
 app.get("/logout",function(req, res) {

    req.logout();
    res.redirect("/");
});

//MIDDLEWARE TO CHECK WHETHER USER IS LOGGED IN
//IT WILL BE USED SO THAT USER CAN'T ACCESS /show ROUTE EXPLICITLY WHEN NOT LOGGED IN

 function isLoggedIn(req,res,next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect("/login");
}

//SENDING INFORMATION TO ALL THE TEMPLATES REGARDING THE CURRENT LOGGED IN USER
app.use(function(req,res,next){
res.locals.currentUser = req.user;
next();
});
    
/

//POST SCHEMA TO STORE INFORMATION OF THE POST

var postSchema = new mongoose.Schema({
    message: String,
    created: {type:Date},
    likecount: Number,
    sharecount: Number
		
});




var Post = mongoose.model("post",postSchema);


// THE CODE COMMENTED BELOW IS USEFUL AS IT WAS INITIALLY MADE TO RUN WHEN THE APP IS RUN FOR THE FIRST TIME
//THIS CODE FETCHED ALL THE INFORMATION FROM THE FACEBOOK PAGE OF CSI NSIT VIA THE GRAPH API
//AND STORES IT INTO THE DATABASE


//THE ACCESS TOKEN PROVIDED HERE IS CREATED BY CLIENTID|CLIENTSECRET



/*var url = "https://graph.facebook.com/csinsit/posts?access_token=774249796068621|2d3c25556391ef227e0d848c748766b1&fields=id,message,caption,story,name,object_id,created_time,shares,likes";
request(url, function (error, response, body) {
    if(!error && response.statusCode == 200){
        var data = JSON.parse(body);
        
       if(data["Response"]!=="False"){

		console.log(data["data"][1].likes["data"].length);

	 for(var i=0;i<data["data"].length;i++)
	 {
	 	var SHARECOUNT = 0;
	 	if(data["data"][i].shares)
	 		SHARECOUNT = data["data"][i].shares["count"];

	 	var LIKECOUNT = 0;
	 	if(data["data"][i].likes)
	 		LIKECOUNT = data["data"][i].likes["data"].length;

           var obj = {message: data["data"][i].message,
		      created: data["data"][i].created_time,
		      likecount:LIKECOUNT,
		      sharecount:SHARECOUNT
		      
			  }; 

	   Post.create(obj,function(err,newpost)
		{
			if(err)
			console.log("error");	
		});
		
	 }

         
	}
         else
           console.log("ERROR");
        
    }
   });
	
	*/
    

//FIRST ALL THE INFO IS RETRIEVED FROM THE DATABASE AND THEN SENT TO THE /show ROUTE AS AN ARRAY SORTED ACCOURDING TO LIKECOUNT AND SHARECOUNT

app.get("/show",isLoggedIn,function(req,res)
{
	Post.find({},function(err,posts)
	{
		if(err)
			console.log("ERROR!");
		else
		{
			posts.sort(function(a,b)
			{
				var alikes = a.likecount;
				var blikes = b.likecount;
				var ashares = a.sharecount;
				var bshares = b.sharecount;
				if(alikes==blikes)
				{
					return (ashares>bshares)? -1 : (ashares<bshares) ? 1 : 0;
				}
				else
				{
					return (alikes>blikes) ? -1 : 1;
				}
			});


			res.render("show",{Post:posts});
		}
	});

});
    


//TO START THE SERVER

app.listen(3000,function()
{
console.log("Server started");
});









































































