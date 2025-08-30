// auto-update.ts
let lastSrcs = []

const scriptReg = /<script.*src=["'](?<src>[^"']+)/gm

async function extractNewScripts() {
  const html = await fetch('/?_timestamp=' + Date.now()).then((resp) => {
    return resp.text()
  })
  scriptReg.lastIndex = 0
  let result = []
  let match
  while ((match = scriptReg.exec(html))) {
    result.push(match.groups.src)
  }
  return result
}

async function needUpdate() {
  const newScripts = await extractNewScripts()
  if (lastSrcs.length === 0) {
    lastSrcs = newScripts
    return false
  }
  let result = false
  if (lastSrcs.length !== newScripts.length) {
    result = true
  }
  for (let i = 0; i < lastSrcs.length; i++) {
    if (lastSrcs[i] !== newScripts[i]) {
      lastSrcs = newScripts
      result = true
      break
    }
  }
  lastSrcs = newScripts
  return result
}

const DURATION = 10 * 60 * 1000
function autoRefresh() {
  setTimeout(async () => {
    const result = await needUpdate()
    if (result) {
      const confirmResult = confirm(
        'New updates are available. Do you want to refresh?'
      )
      if (confirmResult) {
        location.reload()
      }
    }
    autoRefresh()
  }, DURATION)
}

autoRefresh()
