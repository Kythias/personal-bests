var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Best = mongoose.model('Best');
var User = mongoose.model('User');
var passport = require('passport');
var jwt = require('express-jwt');
var secret = process.env.herokusec;
var auth = jwt({secret: secret, userProperty: 'payload'});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/bests', function(req, res, next){
    Best.find(function(err, bests){
        if(err){return next(err);}
        
        res.json(bests);
    });
});

router.get('/list', function(req, res, next){
    User.find(function(err, users){
        if(err){return next(err);}
        
        res.json(users);
    });
});

router.post('/bests', auth, function(req, res, next){
    var best = new Best(req.body);
    
    best.author = req.payload.username;
    best.firstName = req.payload.firstName;
    best.lastName = req.payload.lastName;
    
    
    best.save(function(err, best){
        if(err){return next(err);}
        
        res.json(best);
    });
});

router.delete('/bests/:id', auth, function(req, res, next){
    Best.remove({
        _id: req.params.id
    }, function(err, best){
        if(err){return next(err)}
        
        res.json({ message: 'Successfully deleted'});
    });
        
        
    });
    
router.get('/profile/:user', function(req, res, next){
    Best.find({
        author: req.params.user
    }, function(err, bests){
        if(err){return next(err);}
        
        res.json(bests);
    });
});

router.get('/user/:username', function(req, res, next){
    User.find({
        username: req.params.username
    }, function (err, info) {
        if(err){ return next(err); }
        
        res.json(info);
    });
});

router.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }
    
    var user = new User();
    
    user.username = req.body.username;
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    
    user.setPassword(req.body.password);
    
    user.save(function(err){
        if(err){ return next(err);}
    
    return res.json({token: user.generateJWT()});    
    });
    
});

router.post('/login', function(req, res, next) {
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
        
    }
    
    passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
        
        if(user){
            return res.json({token: user.generateJWT()});
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

module.exports = router;
