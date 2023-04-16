class MyPromise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(excutor) {
    if (typeof excutor !== "function") {
      return new Error("excutor is not a function!");
    }
    this.resultState = MyPromise.PENDING;
    this.resultResult = null;
    this.fullfilledCallBackList = [];
    this.rejectedCallBackList = [];

    try {
      excutor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(value) {
    if (this.resultState === MyPromise.PENDING) {
      this.resultState = MyPromise.FULFILLED;
      this.resultResult = value;
      this.fullfilledCallBackList.forEach((cb) => cb());
    }
  }

  reject(reason) {
    if (this.resultState === MyPromise.PENDING) {
      this.resultState = MyPromise.REJECTED;
      this.resultResult = reason;
      this.rejectedCallBackList.forEach((cb) => cb());
    }
  }

  /**
   *
   * @param {成功回调} onFulfilled
   * @param {异常回调} onRejected
   * @returns 返回一个promise
   */
  // 当调用then的时候，我们这里已经能够区分出他的状态和值了
  then(onFulfilled, onRejected) {
    // 这里new了一个新的promise,就会直接执行
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.resultState === MyPromise.FULFILLED) {
        // 这里之所以要加一个定时器是因为promise2可能还没有生成，所以要加上异步逻辑
        setTimeout(() => {
          // 这里处理了then的链式调用主要逻辑。上一个then的返回值，是下一个then的某一个回调函数对应的参数
          try {
            const x = onFulfilled(this.resultResult);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            // 这里之所以不需要考虑this指向，是因为在上面已经处理了this的指向问题
            reject(reson);
          }
        });
      }

      if (this.resultState === MyPromise.REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.resultResult);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(reason);
          }
        });
      }

      if (this.resultState === MyPromise.PENDING) {
        this.fullfilledCallBackList.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.resultResult);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.rejectedCallBackList.push(() => {
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
}

/**
 * 判断then返回的promise2走的逻辑,也就是x决定promise2的成功还是失败
 */
function resolvePromise(promise2, x, resolve, reject) {
  // 这里如果返回同一个promise,会等待它的状态改变，所以这里需要判断是否为同一个promise
  // 如果 Promise 和 x 指向同一对象，以 TypeError 为拒因拒绝执行 Promise
  if (promise2 === x) {
    return reject(
      new TypeError(
        "如果 Promise 和 x 指向同一对象，以 TypeError 为拒因拒绝执行 Promise"
      )
    );
  }

  // 判断x是否是一个promise
  // promise是一个含有then方法的对象或者函数
  if (typeof x === "function" || (typeof x === "object" && x !== null)) {
    try {
      const then = x.then;
      let hasCalled = false;
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

module.exports = MyPromise;
