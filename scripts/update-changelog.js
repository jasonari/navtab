// update-changelog.js
import fs from 'fs'
// import path from 'path'
import { execSync } from 'child_process'

// const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');

const CONFIG = {
  types: {
    feat: { title: 'Features', emoji: '✨' },
    fix: { title: 'Bug Fixes', emoji: '🐛' }
  }
}

function getTags() {
  const tags = execSync('git tag --sort=-creatordate')
    .toString()
    .trim()
    .split('\n')

  const latestTag = tags[0]
  const previousTag = tags[1]

  return { previousTag, latestTag }
}

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

async function main() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

  const { previousTag, latestTag } = getTags()

  if (packageJson.version !== latestTag.split('v')[1]) {
    throw new Error('Version mismatch')
  }

  const commits = getCommits(previousTag, latestTag)
  console.log('🚀 ~ main ~ commits:', commits)

  const parsedCommits = parseCommits(commits)
  console.log('🚀 ~ main ~ parsedCommits:', parsedCommits)

  const groupedCommits = groupCommits(parsedCommits)
  console.log('🚀 ~ main ~ groupedCommits:', groupedCommits)
}

main().catch((error) => {
  console.error('❌ Error updating changelog:', error)
  process.exit(1)
})
