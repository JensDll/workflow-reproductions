import { Octokit } from '@octokit/rest'

const github = new Octokit({
  auth: process.argv[2],
  baseUrl: 'https://api.github.com',
  userAgent: 'Octokit playground'
})

const result = await github.request('GET /user/repos', {})

console.log(result)
