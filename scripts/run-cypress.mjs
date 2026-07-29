import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const environment = { ...process.env }
delete environment.ELECTRON_RUN_AS_NODE

const cypressCli = fileURLToPath(new URL('../node_modules/cypress/bin/cypress', import.meta.url))
const child = spawn(process.execPath, [cypressCli, 'run', ...process.argv.slice(2)], {
  env: environment,
  stdio: 'inherit',
})

child.once('error', (error) => {
  console.error(error)
  process.exitCode = 1
})

child.once('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0)
})
