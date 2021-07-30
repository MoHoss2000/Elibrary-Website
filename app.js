var express = require('express');
var fs = require("fs");
var path = require('path');
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var session = require("express-session");
app.use(session({
  secret: 'elibrary',
  resave: true,
  saveUninitialized: false,
}))

app.get("/", function (req, res) {
  res.render("login", { error: "" });
  console.log(req.ip);
});

app.get("/registration", function (req, res) {
  res.render("registration", { error: "" });
});

function verifyUser(req, res, next) {
  if (typeof req.session.user === 'undefined') {
    return res.redirect("/")
  }
  next();
}

app.get("/home", verifyUser, function (req, res) {
  res.render("home", {username: req.session.user.username});
});

app.get("/novel", verifyUser, function (req, res) {
  res.render("novel");
});

app.get("/poetry", verifyUser, function (req, res) {
  res.render("poetry");
});

app.get("/fiction", verifyUser, function (req, res) {
  res.render("fiction");
});

app.get("/flies", verifyUser, function (req, res) {
  res.render("flies");
});

app.get("/grapes", verifyUser, function (req, res) {
  res.render("grapes");
});

app.get("/leaves", verifyUser, function (req, res) {
  res.render("leaves");
});

app.get("/sun", verifyUser, function (req, res) {
  res.render("sun");
});

app.get("/dune", verifyUser, function (req, res) {
  res.render("dune");
});

app.get("/mockingbird", verifyUser, function (req, res) {
  var user = req.session.user;
  var wishList = user.wishList;

  res.render("mockingbird", { wishList });
});

app.get("/readlist", verifyUser, function (req, res) {
  res.render("readlist", { wishList: req.session.user.wishList });
});


app.post("/registration", function (req, res) {
  var savedUsers = fs.readFileSync("users.json");
  savedUsers = JSON.parse(savedUsers);
  var userData = req.body; // {usedname: "mohamed", password: "pass"}
  var isAlreadyRegistered = false;

  for (x in savedUsers) {
    if (userData.username == savedUsers[x].username) {
      isAlreadyRegistered = true;
    }
  }

  if (isAlreadyRegistered) {
    res.render("registration", { error: "Username is already taken" })
  } else {
    userData["wishList"] = [];
    savedUsers.push(userData);
    var string = JSON.stringify(savedUsers);
    fs.writeFileSync("users.json", string);
    res.redirect("/");
  }
});

app.post("/addbook", function (req, res) {
  var books = JSON.parse(fs.readFileSync("books.json"));
  var bookTitle = req.body.name;
  var bookPath = books[bookTitle];
  var book = { title: bookTitle, path: bookPath };
  var alreadyAdded = req.session.user.wishList.some(book => {return book.title == bookTitle});
  var savedUsers = JSON.parse(fs.readFileSync("users.json"));
  
  if (!alreadyAdded) {
    req.session.user.wishList.push(book);

    const index = savedUsers.findIndex((el) => el.username === req.session.user.username);
    savedUsers[index] = req.session.user;
    var string = JSON.stringify(savedUsers);
    fs.writeFileSync("users.json", string);
    return res.send("Book added successfully!");
  }

  res.send("Book already added");
});



app.post("/removebook", function (req, res) {
  var bookIndex = req.body.index;
  var savedUsers = JSON.parse(fs.readFileSync("users.json"));

  req.session.user.wishList.splice(bookIndex, 1);
  const index = savedUsers.findIndex((el) => el.username === req.session.user.username);

  savedUsers[index] = req.session.user;
  var string = JSON.stringify(savedUsers);
  fs.writeFileSync("users.json", string);
  return res.send("Book deleted");
});

app.post("/", function (req, res) {
  var savedUsers = fs.readFileSync("users.json");
  savedUsers = JSON.parse(savedUsers);
  var userData = req.body; 
  var isValid = false;

  for (x in savedUsers) {
    if (userData.username == savedUsers[x].username && userData.password == savedUsers[x].password) {
      isValid = true;
    }
  }

  if (isValid) {
    req.session.user = savedUsers.find(user => user.username === userData.username);
    res.redirect("/home");
  } else {
    res.render("login", { error: "Invalid Credentials" })
  }
})

app.get("/search", function (req, res) {
  var searchTerm = req.query.searchTerm;
  var books = JSON.parse(fs.readFileSync("books.json"));
  var result = [];

  for (x in books) {
    if (x.toLowerCase().includes(searchTerm.toLowerCase()))
      result.push({ "name": x, "path": books[x] })
  }

  res.render("searchresults", { result });
});

app.post("/search", function (req, res) {
  res.redirect("search?searchTerm=" + req.body.Search);
});



if(process.env.PORT){
  app.listen(process.env.PORT, function() {console.log("Server started")})
} else {
  app.listen(80, function() {console.log("Server started on port 80")})
}