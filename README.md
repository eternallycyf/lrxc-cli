## use
```js
npm install lrxc-cli -g
lrxc-cli create project-name
lrxc-cli config set repo repo-name
```

## fork
```js
#1. 修改create.js中 这些配置改为自己的github名字
  const { data } = await axios.get('https://api.github.com/users/eternallycyf/repos')
  const { data } = await axios.get(`https://api.github.com/repos/eternallycyf/${repo}/tags`);
  let api = `eternallycyf/${repo}`
#2.package.json中 配置下自己cli的描述信息
#3.npm注意切换到npm源 否则无法登录
#4.npm login
#5.npm publish  
npm install lrxc-cli -g
lrxc-cli create xxx
1.0
```