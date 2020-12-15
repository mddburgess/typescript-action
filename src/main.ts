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
    const response = await octokit.checks.update({
      ...github.context.repo,
      check_run_id: check.data.id,
      status: 'completed',
      conclusion: 'failure',
      output: {
        title: '',
        summary: 'summary',
        text: 'text details',
        annotations: [
          {
            path: 'src/main.ts',
            start_line: 0,
            end_line: 0,
            annotation_level: 'failure',
            message: 'message'
          }
        ]
      }
    })
    core.debug(JSON.stringify(response.data, undefined, 2))
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
