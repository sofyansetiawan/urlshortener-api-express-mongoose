require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns')
const bodyParser = require("body-parser")
const validUrl = require("valid-url");
let mongoose;
let mongodb;
try {
  mongoose = require("mongoose");
  mongodb = require("mongodb");
} catch (e) {
  console.log(e);
}

const router = express.Router();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded( { extended: false }))
app.use(bodyParser.json());
app.use('/', router);

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
mongoose.set('useFindAndModify', false);

const Url = require("./model.js").UrlModel
const createAndSaveUrl = require("./model.js").createAndSaveUrl
const findOneByUrl = require("./model.js").findOneByUrl
const findOneByShortUrl = require("./model.js").findOneByShortUrl

router.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

router.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

router.post("/mongoose-model", function (req, res) {
  let p;
  p = new Url(req.body);
  res.json(p);
});

router.get("/is-mongoose-ok", function (req, res) {
  if (mongoose) {
    res.json({ isMongooseOk: !!mongoose.connection.readyState });
  } else {
    res.json({ isMongooseOk: false });
  }
});

router.post('/api/shorturl', function(req, res) {
  const urlInput = req.body.url || "";
  if(validUrl.isWebUri(urlInput)){
    const urlObj = new URL(urlInput)
    dns.lookup(urlObj.hostname, (err, data) => {
      if(err) return res.json({ error: 'invalid url' })
      findOneByUrl(urlInput, (err, data) => {
        if(err) return res.send(err)
          if(!data){
            createAndSaveUrl(urlInput, function (err, data) {
              if (err) {
                return res.send(err)
              }
              if (!data) {
                console.log("Missing `done()` argument");
                return res.json({ message: "Missing callback argument" });
              }
              const dataSend = {
                original_url: data.original_url,
                short_url: data.short_url
              }
              res.json(dataSend);
          });
        }else{
          res.json({ original_url: data.original_url, short_url: data.short_url })
        }
      })
    });
  }
  else{
    res.json({ error: 'invalid url' })
  }
});

router.get('/api/shorturl/:short_url', function(req, res) {
  const short_url = req.params.short_url
  if(short_url){
    findOneByShortUrl(short_url, (err, data) => {
      if(err) return res.json({ error: 'no shorturl found' })
      res.redirect(data.original_url)
    })
  }
  else{
    res.json({ error: 'invalid shorturl' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
