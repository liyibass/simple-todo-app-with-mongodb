// npm init -y
// npm install express

let express = require("express"); //load express這個module
let app = express(); //建立express()給app這個變數

let mongodb = require("mongodb");
let db;

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

let sanitizeHTML = require("sanitize-html");

let mongoDBPassword = "0425";
let connectionString = `mongodb+srv://liyi:${mongoDBPassword}@cluster0-yo3xo.mongodb.net/TodoApp?retryWrites=true&w=majority`;
mongodb.connect(
  connectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, client) {
    db = client.db(); //將mongoDB中的data存至db中
    app.listen(port); //開啟server
  }
);

//make the contents of "public" folder available from the root of our server
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function passwordPretected(req, res, next) {
  res.set("WWW-Authenticate", 'Basic realm="Simple Todo App"');
  // console.log(req.headers.authorization);

  if (req.headers.authorization == "Basic MTIzOjEyMw==") {
    next();
  } else {
    res.status(401).send("Authentication required");
  }
}

app.use(passwordPretected);

//建立get router 參數1為根路徑 參數2為回調參數
//參數2又有兩個參數 http request / server response

app.get("/", function (req, res) {
  db.collection("items")
    .find()
    .toArray(function (err, items) {
      res.send(`<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple To-Do App</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
  </head>
  <body>

    <div class="container">
      <h1 class="display-4 text-center py-1">To-Do App</h1>
      
      <div class="jumbotron p-3 shadow-sm">
        <form id="create-form" action="/create-item" method="POST">
          <div class="d-flex align-items-center">
            <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
            <button class="btn btn-primary">Add New Item</button>
          </div>
        </form>
      </div>
      
      <ul id="item-list" class="list-group pb-5">
      
        
      </ul>
      
    </div>
    <script>let items = ${JSON.stringify(items)}</script>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script src="/browser.js"></script>

  </body>
  </html>`);
    });
});

app.post("/create-item", function (req, res) {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  db.collection("items").insertOne({ text: safeText }, function (err, info) {
    // res.send("Thanks for submitting the form");
    // res.redirect("/");
    res.json(info.ops[0]);
  });
});

app.post("/update-item", function (req, res) {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  db.collection("items").findOneAndUpdate(
    { _id: new mongodb.ObjectId(req.body.id) },
    { $set: { text: safeText } },
    function () {
      res.send("Success");
    }
  );
});

app.post("/delete-item", function (req, res) {
  db.collection("items").deleteOne(
    { _id: new mongodb.ObjectId(req.body.id) },
    function () {
      res.send("Success");
    }
  );
});
