const express = require('express')
const bodyParser = require("body-parser");
const shortId = require('shortid')
const dotenv=require('dotenv')
const createHttpError = require('http-errors')
const mongoose = require('mongoose')
const path = require('path')
const PORT=process.env.PORT||8181;
dotenv.config({path:'.env'})
const ShortUrl = require('./models/url.model')

const DB=process.env.DATABASE;
const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({extended: true}));
//console.log(DB);
console.log(typeof(DB));
mongoose
  .connect(DB,{
    
    useNewUrlParser: true,
    useUnifiedTopology:true,
    
   
  })
  
app.set('view engine', 'ejs')

app.get('/', async (req, res, next) => {
  res.render('index')
})

app.post('/', async (req, res, next) => {
  try {
    const { url } = req.body
    if (!url) {
      throw createHttpError.BadRequest('Provide a valid url')
    }
    const urlExists = await ShortUrl.findOne({ url })
    if (urlExists) {
      res.render('index', {
        // short_url: `${req.hostname}/${urlExists.shortId}`,
        short_url: `${urlExists.shortId}`,
      })
      return
    }
    const shortUrl = new ShortUrl({ url: url, shortId: shortId.generate() })
    const result = await shortUrl.save()
    res.render('index', {
      // short_url: `${req.hostname}/${urlExists.shortId}`,
      short_url: `${result.shortId}`,
    })
  } catch (error) {
    next(error)
  }
})

app.get('/:shortId', async (req, res, next) => {
  try {
    const { shortId } = req.params
    const result = await ShortUrl.findOne({ shortId })
    if (!result) {
      throw createHttpError.NotFound('Short url does not exist')
    }
    res.redirect(result.url)
  } catch (error) {
    next(error)
  }
})

app.use((req, res, next) => {
  next(createHttpError.NotFound())
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.render('index', { error: err.message })
})

app.listen(PORT, () => console.log(`🌏 on port ${PORT}`))
