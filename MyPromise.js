function MyPromise(fn) {
  this.status = 'pending'
  this.value = null
  this.resolvedCbs = []
  this.rejectedCbs = []
  this._resolve = resolve.bind(this)
  this._reject = reject.bind(this)

  try {
    fn(this._resolve, this._reject)
  } catch(e) {
    this._reject(e)
  }

  function resolve(val) {
    setTimeout(() => {
      if (val instanceof Promise) {
        val.then(resolve, reject)
        return
      }
      if (this.status === 'pending') {
        this.value = val
        this.status = 'fullfilled'
        this.resolvedCbs.forEach(fn => fn(val))
      }
    })
    
  }
  function reject(val) {
    setTimeout(() => {
      if (val instanceof Promise) {
        val.then(resolve, reject)
        return
      }
      if (this.status === 'pending') {
        this.value = val
        this.status = 'rejected'
        this.rejectedCbs.forEach(fn => fn(val))
      }
    })
  }
}

MyPromise.prototype.then = function(onFullfillCb, onRejectCb) {
  return new MyPromise((resolve, reject) => {
    let res
    if (this.status === 'fullfilled') {
      res = onFullfillCb(this.value)
      if (res instanceof MyPromise) {
        res.then(resolve, reject)
        return
      }
      resolve(res)
    } else if (this.status === 'rejected') {
      res = onRejectCb(this.value)
      if (res instanceof MyPromise) {
        res.then(resolve, reject)
        return
      }
      reject(res)
    } else {
      this.resolvedCbs.push(() => {
        res = onFullfillCb(this.value)
        if (res instanceof MyPromise) {
          res.then(resolve, reject)
          return
        }
        resolve(res)
      })
      this.rejectedCbs.push(() => {
        res = onRejectCb(this.value)
        if (res instanceof MyPromise) {
          res.then(resolve, reject)
          return
        }
        reject(res)
      })
    }
  })
}
MyPromise.prototype.catch = function(onRejectCb) {
  return this.then(null, onRejectCb)
}

// 测试例子
let p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
p.then(res => {
  console.log('then', res)
  return 2
}).then(res => {
  console.log('then', res)
})
console.log('xxx')
