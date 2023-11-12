'use strict'
const core = require('@actions/core')

const { spawn } = require('child_process')
const { spawnSync } = require('child_process')

const runScript = (shell, script) => {
    try {
        const child = spawn(shell, ['-c', `(${script} && wait)`], {
            detached: true,
        })

        child.stdout.on('data', (data) => {
            core.info(data.toString())
        })
        child.stderr.on('data', (data) => {
            core.info(data.toString())
        })

        return child
    } catch (error) {
        throw new Error(
            `An error ocurred while trying to run the script ${error}`
        )
    }
}

const checkProcessIsReady = (shell, script, timeout, callbackResult) => {
    const checkInterval = 1000
    let counter = 0
    let success = false
    let interval = null

    function check() {
        core.info(`run check if process is ready number ${counter}`)

        const result = spawnSync(shell, ['-c', script])
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
