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
const rollup = await challenges.reduce((a, c) => (a[c]&&=a[c]+1, a[c]||=1, a), count)
if(!(iteration%30)) console.log(`rollup ${iteration}`, await rollup) // in-process debug logging

fs.writeFile(`./output/${studentName}.json`, JSON.stringify(result, null, 2), err => {
  if(err) throw err
  console.error(err) 
})
