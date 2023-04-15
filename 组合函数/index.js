function first (num){
    return num + 1
}

function second (num){
    return num + 2
}

function combination(m, n){
    return function (num) {
        return n(m(num))
    }
}

const test = combination(first, second)
console.log(test(1))