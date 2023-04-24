class Promise {
    static pending = 'PENDING'
    static fulfilled = 'FULFILLED'
    static rejected = 'REJECTED'

    constructor(executor) {
        if (typeof executor !== 'function') {
            return new Error('executor is not a function')
        }
        this.resultValue = null
        this.resultStatus = Promise.pending
        this.onFulfilledCallback = []
        this.onRejectCallback = []
        try {
            executor(this.resolve.bind(this), this.reject.bind(this))
        } catch (e) {
            this.reject(e)
        }
    }

    resolve(value) {
        if (this.resultStatus === Promise.pending) {
            this.resultValue = value
            this.resultStatus = Promise.fulfilled
            this.onFulfilledCallback.forEach(cb => cb(), this)
        }
    }

    reject(reason) {
        if (this.resultStatus === Promise.pending) {
            this.resultValue = reason
            this.resultStatus = Promise.rejected
            this.onRejectCallback.forEach(cb => cb(), this)
        }
    }

    then(onFulfilled, onReject) {

        const promise2 = new Promise((resolve, reject) => {
            onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
            onReject = typeof onReject === 'function' ? onReject : e => throw e

            if (this.resultStatus === Promise.rejected) {
                setTimeout(() => {
                    try {
                        const x = onReject(this.resultValue)
                        handlePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            }
            if (this.resultStatus === Promise.fulfilled) {
                setTimeout(() => {
                    try {
                        const x = onFulfilled(this.resultValue)
                        handlePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }

                })
            }
            if (this.resultStatus === Promise.pending) {
                this.onFulfilledCallback.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onFulfilled(this.resultValue)
                            handlePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    })
                })

                this.onRejectCallback.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onReject(this.resultValue)
                            handlePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }

                    })
                })
            }
        })

        return promise2
    }
}

function handlePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return new Error('同一个promise')
    }
}