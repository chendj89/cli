import shell from "shelljs";
import fs from "fs-extra";
import ora from "ora";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(duration);
dayjs.extend(relativeTime);
/**
 * shelljs指令
 */
type shellCommand = keyof typeof shell;
/**
 * 单条指令
 */
type Command = [shellCommand, string[]];

interface Opts {
  /**
   * github仓库
   */
  repo: string;
  /**
   * 下载完成后的指令
   */
  commands: Command[];
  /**
   * 存放目录
   */
  dest: string;
}

function rm(dir: string) {
  fs.removeSync(dir);
}

async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}

async function task(fn: Function) {
  return new Promise(async (resolve) => {
    await fn();
    resolve(true);
  });
}

async function download({ repo, commands, dest }: Opts) {
  let st = new Date().getTime();
  let spinner = ora().start();
  spinner.text = `开始下载https://github.com/${repo}.git  `;
  rm(dest);
  await sleep(100);
  shell.exec(
    `git clone --depth=1 https://github.com/${repo}.git`,
    {
      async: true,
    },
    async (code) => {
      spinner.text = `执行脚本\n`;
      await sleep(100);
      for (let i = 0; i < commands.length; i++) {
        await task(async () => {
          let command = commands[i];
          let methodName: string = command[0];
          // @ts-ignore
          shell[methodName](...command[1]);
          // @ts-ignore
          spinner.text = `脚本${i}`;
          await sleep(500);
        });
      }
      if (!fs.existsSync(dest)) {
        fs.ensureDir(dest);
      }
      shell.cp("-R", "./tools/*", dest);
      let et = new Date().getTime();
      let dt = et - st;
      let total = dayjs.duration(dt).asSeconds() + "s";
      rm("tools");
      spinner.succeed(`下载成功(耗时：${total})`);
    }
  );
}

download({
  repo: "chendj89/tools",
  commands: [
    ["rm", ["-rf", "tools/.git"]],
    ["rm", ["-rf", "tools/package.json"]],
    ["rm", ["-rf", "tools/yarn.lock"]],
  ],
  dest: "./dist",
});
