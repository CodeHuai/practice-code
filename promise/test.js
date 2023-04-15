const Promise = require("./index");

const a = new Promise((resolve, reject) => {
  // resolve(100)
  throw new Error('马婷婷真漂亮')
  // resolve('马婷婷真漂亮')
  // reject('马婷婷真漂亮')
});


a.then(
  (res) => {
    console.log(res, "success");
  },
  (error) => {
    console.log(error, "fail");
  }
);
