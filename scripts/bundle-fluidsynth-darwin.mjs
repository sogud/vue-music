import { copyFileSync, chmodSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { basename, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const platformDir = `darwin-${process.arch}`
const outputDir = join(root, 'resources', 'bin', platformDir)
const libDir = join(outputDir, 'lib')
const systemPrefixes = ['/System/Library/', '/usr/lib/']

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options })
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed\n${result.stderr || result.stdout}`)
  }
  return result.stdout
}

function commandPath(command) {
  return run('/bin/zsh', ['-lc', `command -v ${command}`]).trim()
}

function isSystemDependency(path) {
  return systemPrefixes.some((prefix) => path.startsWith(prefix))
}

function readDependencies(file) {
  return run('otool', ['-L', file])
    .split('\n')
    .slice(1)
    .map((line) => line.trim().split(' ')[0])
    .filter((path) => path.startsWith('/') && !isSystemDependency(path))
}

function copyExecutable(source) {
  const destination = join(outputDir, 'fluidsynth')
  copyFileSync(source, destination)
  chmodSync(destination, 0o755)
  return destination
}

function copyLibrary(source) {
  const destination = join(libDir, basename(source))
  if (!existsSync(destination)) {
    copyFileSync(source, destination)
    chmodSync(destination, 0o644)
  }
  return destination
}

function patchLoadCommands(file, dependencies, isExecutable) {
  for (const dependency of dependencies) {
    const replacement = isExecutable ? `@loader_path/lib/${basename(dependency)}` : `@loader_path/${basename(dependency)}`
    run('install_name_tool', ['-change', dependency, replacement, file])
  }
  if (!isExecutable) {
    run('install_name_tool', ['-id', `@loader_path/${basename(file)}`, file])
  }
}

function signAdHoc(file) {
  run('codesign', ['--force', '--sign', '-', file])
}

function bundle() {
  if (process.platform !== 'darwin') throw new Error('This script only bundles FluidSynth for macOS.')

  const sourceExecutable = process.env.FLUIDSYNTH_PATH || commandPath('fluidsynth')
  if (!sourceExecutable) throw new Error('fluidsynth not found. Install it once on the build machine with: brew install fluid-synth')

  rmSync(outputDir, { recursive: true, force: true })
  mkdirSync(libDir, { recursive: true })

  const executable = copyExecutable(sourceExecutable)
  const queue = readDependencies(sourceExecutable)
  const copied = new Map()
  const sourceDepsByDest = new Map()

  while (queue.length > 0) {
    const source = queue.shift()
    if (!source || copied.has(source) || isSystemDependency(source)) continue
    if (!existsSync(source)) {
      console.warn(`Skipping missing dependency: ${source}`)
      continue
    }
    const destination = copyLibrary(source)
    copied.set(source, destination)
    const deps = readDependencies(source)
    sourceDepsByDest.set(destination, deps)
    queue.push(...deps)
  }

  patchLoadCommands(executable, readDependencies(sourceExecutable), true)
  signAdHoc(executable)

  for (const [destination, deps] of sourceDepsByDest) {
    patchLoadCommands(destination, deps, false)
    signAdHoc(destination)
  }

  console.log(`Bundled FluidSynth to ${outputDir}`)
  console.log(`Copied ${copied.size} dynamic libraries.`)
}

bundle()
