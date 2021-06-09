const shortId = require("shortid");
const mongoose = require('mongoose')
const { Schema } = mongoose

const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: { type: String, required: true }
})

const Url = mongoose.model("Url", urlSchema);

const createAndSaveUrl = (url, done) => {
  const short_url = shortId.generate();
  const objOfUrl = {
    original_url: url,
    short_url
  }
  Url.create(objOfUrl, (err, data) => {
    if (err) return console.log(err)
    done(null, data);
  })
};

const findOneByUrl = (original_url, done) => {
  Url.findOne({original_url: original_url}, (err, data) => {
    if (err) return console.log(err)
    
    done(null, data);
  })
};

const findOneByShortUrl = (short_url, done) => {
  Url.findOne({short_url: short_url}, (err, data) => {
    if (err) return console.log(err)
    done(null, data);
  })
};


//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.UrlModel = Url;
exports.createAndSaveUrl = createAndSaveUrl;
exports.findOneByShortUrl = findOneByShortUrl;
exports.findOneByUrl = findOneByUrl;