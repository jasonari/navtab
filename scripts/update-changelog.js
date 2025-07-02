// update-changelog.js
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const owner = process.env.REPO_OWNER || 'jasonari'
const name = process.env.REPO_NAME || 'navtab'

const CONFIG = {
  types: {
    feat: { title: 'Features' },
    fix: { title: 'Bug Fixes' }
  },
  repo: {
    owner,
    name,
    repoUrl: `https://github.com/${owner}/${name}`
  }
}

function getLastTag() {
  try {
    const tags = execSync('git tag --sort=-creatordate', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    })
      .trim()
      .split('\n')
      .filter(Boolean)

    if (tags.length === 0) {
      return null
    }

    return tags[0]
  } catch (error) {
    throw new Error(`Failed to get git tags: ${error.message}`)
  }
}

function parseVersionParts(v) {
  if (!v) return [0, 0, 0]

  return v
    .replace(/^v/, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0)
}

function compareVersion(version, lastTag) {
  if (!lastTag) return true

  const [major1, minor1, patch1] = parseVersionParts(version)
  const [major2, minor2, patch2] = parseVersionParts(lastTag)

  const isVersionGreater =
    major1 > major2 ||
    (major1 === major2 && minor1 > minor2) ||
    (major1 === major2 && minor1 === minor2 && patch1 > patch2)

  if (!isVersionGreater) {
    throw new Error(
      `Version "${version}" is not greater than last tag "${lastTag}"`
    )
  }

  return true
}

function getVersionInfo(version, lastTag) {
  const normalizedVersion = version.replace(/^v/, '')
  let compareUrl = null

  if (lastTag) {
    const hasVPrefix = /^v/.test(lastTag)
    const newTag = hasVPrefix ? `v${normalizedVersion}` : normalizedVersion
    compareUrl = `${CONFIG.repo.repoUrl}/compare/${lastTag}...${newTag}`
  }

  return {
    version: normalizedVersion,
    date: new Date().toISOString().split('T')[0],
    compareUrl
  }
}

function getCommits(lastTag) {
  try {
    const command = lastTag
      ? `git log ${lastTag}..HEAD --pretty=format:"%s %b"`
      : `git log --pretty=format:"%s %b"`

    const output = execSync(command, { encoding: 'utf8' }).trim()
    return output.split('\n').filter(Boolean)
  } catch (error) {
    throw new Error(`Failed to get git logs: ${error.message}`)
  }
}

function parseCommits(commits) {
  const regex = /^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/
  return commits
    .map((commit) => {
      const match = commit.match(regex)
      if (!match) return null
      const [, type, scope, subject] = match
      return { type, scope: scope || null, subject }
    })
    .filter(Boolean)
}

function groupCommits(parsedCommits) {
  const groupedCommits = Object.keys(CONFIG.types).reduce((acc, key) => {
    acc[key] = []
    return acc
  }, {})

  parsedCommits.forEach((commit) => {
    if (CONFIG.types[commit.type] && commit.subject) {
      groupedCommits[commit.type].push(commit.subject)
    }
  })

  return groupedCommits
}

function generateChangelog(versionInfo, groupedCommits) {
  let changelogContent = '## Changelog\n\n'

  changelogContent += versionInfo.compareUrl
    ? `### [${versionInfo.version}](${versionInfo.compareUrl}) (${versionInfo.date})\n\n`
    : `### ${versionInfo.version} (${versionInfo.date})\n\n`

  const hasContent = Object.values(groupedCommits).some((arr) => arr.length > 0)

  if (!hasContent) {
    changelogContent +=
      '- No significant changes (initial release or maintenance update).\n\n'
    return { full: changelogContent, releaseNotes: changelogContent }
  }

  for (const type of Object.keys(groupedCommits)) {
    const commits = groupedCommits[type]
    if (commits.length === 0) continue

    changelogContent += `#### ${CONFIG.types[type].title}\n\n`

    commits.forEach((commit) => {
      const replaced = commit.replace(/\(#(\d+)\)|#(\d+)/g, (_, pr1, pr2) => {
        const prNumber = pr1 || pr2
        return `([#${prNumber}](${CONFIG.repo.repoUrl}/pull/${prNumber}))`
      })
      changelogContent += `- ${replaced}\n`
    })

    changelogContent += '\n'
  }

  const releaseNotes = changelogContent
    .replace(/^## Changelog\n+/, '')
    .replace(/^###\s.*\n+/, '')

  return { full: changelogContent, releaseNotes }
}

function writeChangelog(changelog) {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md')
    const releaseNotesPath = path.join(process.cwd(), '.RELEASE_NOTES.md')

    let content = ''

    if (!fs.existsSync(changelogPath)) {
      content = changelog.full
    } else {
      const existingContent = fs.readFileSync(changelogPath, 'utf8')
      if (existingContent.includes('## Changelog\n\n')) {
        content = existingContent.replace('## Changelog\n\n', changelog.full)
      } else {
        content = changelog.full + existingContent
      }
    }

    fs.writeFileSync(changelogPath, content, 'utf8')
    fs.writeFileSync(releaseNotesPath, changelog.releaseNotes, 'utf8')
  } catch (error) {
    throw new Error(`Failed to write changelog: ${error.message}`)
  }
}

function main() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    const version = packageJson.version

    if (!version) {
      throw new Error('Missing "version" field in package.json')
    }

    const lastTag = getLastTag()
    compareVersion(version, lastTag)

    const versionInfo = getVersionInfo(version, lastTag)
    const commits = getCommits(lastTag)
    const parsedCommits = parseCommits(commits)
    const groupedCommits = groupCommits(parsedCommits)
    const changelog = generateChangelog(versionInfo, groupedCommits)

    writeChangelog(changelog)

    console.log('✨ Successfully updated CHANGELOG.md')
  } catch (error) {
    console.error(`❌ ${error.message}`)
    process.exit(1)
  }
}

main()
