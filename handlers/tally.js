import * as puppeteer from 'puppeteer'
import fs from 'fs' 
import { students } from '../input/students.js'

const tally = async (studentName) => {
  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage()
  await page.goto(`https://www.freecodecamp.org/${students[studentName]}`)

  const limit = await page.evaluate(async () => {
    const pages = await Array.from(document.querySelectorAll(".timeline-pagination_list_item"))
    const textNode = await pages.find(
      p => p.firstChild.nodeName == "#text"
    ).innerText
    return Number(textNode.split(" ")[2])
  })

  let iteration = 1;
  const hrefs = []
  let data

  do {
    data = await tallyCurPg();
    hrefs.push(...data)
    iteration++;
    try {
      await page.click('aria/Go to next page')
    } catch (err) {
      console.log(err)
    }
  } while (iteration <= limit)

  async function tallyCurPg() {
    const hrefs = await page.evaluate(() => Array
      .from(document.querySelectorAll("tr.timeline-row > td:first-of-type > a")) // for the <name>1.json files it used:  tr.timeline-row a
      .map(a => a.getAttribute('href'))
    )
    return await hrefs
  }
  await browser.close()

  fs.writeFile(
    `./output/${studentName}-hrefs.json`, 
    JSON.stringify(hrefs, null, 2), 
    err => {
      if(err) throw err
      console.error(err) 
  })
  const html = hrefs.filter(p => p.includes('responsive-web-design')).length
  const js = hrefs.filter(p => p.includes('javascript-algorithms-and-data-structures')).length
  const fe = hrefs.filter(p => p.includes('front-end-development-libraries')).length
  const projects = hrefs.filter(p => p.includes('project')).length
  const certs = hrefs.filter(p => p.includes('certificat')).length
  const summary = await { projects, certs, html, js, fe }
  fs.writeFile(
    `./output/${studentName}-summary.json`, 
    JSON.stringify(summary, null, 2), 
    err => {
      if(err) throw err
      console.error(err) 
  })
  return await summary
}

tally('brett')

// jackie
// sandra
