require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const urlShortenerScema = new Schema(
  {
    number: Number,
    baseThirtySix: String,
    url: String,
    createdAt: Date,
    submissions: Number
  }
)

const Url = model('Url',urlShortenerScema);

mongoose.connect(process.env.MONGO_URL);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(express.urlencoded({
  limit: '10mb',
  extended: true
}));

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  console.log(req.body);
  let numberInt;
  let numberBaseThirtySix;
  let url;
  let createdAt;
  let submissions;  
  let newUrl = new Url({number: "Jane Fonda", age: 84, favoriteFoods: ["eggs", "fish", "fresh fruit"]});
  newUrl.save(function(err, data) {
    if (err) return console.error(err);
    done(null, data)
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// Mongo DB Functions

const addUrl = (done) => {
  let newUrl = new Url({number: "Jane Fonda", age: 84, favoriteFoods: ["eggs", "fish", "fresh fruit"]});

  newUrl.save(function(err, data) {
    if (err) return console.error(err);
    done(null, data)
  });
};