function add(x, y, z){
    return x + y + z
}

/**
 * 将某一个函数转换成柯里化函数
 * cd: 需要转换的函数
 */
function currieFun(cb){
    const recursive =  function (...arg1){
        // 结束条件：当实参数量和形参数量相同时候，就直接返回值，结束掉这个函数
        if(cb.length <= arg1.length){
            return cb.apply(this, arg1)
        } else {
            // 如果数量不相同，则需要返回一个函数
            return function(...arg2){
                return recursive.apply(this, [...arg1, ...arg2])
            }
        }
    }
    return recursive
}

const test = currieFun(add)
console.log(test(1,2)(1))