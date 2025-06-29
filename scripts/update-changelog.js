// update-changelog.js
import fs from 'fs'
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
    const tags = execSync('git tag --sort=-creatordate')
      .toString()
      .trim()
      .split('\n')
      .filter(Boolean)

    if (tags.length === 0) {
      console.warn('⚠️ No tags found in the repository.')
      return null
    }

    return tags[0]
  } catch (error) {
    console.warn('⚠️ Failed to get git tags:', error.message || error)
    return null
  }
}

function parseVersionParts(v) {
  return v
    .replace(/^v/, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0)
}

function compareVersion(version, lastTag) {
  const [major1, minor1, patch1] = parseVersionParts(version)
  const [major2, minor2, patch2] = parseVersionParts(lastTag)

  const isVersionGreater =
    major1 > major2 ||
    (major1 === major2 && minor1 > minor2) ||
    (major1 === major2 && minor1 === minor2 && patch1 > patch2)

  if (!isVersionGreater) {
    console.error(
      `❌ Version "${version}" is not greater than last tag "${lastTag}".`
    )
    process.exit(1)
  }
}

function getVersionInfo(version, lastTag) {
  const normalizedVersion = version.replace(/^v/, '')
  const hasVPrefix = lastTag && /^v/.test(lastTag)
  const newTag = hasVPrefix ? `v${normalizedVersion}` : normalizedVersion

  const compareUrl = lastTag
    ? `${CONFIG.repo.repoUrl}/compare/${lastTag}...${newTag}`
    : null

  return {
    version: normalizedVersion,
    date: new Date().toISOString().split('T')[0],
    compareUrl
  }
}

function getCommits(lastTag) {
  try {
    const range = lastTag ? `${lastTag}..HEAD` : ''
    const command = `git log ${range} --pretty=format:"%s%b"`
    const output = execSync(command).toString().trim()
    return output.split('\n').filter(Boolean)
  } catch (error) {
    console.error('❌ Failed to get git logs:', error.message)
    process.exit(1)
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
    parsedCommits.forEach((commit) => {
      if (commit.type === key && commit.subject) {
        acc[key].push(commit.subject)
      }
    })
    return acc
  }, {})

  return groupedCommits
}

function generateChangelog(versionInfo, groupedCommits) {
  let changelogContent = ''

  changelogContent += versionInfo.compareUrl
    ? `### [${versionInfo.version}](${versionInfo.compareUrl}) (${versionInfo.date})\n\n`
    : `### ${versionInfo.version} (${versionInfo.date})\n\n`

  const hasContent = Object.values(groupedCommits).some((arr) => arr.length > 0)

  if (!hasContent) {
    changelogContent += '- Initial release.\n\n'
    return changelogContent
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

  fs.writeFileSync('.RELEASE_NOTES.md', changelogContent, 'utf8')

  const changelog = '## Changelog\n\n' + changelogContent

  return changelog
}

function writeChangelog(changelog) {
  try {
    let content = ''
    if (!fs.existsSync('CHANGELOG.md')) {
      content = changelog
    } else {
      const existingContent = fs.readFileSync('CHANGELOG.md', 'utf8')
      if (existingContent.includes('## Changelog\n\n')) {
        content = existingContent.replace('## Changelog\n\n', changelog)
      } else {
        content = changelog + existingContent
      }
    }

    fs.writeFileSync('CHANGELOG.md', content, 'utf8')
  } catch (error) {
    console.error('❌ Failed to write changelog:', error)
    process.exit(1)
  }
}

function main() {
  const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version
  const lastTag = getLastTag()

  if (lastTag) {
    compareVersion(version, lastTag)
  }

  const versionInfo = getVersionInfo(version, lastTag)
  const commits = getCommits(lastTag)
  const parsedCommits = parseCommits(commits)
  const groupedCommits = groupCommits(parsedCommits)
  const changelog = generateChangelog(versionInfo, groupedCommits)

  writeChangelog(changelog)

  console.log('✨ Successfully updated CHANGELOG.md')
}

main()
