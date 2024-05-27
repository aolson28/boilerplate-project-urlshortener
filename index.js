require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

const mongoose = require('mongoose');
const { url } = require('inspector');
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

app.get('/api/shorturl/:shortUrlString', (req, res) => {
  let urlString = req.params.shortUrlString;
  Url.find({baseThirtySix: urlString}).then((data) => {
    if (data.length > 0) {
      res.redirect(data[0].url);
    }
  });
})

app.post('/api/shorturl', function(req, res) {
  dns.lookup(new URL(req.body.url).hostname,{ all:true },(err, addresses) => {
    if (err) {
    res.json({ error: 'invalid url' });
    console.error(err);
    } else {
      let urlString = req.body.url;
    let urlDbIndex = Url.find({url: urlString}).then((data) => {
      if (data.length > 0) {
        // console.log(data, 'exists');
        res.json({original_url: data[0].url, short_url: data[0].baseThirtySix});
      } else {
        let numberInt;
        Url.find({}).sort({ number: -1 }).limit(1).then(function(data) {
          // console.log(data[0].number);
          numberInt = parseInt(data[0].number) + 1;
          let numberBaseThirtySix = numberInt.toString(36);
          let createdAtDate = new Date();
          let submissionsInt = 1;
          let newUrl = new Url({number: numberInt, baseThirtySix: numberBaseThirtySix, url: urlString, createdAt: createdAtDate, submissions: submissionsInt});
          newUrl.save().then(function(data) {
            res.json({original_url: urlString, short_url: numberBaseThirtySix});
          }).catch((err) => {
            if (err) {
              console.error(err);
            }
          });
        }).catch((err) => {
          if (err) {
            console.error(err);
          }
        });
      }
    });
    }
  });
    
  });

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});