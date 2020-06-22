## 开始

```bash
npm i  --registry=https://registry.npm.taobao.org
npm run test
```

源码文件 `main.js`

## 逐步实现 PromiseA+ 规范

请看 [test](./test) 文件，结合 `commit` 记录查看每个步骤的代码实现过程。开发文件 [dev/promise.js](./dev/promise.js)

- 第一步：[new Promise(executor) 参数 executor 校验](./test/test1.js)
- 第二步：[实现 then 方法，以及支持链式调用](./test/test2.js)
- 第三步：[实现 then 方法异步执行](./test/test3.js)
- 第四步：[解决在 executor 函数中异步 reslove， then 方法没有被调用](./test/test4.js)
- 第五步：[解决 onFulfilled 方法返回字符串，值却没有被传递到下一个 then 的 onFulfilled 当中](./test/test5.js)
- 第六步：[处理 onFulfilled 返回值 x 为 Promise 的情况](./test/test6.js)
- 第七步：[处理 onFulfilled/onRejected 返回值 x 类型不同情况的处理](./test/test7.js)

---

- [Promises/A+](https://promisesaplus.com/)
- [Promises/A+ 规范（译文）](https://www.ituring.com.cn/article/66566)

## 着重点

处理好 `then(onFulfilled, onRejected)` 中 onFulfilled, onRejected 返回值 x 的处理，例如：

```js
new Promise((resolve, reject) => {
  resolve(1)
})
  .then(value => {
    return new Promise(resolve => resolve(2)) // 返回值 x 为 Promise
  })
  .then(value => {
    console.log('value: ', value) // value: 2
  })

// demo2
new Promise((resolve, reject) => {
  resolve(1)
})
  .then(value => {
    // 返回值 x 为 Promise 且 reslove 一个 Promise
    return new Promise(resolve =>
      resolve(
        new Promise(reslove => {
          reslove(2)
        })
      )
    )
  })
  .then(value => {
    console.log('value: ', value) // value: 2
  })
```

## Promise 解决过程

也即 x 的不同情况的处理

- x 与 promise 相等：`throw new TypeError('Chaining cycle detected for promise')`
- x 为 Promise
  - 如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
  - 如果 x 处于执行态，用相同的值执行 promise
  - 如果 x 处于拒绝态，用相同的据因拒绝 promise
- 如果 x 为对象或者函数
  - 把 x.then 赋值给 then
  - 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
  - 如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
    - 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
    - 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
    - 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
    - 如果调用 then 方法抛出了异常 e
      - 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
      - 否则以 e 为据因拒绝 promise
    - 如果 then 不是函数，以 x 为参数执行 promise
- 如果 x 不为对象或者函数，以 x 为参数执行 promise
