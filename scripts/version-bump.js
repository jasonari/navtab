import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

function getCurrentVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    return packageJson.version
  } catch (error) {
    console.error('Failed to get current version:', error.message)
    process.exit(1)
  }
}

function getVersionBumpType() {
  try {
    const latestTag = execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()

    const commitCommand = latestTag
      ? `git log ${latestTag}..HEAD --pretty=format:"%s%n%b"`
      : 'git log --pretty=format:"%s%n%b"'

    const commits = execSync(commitCommand, { encoding: 'utf8' }).trim()

    if (!commits) {
      console.log('No new commits found. Skipping version bump.')
      process.exit(0)
    }

    const commitLines = commits.split('\n\n')

    if (
      commitLines.some(
        (line) =>
          line.includes('BREAKING CHANGE') || line.includes('BREAKING CHANGES')
      )
    ) {
      return 'major'
    }

    if (commitLines.some((line) => /^feat(\([^)]+\))?:/.test(line))) {
      return 'minor'
    }

    if (commitLines.some((line) => /^fix(\([^)]+\))?:/.test(line))) {
      return 'patch'
    }

    return 'patch'
  } catch (error) {
    console.error('Failed to get commits:', error.message)
    process.exit(1)
  }
}

function incrementVersion(currentVersion, bumpType) {
  const [major, minor, patch] = currentVersion.split('.').map(Number)

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
    default:
      console.error('Unknown bump version type:', bumpType)
      process.exit(1)
  }
}

async function updatePackageJson(version) {
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    packageJson.version = version

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', {
      encoding: 'utf8'
    })
    console.log(`Update package version to: ${version}`)
  } catch (error) {
    console.error('Failed to update package version:', error.message)
    process.exit(1)
  }
}

async function main() {
  const currentVersion = getCurrentVersion()
  const bumpType = getVersionBumpType()
  const newVersion = incrementVersion(currentVersion, bumpType)

  await updatePackageJson(newVersion)

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `new_version=${newVersion}\n`)
  } else {
    console.log(`New version: ${newVersion}`)
  }
}

main().catch((error) => {
  console.error('Failed to run version-bump:', error)
  process.exit(1)
})
