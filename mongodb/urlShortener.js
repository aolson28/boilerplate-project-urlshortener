const dns = require('dns');
const mongoose = require('mongoose');
const { url } = require('inspector');
const { Schema, model } = mongoose;
const express = require('express');
const cors = require('cors');

const clearURLDB = () => {
    Url.deleteMany({number: {$gte: 0}}).then((data) => {
    console.log(data);
}).catch((err) => {
    console.error(err);
});
};

const urlShortRedirect = (req, res) => {
    let urlString = req.params.shortUrlString;
    Url.find({baseThirtySix: urlString})
        .then((data) => {
            if (data.length > 0) {
                res.redirect(data[0].url);
            }
        }
    );
};

const urlPostHandle = (req, res) => {
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
                    res.json({
                        original_url: data[0].url,
                        short_url: data[0].baseThirtySix
                    });
                } else {
                    let numberInt;
                    Url.find({}).sort({
                        number: -1
                    }).limit(1).then(function(data) {
                        numberInt = parseInt(data[0].number) + 1;
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
};

module.exports.urlShortRedirect = urlShortRedirect;
module.exports.urlPostHandle = urlPostHandle;