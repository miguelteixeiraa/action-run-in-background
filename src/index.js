'use strict'
const core = require('@actions/core')

const { spawn } = require('child_process')
const { spawnSync } = require('child_process')

const runScript = (shell, script) => {
    try {
        const child = spawn(shell, ['-c', script], {
            detached: true,
        })

        return child
    } catch (error) {
        throw new Error(
            `An error ocurred while trying to run the script ${error}`
        )
    }
}

const checkProcessIsReady = (shell, script, timeout, callbackResult) => {
    const checkInterval = 5000
    let counter = 0
    let success = false
    let interval = null

    function check() {
        core.info(`run check if process is ready number ${counter}`)

        const result = spawnSync(shell, ['-c', script])
        if (result.status) {
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

    try {
        check()
    } catch (error) {
        throw new Error(
            `An error ocurred while checking for script readiness ${error}`
        )
    }
}

try {
    const script = core.getInput('script')
    const readinessScript = core.getInput('readiness-script')
    const shell = core.getInput('shell')
    const timeout = core.getInput('timeout')

    const child = runScript(shell, script)
    checkProcessIsReady(shell, readinessScript, timeout, (result) => {
        if (result !== 'success') {
            core.setFailed('readiness check failed')
            child.kill()
        } else {
            child.unref()
            child.disconnect()
        }
    })
} catch (error) {
    core.setFailed(error.message)
}
