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
  then(onFulfilled, onRejected) {
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
 * 判断then返回的promise走的逻辑
 */
function resolvePromise(promise, x, resolve, reject) {}

module.exports = MyPromise;
