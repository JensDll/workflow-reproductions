import { Octokit, type RestEndpointMethodTypes } from '@octokit/rest'
import crypto from 'node:crypto'

const github = new Octokit({
  auth: process.argv[2],
  baseUrl: 'https://api.github.com',
  userAgent: 'Octokit playground'
})

const owner = 'JensDll'
const repo = 'workflow-reproductions'

// adwawdawdwa
type MergeMethod = 'github_merge' | 'github_squash' | 'github_rebase' | 'rebase'

type Options = {
  title: string
  head: string
  base: string
  deleteHead?: boolean
  merge_method?: MergeMethod
}

async function checkWorkflowRun(
  ref: RestEndpointMethodTypes['git']['getRef']['response']['data']
) {
  const branch = ref.ref.match(/[^/]+$/)![0]

  const {
    data: { workflow_runs }
  } = await github.rest.actions.listWorkflowRunsForRepo({
    owner,
    repo,
    branch,
    exclude_pull_requests: true,
    event: 'push',
    per_page: 10
  })

  const runs = workflow_runs.filter(run => run.head_sha === ref.object.sha)
  console.log(runs)
  console.log(
    `Found ${runs.length} workflow run result(s) for commit: ${ref.object.sha}`
  )
  console.log('Checking for failures ...')

  let anyFailed = false

  for (const run of runs) {
    if (run.conclusion === 'failure') {
      throw new Error(`[Aborting merge] Workflow run failed: ${run.html_url}`)
    }
  }

  // if (lastRun) {
  //   console.log(`Checking workflow run result for commit '${ref.object.sha}'`)

  //   if (lastRun.head_sha !== ref.object.sha) {
  //     throw new Error(
  //       'Aborting merge: Workflow run sha does not match head sha'
  //     )
  //   }

  //   if (lastRun.status === 'failure') {
  //     throw new Error(
  //       'Aborting merge: Workflow run did not succeed, please check the logs'
  //     )
  //   }
  // }

  // console.log(lastRun)
}

async function pullMerge(options: Options) {
  options.merge_method ??= 'github_merge'

  const { data: headRef } = await github.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${options.head}`
  })

  await checkWorkflowRun(headRef)

  // const { data: headCommit } = await github.rest.git.getCommit({
  //   owner,
  //   repo,
  //   commit_sha: headRef.object.sha
  // })

  // console.log(headCommit)

  // const { data: pullRequest } = await github.rest.pulls.create({
  //   owner,
  //   repo,
  //   base: options.base,
  //   head: options.head,
  //   title: options.title,
  //   body: '',
  //   commit_message: options.title
  // })

  // const { data: commits } = await github.rest.pulls.listCommits({
  //   owner,
  //   repo,
  //   pull_number: pullRequest.number
  // })

  // await github.rest.pulls.merge({
  //   owner,
  //   repo,
  //   pull_number: pullRequest.number,
  //   merge_method: 'merge'
  // })

  // await github.rest.git.updateRef({
  //   owner,
  //   repo,
  //   ref: `heads/${options.base}`,
  //   sha: headRef.object.sha,
  //   force: true
  // })

  // if (options.deleteHead) {
  //   await github.rest.git.deleteRef({
  //     owner,
  //     repo,
  //     ref: `heads/${options.head}`
  //   })
  // }
}

// await pullMerge({ title: crypto.randomUUID(), base: 'main', head: 'staging' })
