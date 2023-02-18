import express from 'express'

import { HomePage } from './HomePage.js'
import { getWeather } from './getWeather.js'
import { scrapeArticle, genArticleHtml } from './gamesPosts.js'
import { TallyFCC } from './TallyFCC.js'

const PORT = process.env.PORT || 8000

const app = express()

// Global/Application level middleware
// middleware for auto encoding form body data onto req param
// must come before any routes that need to use it
app.use(express.urlencoded({extended: false})) 

app.get('/', (req, res) => {
  res.send(HomePage)
})

app.get('/scrape', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.send(genArticleHtml())
})

app.get('/scrape/:gameId', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  scrapeArticle(req, res)
})

app.get('/tally_fcc'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  TallyFCC(req, res)
}



// getWeather is a route level middleware
app.get('/form', getWeather, (req, res) => {
  res.send(`
    <h1>Enter the secret passcode</h1>
    <form action="/result" method="POST">
      <input type="text" name="passcode" >
      <button>Submit Passcode</button>
    </form>
    ${req.visitorWeather === false ? 'It is raining' : ':)'}
  `)
})

app.post('/result', (req, res) => {
  const passcode = req.body.passcode.trim() || 'nothing'
  res.send(`
    You submitted this passcode: ${passcode}
  `)
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
