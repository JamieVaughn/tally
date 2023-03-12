import express from 'express'
import cors from 'cors'
import path from 'path'
import {fileURLToPath} from 'url';
import ejs from 'ejs'

// import { HomePage } from './views/home.js' // before using ejs
import { getWeather } from './handlers/getWeather.js'
import { scrapeArticle, genArticleHtml } from './handlers/gamesPosts.js'
import { TallyFCC } from './handlers/TallyFCC.js'
import { getPriceFeed } from './handlers/coinFeed.js';

const PORT = process.env.PORT || 8000

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// to enable relaxed CORS policy
app.use(cors())
// to enable json request handling
app.use(express.json())

// Global/Application level middleware
// middleware for auto encoding form body data onto req param
// must come before any routes that need to use it
app.use(express.urlencoded({extended: false})) 
// app.use(express.static(path.join(__dirname, '/public', 'style.css')))
app.use(express.static(__dirname + '/public'))
// app.use('/static', express.static('/public'))

// app.set('view engine', 'ejs') // before using ejs partials
app.engine('.html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', path.dirname('views'))


console.log('dir 👉️', __dirname)
console.log('join', path.join(__dirname, '/views', 'home.ejs'))
console.log('join', path.join(__dirname, '/public', 'style.css'))

app.get('/', (req, res) => {
  // res.send(HomePage) // before using ejs
  res.render('./views/home.ejs')
})

app.get('/scrape', (req, res) => {
    res.statusCode = 200;
    // res.setHeader('Content-Type', 'text/html');
    res.send(genArticleHtml())
})

app.get('/scrape/:gameId', (req, res) => {
  res.statusCode = 200;
  // res.setHeader('Content-Type', 'text/html');
  scrapeArticle(req, res)
})

// app.get('/fcc'), (req, res) => {
  // res.statusCode = 200;
  // res.setHeader('Content-Type', 'text/html');
  // TallyFCC(req, res)
//   res.send('hello')
// }

app.get('/hw', (req, res) => {
  console.log('hw', req)
  TallyFCC(req, res)
})

// getWeather is a route level middleware
app.get('/form', getWeather, (req, res) => {
  console.log('visitor', req.visitorWeather)
  res.setHeader('Content-Type', 'text/html');

  res.render('./views/form.ejs', {
    isRaining: req.visitorWeather,
    pets: [{name: 'wimsey', type: 'cat'}, {name: 'vi', type: 'dog'}]
  })
  // before using ejs:
  // res.send(`
  //   <h1>Enter the secret passcode</h1>
  //   <form action="/result" method="POST">
  //     <input type="text" name="passcode" >
  //     <button>Submit Passcode</button>
  //   </form>
  //   ${req.visitorWeather === false ? 'It is raining' : ':)'}
  // `)
})

app.post('/result', (req, res) => {
  const passcode = req.body.passcode.trim() || 'nothing'
  res.render('./views/result.ejs', {
    passcode
  })
  // res.send(`You submitted this passcode: ${passcode}`) // before using ejs
})

app.get('/api/pets', (req, res) => {
  res.json({pets: [{name: 'wimsey', type: 'cat'}, {name: 'vi', type: 'dog'}]})
})

app.get('/api/pricefeed', async (req, res) => {
  res.statusCode = 200;
  // res.setHeader('Content-Type', 'text/html');
  const data = await getPriceFeed()
  res.json({data})
})

app.post('/api/secret', (req, res) => {
  if(req.body.username && req.body.password === 'secret') {
    res.send(`Hi ${req.body.username}! You are now logged in.`)
  } else {
    res.send("Login failed.")
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}: http://localhost:${PORT}`)
})
