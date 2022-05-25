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
}

async function pullMerge(options: Options) {
  const { data: pullRequest } = await github.rest.pulls.create({
    owner,
    repo,
    base: 'main',
    head: 'staging',
    title: options.title,
    body: '',
    commit_message: options.title
  })

  console.log(pullRequest)
}

await pullMerge({ title: crypto.randomUUID() })

// const mergeResult = await github.rest.pulls.merge({
//   owner: '${{ github.event.repository.owner.login }}',
//   repo: '${{ github.event.repository.name }}',
//   pull_number: pullRequest.data.number,
//   merge_method: '${{ inputs.merge_method }}'
// })

// console.log(mergeResult.status)
// if ('${{ inputs.delete_head }}' === 'false') {
//   return
// }
// const deleteResult = await github.rest.git.deleteRef({
//   owner: '${{ github.event.repository.owner.login }}',
//   repo: '${{ github.event.repository.name }}',
//   ref: 'heads/${{ inputs.head }}'
// })
