// import {} from "redux";
/* 
    redux 导出了一个对象里面有
    {
        createStore()
        combineReducers()
    }
*/

/*
    reducer: 是一个合并好的最终的reducer
    返回值是一个 对象对象里面有方法
    闭包:作用域不销毁机制
*/
function createStore(reducer){
    /* 
        容器里面有 状态 和 事件池 
        只在 dispatch 的时候才会修改信息和设置消息
        state 初始值的设置也是给 用户自己来决定的 但是一定要在
        reducer(state={},action) 对state 参数进行初始化 
    */
    let state;
    let listenAry = [];

    /*  
        dispatch() 是往容器里面 1.增加数据 2.修改容器里面的数据
        在dispatch()派发任务的时候才会修改状态信息 state 才会有方法
        任务派发
    */
    function dispatch(action){
        /* 
            功能:修改[增加容器中的状态信息]
            store.dispatch({
                type:"",
                name:"xx",
                ...
            })

            在这里才是执行的修改状态的逻辑<而修改状态的逻辑在reducer函数参数里面>
            所以在这里 需要执行 reducer 函数和 通知容器事件池里面的方法执行
            执行reducer修改[增加]容器中状态信息

            dispatch中的功能就是两个:1.怎么样去修改容器中状态 2.修改状态之后通知更新

            其中 怎么样修改容器中的状态是用户自己定义的所以抽离了出去
            而 更新的操作是固定的所以的话
            
            state 初始化也是由用户自己决定的
            初始化的时候是在函数的默认值里面决定的

        */
        // 1）初始化状态增加修改状态 用户自定义
        state = reducer(state,action); // 返回的是一个新的状态

        // 2）通知事件池中的方法执行 在原生 redux 里面存在数数组塌陷的问题
        for(let i=0;i < listenAry.length ; i++){
            let noteFn = listenAry[i];
            if (typeof noteFn === "function"){
                noteFn();
            }else{
                // 函数为 null 解除通知 的函数需要从 数组里面删除
                listenAry.splice(i,1);
                // 删除数组的元素 循环需要从当期项重新开始
                i--;
            };
        };
        
    }
    dispatch({type:"$$_INIT_STATE"})

    function subscribe(fn){
        /* 
            参数：fn 是一个函数
            功能逻辑：在执行的subscribe() 方法的时候 容器的事件池里面增加方法
            返回值：是一个 新的函数 => 新函数： 参数： 无
                                             功能逻辑：主要是删除对应的方法 可能会出现数组塌陷的问题
                                             返回值: 无
            这个作用域样又是不销毁的
        */
        // 1) 向容器里面增加方法 
        if (typeof fn === "function") {
            // 1.1)判断容器里面是否存在该方法一个通知号码就可以了
            let isExist = listenAry.includes(fn);
            if(!isExist){
                listenAry.push(fn);
            }
        };
        // 2）返回一个函数 解除通知 
        // 逻辑就是从 listenAry 移出就可以了 移出了的话 就不再通知
        return function unsubscribe(){
            let index = listenAry.indexOf(fn);
            listenAry[index] = null;
            // 有问题 => 数组塌陷的问题 删除数组都会照成数组塌陷的问题
            // 比如我在这个组件正在做 dispatch() 循环派发通知的时候
            // 另一个组件 里面执行了 解除通知 删除了 数组里面的一项数据
            // 这个正在循环的数组会塌陷 但是 i 值不变为造成 有一个值遍历不到
            // 的情况 就是有一个组件可能会接收不到通知  
            // 在循环的时候除去 就不会出现这个问题 
        }
    }

    function getStore() {
        /*
            获取容器最新的状态 因为是一个闭包函数里面拿到 state 就是一直被修改过
            的状态
            let obj = {n:0,m:{x:4}}
            ...obj 是浅克隆

            深度克隆:
            var deepCopyObj = JSON.parse((JSON.stringify(obj)))
        */
        let deepCopyState = JSON.parse(JSON.stringify(state)); // newState 不是原来的 state 对象
        return deepCopyState; 
                      // 有问题 在外面拿到的也是一个 内存地址<堆内存>
                      // 如果在外面拿到数据直接去东修改这个对象
                      // 是可以之际在外面直接就修改 这个容器里面的
                      // state 对象里面的属性
                      // 所以需要克隆一份在给外面
                      // 这也是 redux 里面的缺点
    };

    return{ 
        dispatch: dispatch,
        subscribe:subscribe,
        getStore:getStore,
    }; 

}

// 
let reducer = (state={},action)=>{
    /* 
        初始化默认值 容器需要一个初始值是在 createStore()的时候
        逻辑决定的 在createStore 的时候 state 是一个 undefined 的状态
        和根据行为标识对象的type值进行不同的操作
        state 原有的容器中的状态信息
        action dispatch(action) 行为对象标识 
    */
    switch(action.type){
        // ....
        case "xx":
            // 进来的时候需要先把原来的先浅克隆一份
            state = {...state,n:"yy"};
            break;
        default:
            break;
    }
    return state;
}

let store = createStore(reducer);
/* 

    传递了 reducer 但是在createStore() 执行这个函数的时候
    并未执行 reducer 是一个管理者 只有在dispatch的时候
    才会执行 reducer 是一个修改 容器状态的逻辑

    redux:不足
            getState() 不是深拷贝 可以在外面修改容器里面的状态
            在 unsubscribe() 可能会引发数组塌陷的问题

*/


function combineReducers(reducers){
    // 容器的数据开始的时候就是一个对数据开始的
    /* 
        这个方法是合并reducer(){} 的
        参数：reducers  {  voteReducer : reducer(state={n:0,m:0},action){}  }
        功能：合并reducer 并且把 state 状态按照 reducer模块进行设置
        返回值：是一个新的 reducer 函数(把这个值当做参数给createStore)
    */
    // dispatch 执行的是这个函数
    // 这里要返回一个最终的状态替换原来的 state
    return function reducer(state={},action){
        /* 
            state: 要么是 {  }
                   要么是 { vote:{} , person:{} }
        */
        // state={} 保证初始化的时候是一个 对象
        // reducer 都是去 初始话 增加 修改 容器里面的状态信息
        // 1) 初始化状态 按照 功能模块来划分 第一次 createStore() 
        // 就在 模块里面初始化了 模块化的 state 状态
        let newState = {}; // 每次dispatch 的时候都会重新创建 newState
        for(let key in reducers){
            if(reducers.hasOwnProperty(key)){
                let smallReducer = reducers[key];
                // reducer 是去执行修改容器状态的操作并且 返回的是
                // 最新 容器状态信息
                // 在这里执行对应的 模块修改 state 而且返回的是一个新的state对象
                // 初始化的时候是 undefined  使用的是 smallReducer()的默认参数
                newState[key] = smallReducer(state[key],action);
            }
        }
        // 2) 执行各自的 模块行为标识 简而言之就是 执行对应模块的增加修改容器状态的操作
        return newState;
    };
}

/*

    combineReducer 不是合并小的reducer而是 每一次执行 dispatch 都会
    把小的reducer函数都遍历一遍执行 reducer() 函数又是返回最新的 state状态
    返回的是一个 reducer 但是在内部必须要有 创建一个新对象 来汇总每一个模块下的
    小的state   每次执行 dispatch 的时候都会把 小的reducer 遍历一遍在执行
    修改小模块 数据的操作 把小模块的 state进行汇总 到一个新对象里面
    返回的是这个新对象

*/
