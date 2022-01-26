const program = require('commander')
const path = require('path')
const { version } = require('./constants')
const mapActions = {
  create: {
    alias: 'c',
    description: 'create a project',
    examples: [
      'lrxc-cli create <project-name>'
    ],
  },
  config: {
    alias: 'conf',
    description: 'config project variable',
    examples: [
      'lrxc-cli config set <k> <v>',
      'lrxc-cli config get <k>',
      'lrxc-cli config remove <k>',
    ]
  },
  '*': {
    alias: '',
    description: 'command not found',
    examples: []
  }
}
Reflect.ownKeys(mapActions).forEach(action => {
  program
    .command(action)
    .alias(mapActions[action].alias)
    .description(mapActions[action].description)
    .action(env => {
      if (action === '*') {
        console.log(mapActions[action].description)
      } else {
        require(path.resolve(__dirname, action))(...process.argv.slice(3))
      }
    })
})
program.on('--help', () => {
  console.log('\nexample:')
  Reflect.ownKeys(mapActions).forEach(action => {
    mapActions[action].examples.forEach(example => {
      console.log(example)
    })
  })
})
program.version(version).parse(process.argv)
console.log(process.argv)
