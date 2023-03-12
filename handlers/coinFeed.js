import * as cheerio from 'cheerio'
import axios from 'axios'

export async function getPriceFeed() {
  console.log('pricefeed start')

  try {
    const siteUrl = 'https://coinmarketcap.com'
    const { data } = await axios({
      method: 'GET',
      url: siteUrl
    })
    const $ = cheerio.load(data)
    const elSelector = '#__next > div > div.main-content > div.cmc-body-wrapper > div > div:nth-child(1) > div > table > tbody > tr'

    const keys = [
      'rank', 'name', 'price', '1h', '24h', '7d', 'marketCap', 'volume', 'circulatingSupply'
    ]

    const coinArr = []

    $(elSelector).slice(0, 9).each((parentIndex, parent) => {
      let keyIndex = 0
      const coinObj = {}
      $(parent).children().each((childIndex, child) => {
        let tdVal = $(child).text()
        if(keyIndex === 1 || keyIndex === 7) {
          tdVal = $('p:first-child', $(child).html()).text()
        }

        if(tdVal) {
          coinObj[keys[keyIndex]] = tdVal
          keyIndex++
        }
        coinArr.push(coinObj)
      })
    })
    return coinArr
  } catch (err) {
    console.log(err)
  }
  console.log('pricefeed done')
}

getPriceFeed()
