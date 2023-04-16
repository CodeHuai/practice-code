const Promise = require("./index");

const a = new Promise((resolve, reject) => {
  resolve(100);
  // throw new Error("aaa真漂亮");
  // resolve('aaa真漂亮')
  // reject('aaa真漂亮')
});

a.then(
  (res) => {
    console.log(a);
    // 这里如果返回同一个promise,会等待它的状态改变，所以这里需要判断是否为同一个promise
    return a;
    // console.log(res, "success");
  },
  (error) => {
    console.log(error, "fail");
  }
).then((res) => {
  console.log(res, "测试");
});
