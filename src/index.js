'use strict'
const core = require('@actions/core')

const { spawn } = require('child_process')
const { spawnSync } = require('child_process')

const runScript = (shell, script) => {
    const child = spawn(shell, [script], {
        detached: true,
    })

    child.stdout.on('data', (data) => {
        core.info(data)
    })
    child.stderr.on('data', (data) => {
        core.error(data)
    })

    return child
}

const checkProcessIsReady = (shell, script, timeout, callbackResult) => {
    const checkInterval = 1000
    let counter = 0
    let success = false
    let interval = null

    function check() {
        core.info(`run check if process is ready number ${counter}`)

        const result = spawnSync(shell, [script])
        if (result.error) {
            core.error(result.error)
        } else {
            core.info(result.stdout)
            success = true
        }

        counter++
        if (!interval) {
            interval = setInterval(check, checkInterval)
        }

        if (success || counter >= timeout) {
            clearInterval(interval)
            if (!success) {
                callbackResult('error')
                return
            }
            callbackResult('success')
        }
    }

    check()
}

try {
    const script = core.getInput('script')
    const readinessScript = core.getInput('readiness-script')
    const shell = core.getInput('shell')
    const timeout = core.getInput('timeout')

    const child = runScript(shell, script)
    checkProcessIsReady(shell, readinessScript, timeout, (result) => {
        if (result === 'success') {
            child.unref()
        } else {
            core.setFailed('readiness check failed')
            child.kill()
        }
    })
} catch (error) {
    core.setFailed(error.message)
}
