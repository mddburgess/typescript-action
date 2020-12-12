import * as core from '@actions/core'
import * as github from '@actions/github'
import {wait} from './wait'

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token')
    const octokit = github.getOctokit(token)

    core.debug('Creating check run')
    const check = await octokit.checks.create({
      ...github.context.repo,
      name: 'sandbox',
      head_sha: github.context.sha,
      status: 'in_progress'
    })

    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())

    core.debug('Updating check run')
    await octokit.checks.update({
      ...github.context.repo,
      check_run_id: check.data.id,
      status: 'completed',
      conclusion: 'success'
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
