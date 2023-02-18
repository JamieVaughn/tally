import * as cheerio from 'cheerio'
import axios from 'axios'

const articles = []

const games = [
  {
    name: 'starcraft2',
    address: 'https://news.blizzard.com/en-us/starcraft2',
    base: ''
  },
  {
    name: 'league_of_legends',
    address: 'https://www.leagueoflegends.com/en-us/news/tags/patch-notes/',
    base: ''
  },
  {
    name: 'dota2',
    address: 'https://www.dota2.com/news/updates', // a doesn't contain word patch, only "here"
    base: ''
  }
]

games.forEach(game => {
  axios.get(game.address)
  .then(response => {
    const html = response.data
    const $ = cheerio.load(html)
    $('a:contains("Patch")', html).each(function (_idx, _el) {
      const title = $(this).text() || ''
      const url = $(this).attr('href') || ''

      articles.push({
        title, 
        url,
        game: game.name
      })
    })
  }).catch(err => {
    console.log(err)
  })
})

const formatJSON = json => `<pre>${JSON.stringify(json, null, 2)}</pre>`

export const genArticleHtml = () => {
  return `<h1>${articles.length}</h1>${formatJSON(articles)}`
}

export const scrapeArticle = (req, res) => {
  const gameId = req.params.gameId
  const game = games.filter(game => game.name === gameId)[0]
  const gameUrl = game.address
  const gameBase = game.base
  if(gameUrl) {
    axios.get(gameUrl)
    .then(response => {
      const html = response.data
      const $ = cheerio.load(html)
      const specificArticles = []
      $('a:contains("Patch")', html).each(function () {
        const title = $(this).text()
        const url = $(this).attr('href')
        specificArticles.push({
          title,
          url: gameBase + url,
          source: gameId
        })
      })
      // res.json(formatJSON(specificArticles))
      res.send(formatJSON(specificArticles))
    }).catch(err => console.log(err))
  } else {
    console.log('no url was found')
  }
}
