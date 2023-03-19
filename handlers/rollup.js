import * as fs from 'fs';

const studentName = 'brett'

const result = JSON.parse(fs.readFileSync(`./output/${studentName}-hrefs.json`));
// console.log(result)

function readWriteFile() {
  fs.readFile(`./output/${studentName}-hrefs.json`, 'utf-8', (err, data) => {
    if(err) throw err
    console.log(data)
    // fs.writeFile('./output/students.html', `<div>${data}</div>`, err => {
    //   if(err) throw err
    //   console.log('File creation was successful.')
    // })
  })
}
// readWriteFile()

function rollup (hrefs) {
  const challenges = hrefs.map(href => {
    const isProject = href.includes('project')
    const isCertificate = href.includes('certificat') // matches certification or certificate
    const kind = href.split('/')[3] ?? href
    if(isProject) {
      return 'project-'+ href.split('/').at(-1)
    } else if(isCertificate) {
      return 'certificate-'+ href.split('/').at(-1)
    } else {
      return kind
    }
  })
  const rollup = challenges.reduce((a, c) => (a[c]&&=a[c]+1, a[c]||=1, a), {})

  fs.writeFile(`./output/${studentName}-rollup.json`, JSON.stringify(rollup, null, 2), err => {
    if(err) throw err
    console.error(err) 
  })
  console.log('rollup', rollup)
  return rollup
}

rollup(result)
