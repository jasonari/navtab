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
  if (!lastSrcs) {
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

const DURATION = 5000
function autoRefresh() {
  setTimeout(async () => {
    if (await needUpdate()) {
      const result = confirm(
        'New updates are available. Do you want to refresh?'
      )
      if (result) {
        location.reload()
      }
    }
    autoRefresh()
  }, DURATION)
}

autoRefresh()
