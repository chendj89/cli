#!/usr/bin/env node

const { inspect } = require("util");
const mime = require("mime");
const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const url = require("url");
let argv = inspect(process.argv);
var http = require("http");

let options = {
  "-p": 8080,
  "-b": "",
};

program
  .option("-v,--version [version]", "版本", require("../package.json").version)
  .option("-d,--dir [dir]", "存放目录,", "")
  .option("-p,--port [port]", "端口号", 8080)
  .option("-b,--base [base]", "默认地址,可以选填主要解决github pages", "")
  .parse(process.argv);
console.log(program._optionValues);
let getFileMime = function (extname) {
  return mime.getType(extname);
};

let s1 = function (req, res) {
  let staticPath = process.cwd();
  // 判断是否为绝对路径
  if (path.isAbsolute(program._optionValues.dir)) {
    staticPath = program._optionValues.dir;
  }else {
    staticPath=path.join(process.cwd(), program._optionValues.dir)
  }
  // 获取地址
  let pathname = url.parse(req.url).pathname;
  pathname = pathname == "/" ? "/index.html" : pathname;
  if(program._optionValues.base){
    let reg=new RegExp(program._optionValues.base);
    pathname = pathname.replace(reg, "");
  }
  // 可以获取后缀名path.extname()
  let extname = path.extname(pathname);
  // 通过fs模块读取文件
  if (pathname != "/favicon.ico") {
    //过滤掉/favicon.ico路径
    try {
      let data = fs.readFileSync(`${staticPath}` + pathname);

      if (data) {
        let mime = getFileMime(extname);
        res.writeHead(200, { "Content-Type": `${mime};charset="utf-8"` });
        res.end(data);
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.end();
  }
};

//2.创建服务器，传入回调函数，作用是处理网页请求
var server = http.createServer(s1);
console.log(`open http://localhost:${program._optionValues.port}`);
//3.设置监听的端口
server.listen(program._optionValues.port);
