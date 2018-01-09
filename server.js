const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const Feeds = require('pusher-feeds-server')
const dotenv = require('dotenv')

dotenv.config()
const app = express()

app.engine('handlebars', expressHandlebars())
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: false }))

const posts = []

app.get('/', (req, res) => {
  res.render('home', { posts })
})

app.get('/posts/:postIndex', (req, res) => {
  res.render('post', posts[req.params.postIndex])
})

app.get('/publish', (req, res) => {
  if (req.query.docId) {
    res.render('publish', {
      docId: req.query.docId,
      TEXTSYNC_INSTANCE_LOCATOR: process.env.TEXTSYNC_INSTANCE_LOCATOR,
    })
  } else {
    const docId = +new Date()
    res.redirect(`/publish?docId=${docId}`)
  }
})

app.post('/publish', (req, res) => {
  posts.push(req.body)
  const feeds = new Feeds({
    instanceLocator: process.env.FEEDS_INSTANCE_LOCATOR,
    key: process.env.FEEDS_KEY,
  })
  feeds.publish('posts', {
    title: req.body.title,
    index: posts.length - 1,
  })
  res.redirect('/')
})

const PORT = 3000
app.listen(PORT, err => {
  if (err) {
    console.error(err)
  } else {
    console.log(`Running on port ${PORT}`)
  }
})
