const axios = require('axios')
const ora = require('ora')
const Inquirer = require('inquirer')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
let ncp = require('ncp')
let downloadGitReop = require('download-git-repo')
const MetalSmith = require('metalsmith')
let { render } = require('consolidate').ejs
const { downloadDirectory } = require('./constants')
render = promisify(render)
downloadGitReop = promisify(downloadGitReop)
ncp = promisify(ncp)

const fetchRepoList = async () => {
  // 替换为自己的github名称 依据github api获取仓库信息的JSON
  // https://api.github.com/users/xxx/repos
  const { data } = await axios.get('https://api.github.com/users/eternallycyf/repos')
  return data
}
const fetchTagList = async (repo) => {
  // https://api.github.com/repos/xxx/${repo}/tags
  // 依据tag来下载tamplate 所以必须指定tag: git tag -a v1.4 -m "my version 1.4"
  const { data } = await axios.get(`https://api.github.com/repos/eternallycyf/${repo}/tags`);
  return data
}

const waitFnloading = (fn, message) => async (...args) => {
  const spinner = ora(message)
  spinner.start()
  const result = await fn(...args)
  spinner.succeed()
  return result
}

const download = async (repo, tag) => {
  // 填下自己的github名称
  // let api = `xxx/${repo}`
  let api = `eternallycyf/${repo}`
  if (tag) {
    api += `#${tag}`
  }
  const dest = `${downloadDirectory}/${repo}`
  await downloadGitReop(api, dest)
  return dest
}

module.exports = async (projectName) => {
  let repos = await waitFnloading(fetchRepoList, 'fetching template......')()
  repos = repos.map((item) => item.name)
  const { repo } = await Inquirer.prompt({
    name: 'repo',
    type: 'list',
    message: 'please choise a template to create project',
    choices: repos
  })
  let tags = await waitFnloading(fetchTagList, 'fetchng tags...')(repo)
  tags = tags.map((item) => item.name)
  const { tag } = await Inquirer.prompt({
    name: 'tag',
    type: "list",
    message: 'please choise tags to create project',
    choices: tags
  })
  const result = await waitFnloading(download, 'download template')(repo, tag)
  if (!fs.existsSync(path.join(result, 'ask.js'))) {
    await ncp(result, path.resolve(projectName))
  } else {
    await new Promise((resolve, reject) => {
      MetalSmith(__dirname)
        .source(result)
        .destination(path.resolve(projectName))
        .use(async (files, metal, done) => {
          const args = require(path.join(result, 'ask.js'))
          const obj = await Inquirer.prompt(args)
          const meta = metal.metadata()
          Object.assign(meta, obj)
          delete files['ask.js']
          done()
        })
        .use((files, metal, done) => {
          const obj = metal.metadata()
          Reflect.ownKeys(files).forEach(async file => {
            if (file.includes('js') || file.includes('json')) {
              let content = files[file].contents.toString()
              if (content.includes('<%')) {
                content = await render(content, obj)
                files[file].contents = Buffer.from(content)
              }
            }
          })
          done()
        })
        .build((err) => {
          if (err) {
            reject()
          } else {
            resolve()
          }
        })
    })
  }
}
