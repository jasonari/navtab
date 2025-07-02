// update-version.js
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

function getCurrentVersion() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

    if (!packageJson.version) {
      throw new Error('Missing "version" field in package.json')
    }

    return packageJson.version
  } catch (error) {
    throw new Error(`Failed to get current version: ${error.message}`)
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
      return null
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

    return null
  } catch (error) {
    throw new Error(`Failed to analyze commits: ${error.message}`)
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
      throw new Error(`Unknown bump version type: ${bumpType}`)
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
  } catch (error) {
    throw new Error(`Failed to update package version: ${error.message}`)
  }
}

async function main() {
  const currentVersion = getCurrentVersion()
  const bumpType = getVersionBumpType()

  if (!bumpType) {
    console.log('🫠  No new commits or version bump required. Skipping...')
    process.exit(0)
  }

  const newVersion = incrementVersion(currentVersion, bumpType)
  await updatePackageJson(newVersion)

  console.log(`✨ Successfully updated version to v${newVersion}`)
}

main().catch((error) => {
  console.error('Failed to run version-bump:', error)
  process.exit(1)
})
