import * as puppeteer from 'puppeteer'
// import fs from 'fs' 
// import cron from 'node-cron'

const students = {
  jamie: 'fcc5201f47b-6b22-4273-9e62-b24cef2f8efc'
}


const tally = async () => {
  // const btnSelector = 'button[aria-label="Go to next page"]'

  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage()
  await page.goto(`https://www.freecodecamp.org/${students.jamie}`)

  // const pages = await page.waitForSelector('.timeline-pagination_list')
  const limit = await page.evaluate(() => {
    const pages = Array.from(document.querySelectorAll(".timeline-pagination_list_item"))
    console.log(pages)
    const textNode = pages.find(
      p => p.firstChild.nodeName == "#text"
      );
    return Number(textNode.innerText.split(" ")[2])
  })

  let iteration = 0;
  let result = {};

  let hasButton = await page.evaluate(() => document.querySelector('button[aria-label="Go to next page"]'))

  console.log(limit, hasButton) 
  while (hasButton && iteration <= limit) {
    iteration++;
    await tallyCurPg(result);
    page.click('button[aria-label="Go to next page"]')
    hasButton = await page.evaluate(() => document.querySelector('button[aria-label="Go to next page"]'))
  }

  async function tallyCurPg(obj) {
    const timeline = await page.evaluate(() => {
      return Array
        .from(document.querySelectorAll("tr.timeline-row a"))
        .map(a => a.getAttribute('href').split("/")[5])
        .reduce((a, c) => {
          a[c] != null ? a[c]++ : (a[c] = 1);
          return a;
        }, obj);
    })
    return timeline
  }

  await browser.close()

  console.log('result', result)
  return result
}

tally()


export const TallyFCC = (req, res) => {
  
  res.send('Hello')
}

// browser console version
// function tallyTimeline() {
//   const pages = document.querySelectorAll(".timeline-pagination_list_item");
//   const textNode = Array.from(pages).find(
//     p => p.firstChild.nodeName == "#text"
//   );
//   const limit = Number(textNode.innerText.split(" ")[2]);
//   let iteration = 0;
//   const countObj = {};
//   let hasButton = document.querySelector("button[aria-label='Go to next page']");
//   while (hasButton && iteration <= limit) {
//     iteration++;
//     tallyThisPage(countObj);
//     hasButton.click();
//     hasButton = document.querySelector("button[aria-label='Go to next page']");
//   }

//   function tallyThisPage(obj) {
//     var xpath = "//h2[text()='Timeline']";
//     var matchingElement = document.evaluate(
//       xpath,
//       document,
//       null,
//       XPathResult.FIRST_ORDERED_NODE_TYPE,
//       null
//     ).singleNodeValue;
//     return Array.from(
//       matchingElement.nextElementSibling.querySelectorAll("tbody a")
//     )
//       .map(i => i.href.split("/")[5])
//       .reduce((a, c) => {
//         a[c] != null ? a[c]++ : (a[c] = 1);
//         return a;
//       }, obj);
//   }
//   return countObj;
// }
