// update-changelog.js
import fs from 'fs'
import { execSync } from 'child_process'

const owner = process.env.REPO_OWNER || 'jasonari'
const name = process.env.REPO_NAME || 'navtab'

const CONFIG = {
  types: { feat: { title: 'Features' }, fix: { title: 'Bug Fixes' } },
  repo: {
    owner,
    name,
    repoUrl: `https://github.com/${owner}/${name}`
  }
}

/**
 * Get the latest and previous tags from the git repository.
 * @returns { { previousTag: string, latestTag: string } }
 */
function getTags() {
  const tags = execSync('git tag --sort=-creatordate')
    .toString()
    .trim()
    .split('\n')

  const latestTag = tags[0]
  const previousTag = tags[1]

  return { previousTag, latestTag }
}

/**
 * Get version information including version number, date, and compare URL.
 * @param {string} version
 * @param {string} previousTag
 * @param {string} latestTag
 * @returns
 */
function getVersionInfo(version, previousTag, latestTag) {
  return {
    version,
    date: new Date().toISOString().split('T')[0], // format: YYYY-MM-DD
    compareUrl: `https://github.com/${CONFIG.repo.owner}/${CONFIG.repo.name}/compare/${previousTag}...${latestTag}`
  }
}

/**
 * Get the commits between two tags.
 * @param {string} previousTag
 * @param {string} latestTag
 * @returns
 */
function getCommits(previousTag, latestTag) {
  try {
    let gitLog = []

    // previousTag..latestTag
    if (latestTag && previousTag) {
      gitLog = execSync(
        `git log ${previousTag}..${latestTag} --pretty=format:"%s%b"`
      )
        .toString()
        .trim()
        .split('\n')
    }

    // init..latestTag
    if (latestTag && !previousTag) {
      const initialCommitHash = execSync('git rev-list --max-parents=0 HEAD')
        .toString()
        .trim()

      gitLog = execSync(
        `git log ${initialCommitHash}..${latestTag} --pretty=format:"%s%b"`
      )
        .toString()
        .trim()
        .split('\n')
    }

    // No tags found
    if (!latestTag) {
      console.warn('📭 No tags found in the repository.')
      process.exit(0)
    }

    const commits = gitLog
      .filter(Boolean)
      .map((commit) => commit.trim())
      .filter(Boolean)

    return commits
  } catch (error) {
    console.error('❌ Failed to get recent tags: ', error)
    process.exit(1)
  }
}

/**
 * Parse the commit messages to extract type, scope, and subject.
 * @param {string[]} commits
 * @returns
 */
function parseCommits(commits) {
  const regex = /^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/

  const paredCommits = commits
    .map((commit) => {
      const match = commit.match(regex)
      if (!match) return null
      const [, type, scope, subject] = match
      return {
        type,
        scope: scope || null,
        subject
      }
    })
    .filter(Boolean)

  return paredCommits
}

/**
 * Group commits by type.
 * @param {{ type: string, scope: string | null, subject: string }[]} parsedCommits
 * @returns
 */
function groupCommits(parsedCommits) {
  const groupedCommits = Object.keys(CONFIG.types).reduce((acc, key) => {
    acc[key] = []

    parsedCommits.map((commit) => {
      if (commit.type === key && commit.subject) {
        acc[key].push(commit.subject)
      }
    })

    return acc
  }, {})

  return groupedCommits
}

/**
 * Generate changelog by versionInfo and groupedCommits.
 * @param {{ version: string, date: string, compareUrl: string }} versionInfo
 * @param {{}} groupedCommits
 * @returns
 */
function generateChangelog(versionInfo, groupedCommits) {
  let changelogContent = '## Changelog\n\n'

  // version info
  changelogContent += `### [${versionInfo.version}](${versionInfo.compareUrl}) (${versionInfo.date})\n\n`

  // section
  Object.keys(groupedCommits).map((type) => {
    if (groupedCommits[type].length === 0) return

    // type title
    const { title } = CONFIG.types[type]
    changelogContent += `#### ${title}\n\n`

    // subjects
    groupedCommits[type].map((commit) => {
      const replaced = commit.replace(/\(#(\d+)\)|#(\d+)/g, (_, pr1, pr2) => {
        const prNumber = pr1 || pr2
        return `([#${prNumber}](${CONFIG.repo.repoUrl}/pull/${prNumber}))`
      })
      changelogContent += `- ${replaced}\n`
    })

    // add newline
    changelogContent += '\n'
  })

  return changelogContent
}

async function writeChangelog(changelog) {
  try {
    const existedChangelog = fs.readFileSync('CHANGELOG.md', 'utf8')
    const updatedChanglog = existedChangelog.replace(
      '## Changelog\n\n',
      changelog
    )
    fs.writeFileSync('CHANGELOG.md', updatedChanglog, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') {
      fs.writeFileSync('CHANGELOG.md', changelog, 'utf8')
    } else {
      throw new Error('Failed to write changelog:', error)
    }
  }
}

async function main() {
  const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version
  const { previousTag, latestTag } = getTags()

  if (version !== latestTag.split('v')[1]) {
    throw new Error('Version mismatch')
  }

  const versionInfo = getVersionInfo(version, previousTag, latestTag)
  const commits = getCommits(previousTag, latestTag)
  const parsedCommits = parseCommits(commits)
  const groupedCommits = groupCommits(parsedCommits)
  const changelog = generateChangelog(versionInfo, groupedCommits)
  writeChangelog(changelog)

  console.log('✨ Successfully generated the changelog!')
}

main().catch((error) => {
  console.error('❌ Error updating changelog:', error)
  process.exit(1)
})
