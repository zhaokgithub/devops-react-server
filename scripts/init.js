// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const fs = require('fs-extra');
const path = require('path');
const chalk = require('react-dev-utils/chalk');
const execSync = require('child_process').execSync;
const spawn = require('react-dev-utils/crossSpawn');
const os = require('os');
const verifyTypeScriptSetup = require('./utils/verifyTypeScriptSetup');

function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function isInMercurialRepository() {
  try {
    execSync('hg --cwd . root', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

//初始化git仓库
function tryGitInit(appPath) {
  let didInit = false;
  try {
    execSync('git --version', { stdio: 'ignore' });
    if (isInGitRepository() || isInMercurialRepository()) {
      return false;
    }

    execSync('git init', { stdio: 'ignore' });
    didInit = true;

    execSync('git add -A', { stdio: 'ignore' });
    execSync('git commit -m "Initial commit from Create React App"', {
      stdio: 'ignore',
    });
    return true;
  } catch (e) {
    if (didInit) {
      // If we successfully initialized but couldn't commit,
      // maybe the commit author config is not set.
      // In the future, we might supply our own committer
      // like Ember CLI does, but for now, let's just
      // remove the Git files to avoid a half-done state.
      try {
        // unlinkSync() doesn't work on directories.
        fs.removeSync(path.join(appPath, '.git'));
      } catch (removeErr) {
        // Ignore.
      }
    }
    return false;
  }
}

module.exports = function (
  appPath,
  appName,
  verbose,
  originalDirectory,
  templateName
) {

  const appPackage = require(path.join(appPath, 'package.json'));
  const useYarn = fs.existsSync(path.join(appPath, 'yarn.lock'));
  if (!templateName) {
    console.error(
      `A template was not provided. This is likely because you're using an outdated version of ${chalk.cyan(
        'devops-react-cli'
      )}.`
    );
    return;
  }
  const templatePath = path.join(
    require.resolve(templateName, { paths: [appPath] }),
    '..'
  );
  let templateJsonPath;
  if (templateName) {
    templateJsonPath = path.join(templatePath, 'template.json');
  } else {
    // TODO: Remove support for this iindex.jsn v4.
    templateJsonPath = path.join(appPath, '.template.dependencies.json');
  }

  let templateJson = {};
  if (fs.existsSync(templateJsonPath)) {
    templateJson = require(templateJsonPath);
  }

  //配置package.json
  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};
  // Setup the script rules
  const templateScripts = templateJson.scripts || {};
  appPackage.scripts = Object.assign(
    {
      start: 'devops-react-server start',
      build: 'devops-react-server build',
      test: 'devops-react-server test',
    },
    templateScripts
  );
  appPackage.babel = {
    "plugins": [
      ["@babel/plugin-proposal-decorators", { "legacy": true }]
    ],
    "presets": [
      "react-app"
    ]
  }

  // Update scripts for Yarn users
  if (useYarn) {
    appPackage.scripts = Object.entries(appPackage.scripts).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.replace(/(npm run |npm )/, 'yarn '),
      }),
      {}
    );
  }

  // 配置eslint
  appPackage.eslintConfig = {
    extends: 'react-app',
  };

  // 配置支持浏览器版本
  appPackage.browserslist = {
    production: ['>0.2%', 'not dead', 'not op_mini all'],
    development: [
      'last 1 chrome version',
      'last 1 firefox version',
      'last 1 safari version',
    ],
  };
  appPackage.devDependencies = {
    "@babel/plugin-proposal-decorators": "^7.7.4",
    "babel-plugin-transform-decorators-legacy": "^1.3.5"
  };
  //将配置写入package.json文件中
  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

  // Copy the files for the user
  const templateDir = path.join(templatePath, 'template');
  if (fs.existsSync(templateDir)) {
    console.log('-------------copy template path ---------')
    //将模版文件夹下的所有文件复制到当前目录下
    fs.copySync(templateDir, appPath);
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templateDir)}`
    );
    return;
  }

  //重命名gitignore为.gitignore
  try {
    fs.moveSync(
      path.join(appPath, 'gitignore'),
      path.join(appPath, '.gitignore'),
      []
    );
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === 'EEXIST') {
      const data = fs.readFileSync(path.join(appPath, 'gitignore'));
      fs.appendFileSync(path.join(appPath, '.gitignore'), data);
      fs.unlinkSync(path.join(appPath, 'gitignore'));
    } else {
      throw err;
    }
  }

  let command;
  let remove;
  let args;

  if (useYarn) {
    command = 'yarnpkg';
    remove = 'remove';
    args = ['add'];
  } else {
    command = 'npm';
    remove = 'uninstall';
    args = ['install', '--save', verbose && '--verbose'].filter(e => e);
  }

  // Install additional template dependencies, if present
  const templateDependencies = templateJson.dependencies;
  if (templateDependencies) {
    args = args.concat(
      Object.keys(templateDependencies).map(key => {
        return `${key}@${templateDependencies[key]}`;
      })
    );
  }

  if (!isReactInstalled(appPackage)) {
    args = args.concat(['react', 'react-dom']);
  }
  //如果package.json中的react和react-dom丢失则重新安装
  // Install template dependencies, and react and react-dom if missing.
  if ((!isReactInstalled(appPackage) || templateName) && args.length > 1) {
    console.log();
    console.log(`正在使用命令安装模版依赖： ${command}...`);
    //执行安装模版子进程
    const proc = spawn.sync(command, args, { stdio: 'inherit' });
    if (proc.status !== 0) {
      console.error(`\`${command} ${args.join(' ')}\` failed`);
      return;
    }
  }

  if (args.find(arg => arg.includes('typescript'))) {
    console.log();
    verifyTypeScriptSetup();
  }

  // Remove template
  console.log(`安装依赖完成后删除模板 ${command}...`);

  const proc = spawn.sync(command, [remove, templateName], {
    stdio: 'inherit',
  });
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`);
    return;
  }

  if (tryGitInit(appPath)) {
    console.log('Initialized a git repository.');
  }

  // Display the most elegant way to cd.
  let cdpath;
  if (originalDirectory && path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  console.log();
  console.log(`项目创建成功： ${appName} at ${appPath}`);

  console.log('Happy hacking!');
};

//判断依赖中是否存在react和react-dom包
function isReactInstalled(appPackage) {
  const dependencies = appPackage.dependencies || {};
  return (
    typeof dependencies.react !== 'undefined' &&
    typeof dependencies['react-dom'] !== 'undefined'
  );
}
