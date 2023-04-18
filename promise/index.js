class Promise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(executor) {
    if (typeof executor !== "function") {
      return new Error("executor is not a function!");
    }
    this.resultState = Promise.PENDING;
    this.resultResult = null;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  resolve = (value) => {
    if(value instanceof Promise){
      return value.then(this.resolve.bind(this), this.reject.bind(this))
    }
    if (this.resultState === Promise.PENDING) {
      this.resultState = Promise.FULFILLED;
      this.resultResult = value;
      this.onResolvedCallbacks.forEach((cb) => cb());
    }
  };

  reject = (reason) => {
    if (this.resultState === Promise.PENDING) {
      this.resultState = Promise.REJECTED;
      this.resultResult = reason;
      // 失败调用成功的回调
      this.onRejectedCallbacks.forEach((cb) => cb());
    }
  };

  /**
   *
   * @param {function} onFulfilled
   * @param {function} onRejected
   * @returns Promise
   */
  // 当调用then的时候，我们这里已经能够区分出他的状态和值了
  then(onFulfilled, onRejected) {
    // 判断这里的参数非必填项问题
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (e) => {
            throw e;
          };
    // 这里new了一个新的promise,就会直接执行
    const promise2 = new Promise((resolve, reject) => {
      if (this.resultState === Promise.FULFILLED) {
        // 这里之所以要加一个定时器是因为promise2可能还没有生成，所以要加上异步逻辑
        setTimeout(() => {
          // 这里处理了then的链式调用主要逻辑。上一个then的返回值，是下一个then的某一个回调函数对应的参数
          try {
            const x = onFulfilled(this.resultResult);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            // 这里之所以不需要考虑this指向，是因为在上面已经处理了this的指向问题
            reject(error);
          }
        });
      }

      if (this.resultState === Promise.REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.resultResult);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.resultState === Promise.PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.resultResult);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.resultResult);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });
    return promise2;
  }

  static all(values){
  return new Promise((resolve, reject) => {
    let arr = []
    let count = 0

    const processData = (data, index) => {
      arr[index] = data
      count += 1
      if(count === values.length){
        resolve(arr)
      }
    }
    for (let index = 0; index < values.length; index++) {
      const cur = values[index]
      Promise.resolve(cur).then(data => {
        processData(data, index)
      }, reject)
    }
  })
  }

  /**
   * 捕捉错误
   * @param errCallback 错误回调方法
   * @returns {Promise}
   */
  catch(errCallback){
    return this.then(null, errCallback)
  }

  /**
   * promise.resolve 方法
   * @param value 成功值
   * @returns {Promise} 返回一个成功的promise
   */
  static resolve(value){
    return new Promise((resolve, reject) => {
      resolve(value)
    })
  }

  /**
   * promise.reject 方法
   * @param reason 错误值
   * @returns {Promise} 返回一个失败的promise
   */
  static reject(reason){
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }
}

/**
 * 判断then返回的promise2走的逻辑,也就是x决定promise2的成功还是失败
 */
function resolvePromise(promise2, x, resolve, reject) {
  // 这里如果返回同一个promise,会等待它的状态改变，所以这里需要判断是否为同一个promise
  // 如果 Promise 和 x 指向同一对象，以 TypeError 为拒因拒绝执行 Promise
  if (promise2 === x) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }

  // 判断x是否是一个promise
  // promise是一个含有then方法的对象或者函数
  if (typeof x === "function" || (typeof x === "object" && x !== null)) {
    let hasCalled = false;
    try {
      const then = x.then;
      if (typeof then === "function") {
        // 说明是一个promise
        then.call(
          x,
          (y) => {
            if (hasCalled) {
              return;
            }
            hasCalled = true;
            // 为了防止promise解析后的结果依旧是promise，所以需要递归的处理，主要是一些用户可能在resolve中又是一个promise
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (hasCalled) {
              return;
            }
            hasCalled = true;
            reject(r);
          }
        );
      } else {
        // 是一个对象不是null,但是没有then方法；或者是一个函数，但是没有then方法
        resolve(x);
      }
    } catch (error) {
      if (hasCalled) {
        return;
      }
      hasCalled = true;
      reject(error);
    }
  } else {
    // 如果不是一个promise,规范里面直接resolve
    resolve(x);
  }
}

module.exports = Promise;

// 测试用例
// promises-aplus-tests -g
// promises-aplus-tests 文件明
Promise.deferred = function () {
  // deferred  all race catch ...
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};
