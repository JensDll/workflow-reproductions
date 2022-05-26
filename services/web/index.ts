import { Octokit } from '@octokit/rest'
import crypto from 'node:crypto'

const github = new Octokit({
  auth: process.argv[2],
  baseUrl: 'https://api.github.com',
  userAgent: 'Octokit playground'
})

const owner = 'JensDll'
const repo = 'workflow-reproductions'

type Options = {
  title: string
  head: string
  base: string
  deleteHead?: boolean
}

async function pullMerge(options: Options) {
  const { data: head } = await github.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${options.head}`
  })

  const { data: pullRequest } = await github.rest.pulls.create({
    owner,
    repo,
    base: options.base,
    head: options.head,
    title: options.title,
    body: '',
    commit_message: options.title
  })

  await github.rest.pulls.merge({
    owner,
    repo,
    pull_number: pullRequest.number,
    merge_method: 'merge'
  })

  await github.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${options.base}`,
    sha: head.object.sha,
    force: true
  })

  if (options.deleteHead) {
    await github.rest.git.deleteRef({
      owner,
      repo,
      ref: `heads/${options.head}`
    })
  }
}

await pullMerge({ title: crypto.randomUUID(), base: 'main', head: 'staging' })
