//  Promise 有三种状态，只能改变一次。 注意在 then 链式调用的有重要的作用
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  constructor(executor) {}
}

MyPromise.deferred = function () {
  let defer = {}
  defer.promise = new MyPromise((resolve, reject) => {
    defer.resolve = resolve
    defer.reject = reject
  })
  return defer
}

module.exports = MyPromise
