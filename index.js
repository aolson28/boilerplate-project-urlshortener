require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectMongoDB } = require('./mongodb/connectMongoDB');
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
// Connect to MongoDB using Mongoose. Found in ./mongodb/connectMongoDB.js
connectMongoDB();
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

// Create URl Model for URL Shortener Service
const Url = model('Url',urlShortenerScema);

app.use(express.urlencoded({
    limit: '10mb',
    extended: true
  }));

// URL Shortener code
app.get('/api/shorturl/:shortUrlString', (req, res) => {
let urlString = req.params.shortUrlString;
Url.find({baseThirtySix: urlString}).then((data) => {
    if (data.length > 0) {
    res.redirect(data[0].url);
    }
});
});

app.post('/api/shorturl', function(req, res) {
    dns.lookup(new URL(req.body.url).hostname, {
        all: true
    }, (err, addresses) => {
        if (err) {
            res.json({
                error: 'invalid url'
            });
            console.error(err);
        } else {
            let urlString = req.body.url;
            let urlDbIndex = Url.find({
                url: urlString
            }).then((data) => {
                if (data.length > 0) {
                    Url.updateOne({
                      url: urlString
                    },{submissions: (data[0].submissions + 1)}).then((data) => {return;}).catch((err) => {console.error(err);});
                    res.json({
                        original_url: data[0].url,
                        short_url: data[0].baseThirtySix
                    });
                } else {
                    let numberInt;
                    Url.find({}).sort({
                        number: -1
                    }).limit(1).then(function(data) {
                        numberInt = data.length ? parseInt(data[0].number) + 1 : 1;
                        let numberBaseThirtySix = numberInt.toString(36);
                        let createdAtDate = new Date();
                        let submissionsInt = 1;
                        let newUrl = new Url({
                            number: numberInt,
                            baseThirtySix: numberBaseThirtySix,
                            url: urlString,
                            createdAt: createdAtDate,
                            submissions: submissionsInt
                        });
                        newUrl.save().then(function(data) {
                            res.json({
                                original_url: urlString,
                                short_url: numberBaseThirtySix
                            });
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