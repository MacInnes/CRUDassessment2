var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/students');
var students = db.get('students');
var users = db.get('users');
var bcrypt = require('bcrypt');


/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.user = null;
  res.render('index');
});

router.get('/students', function(req, res, next){
  if (req.session.user){
    students.find({}, function(err, data){
      if (data){
        res.render('students', {students: data})
      } else {
        res.render('students')
      }
    });
    
  } else {
    res.redirect('/');
  }
})

router.get('/students/:id', function(req, res, next){
  if (req.session.user){
    students.findOne({_id: req.params.id}, function (err, data){
      if (data){
        res.render('student', {student: data})
      }
    })
  }
})

router.get('/add', function(req, res, next){
  if (req.session.user){
    res.render('add');
  } else {
    res.redirect('/');
  }
})

router.post('/login', function(req, res, next){
  console.log(req.body)
  var errors = [];
  if (req.body.email.length === 0){
    errors.push('Please enter an email address');
  }
  if (req.body.password.length === 0){
    errors.push('Please enter a password');
  }
  if (errors.length){
    res.render('index', {errors: errors});
  } else {
    users.findOne({email: req.body.email.toLowerCase()}, function (err, data){
      if(!data){
        errors.push('Invalid email or password.');
        res.render('index', {errors: errors})
      } else {
        if (bcrypt.compareSync(req.body.password, data.password) === true){
          req.session.user = req.body.email;
          res.redirect('/students');
        } else {
          errors.push('Invalid email or password');
          res.render('index', {errors: errors});
        }
      }
    })
  }
})

router.post('/register', function(req, res, next){
  console.log(req.body)
  var errors = [];
  if (req.body.email.length === 0){
    errors.push('Please enter an email address');
  }
  if (req.body.password.length === 0){
    errors.push('Please enter a password');
  }
  if (errors.length){
    res.render('index', {errors: errors});
  } else {
    users.findOne({email: req.body.email.toLowerCase()}, function (err, data){
      if (!data){
        users.insert({email: req.body.email.toLowerCase(), password: bcrypt.hashSync(req.body.password, 8)});
        req.session.user = req.body.email.toLowerCase();
        res.redirect('/students')
      } else {
        errors.push("That email is already registered, please sign in or use a different email.")
        res.render('index', {errors: errors})
      }
    })
  } 
})

router.post('/students', function(req, res, next){
  var errors = [];
  if (req.body.name.length === 0){
    errors.push('Please enter a name')
  }
  if (req.body.phone.length != 10){
    errors.push('Please enter a ten digit phone number, with no dashes or ()')
  }
  if (errors.length){
    res.render('add', {errors: errors})
  } else {
    students.insert({name: req.body.name, phone: req.body.phone});
    res.redirect('/students')
  }
})

module.exports = router;
