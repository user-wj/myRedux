# myRedux 的实现

[createStore]

```js
    import {createStore} from "myRedux";
    使用:
        reducer(state={},action){

        }

        let store = createStore(reducer);
            store = {
                dispath(){},
                subscribe(){},
                getState(){},
            };

        createStore(reducer){
            function dispatch(action){
                // 1) 执行 出初始化 增加 修改  容器状态的操作 就是执行 reducer() 

                // 2) 循环 事件通知池 执行里面的方法
                // 解决问题: unsubscribe() 解绑通知带来的数组塌陷的问题 
                // 数组塌陷的这个问题主要是在这样的情况发生的：
                // 我在一个组件里面循环事件池通知组件更新
                // 但是 我在另一个组件里面 使用了 unsubscribe() 对事件池
                // 数组里面的元素进行了删除 这样会在喜欢数组的时候
                // 造成数组塌陷的问题 可能会照造成有一个组件不会通知更新
                return state;
            }

            function subscribe(fn){
                // subscrible 里面的操作主要是往通知事件池里面添加方法 
                // 返回一个 解绑的方法
                return function unsubscribe(){
                    let index = listenAry.indexOf(fn);
                    lisenAry[index] = null;
                    // 解决正在循环的时候 使用 unsubscribe 造成数组塌陷的问题
                }
            }

            function getState(){
                // 使用深拷贝 => 在外面不允许直接修改 状态数据
                // ... 是浅拷贝
                let deepCopyState = JSON.parse(JSON.stringify(state)); 
                return deepCopState;
            };

            return {
                dispatch,
                subscribe,
                getState,
            }
        }
```

[combineReducers]

```js

    import {combineReducers} from "myRedux";
    combineReducers({
        voteReducer:voteReducer,
        personReducer:personReducer,
    })

    voteReducer = ()=>{

    };

    perosnReduxer = ()=>{

    };

    combineReducers = (reducers)=>{
        /* 
            reducers: {
                voteReducer:voteReducer,
                personReducer:personReducer,
            }
        */
       // 闭包:作用域不销毁的机制
        return reducer(state={},action){
            // 循环的 reducer 
            let newState = {};
            for(var key in reducers){
                // 每次调用 dispatc 都会执行小的 reducer 并且把 当前模块对应的对象传递到里面 修改当前模块对应的对象 返回当前模块已经修改的对象 
                newStatw[key] = reducers[key](state[key],action);
            }
            return newState 
        }
    }
    
```

## react-redux

[react-redux]

```jsx
    react-redux的使用
    import {Provider,connect} from "react-redux";

    ReactDom.render( <mian>
        <Provider>
            <ConnectComponent></ConnectComponent>
        </Provider>
    </mian> ,  container)

    class MyComponent extends React.Component{
        ...
    }

    mapStateToProps = (state)=>{
        return{
            ...state,
        }
    }

    mapDispatchToProps = (dispatch)=>{
        return {
            init:function(initActionObj){
                dispatch(initActionObj)
            },
            vote:function(voteActionObj){
                dispatch(voteActionObj)
            },
            person:function(perosnActionObj){
                dispatch(personActionObj);
            }
        }
    }
    let HotComponent = connect(mapStateToProps,mapDispatchProps)(MyComponent);
    export default HotComponent; // 导出的是一个class Component extends React.Component{ ... } 类组件 
```

[react-redux原理]

```jsx
    
    import React from "react";
    import PropTypes from "prop-types";

    mapStateToProps = (state)=>{
        return {
            ...state,
        }
    };
    mapDispatchToProps = (dispatch)=>{
        // 作用域不销毁的原理
        return {
            init:function(initActionObj){
                dispatch(initActionObj)
            },
            vote:function(voteActionObj){
                dispatch(voteActionObj)
            },
            person:function(perosnActionObj){
                dispatch(personActionObj);
            }
        }
    };

    class MyComponent extends React.Component{
        ...
    }
    
    function connect(mapStateToProps,mapDispatchToProps){
        /* 
            参数是两个函数 
                    mapStateToProps(state){ return {  } } ;
                    mapDispatchToProps(dispatch){ return {  } };
                                        参数是state|dispatch 是 store 里面的方法 用到 store 是在 类组件里面的上下文中使用了 store 
                    
            返回值也是一个函数
        */

        return function connectHOT(AnonymousComponent){
            /*
            * 参数是类组件
            * 返回值是一个类组件
            */
            return class Proxy extends Reacr.Component{
                // 这个类组件是要注册到 Provider 里面的
                // 所以可以在这个组件下面拿到 context上下文的属性
                constructor(props,context,updater){
                    super(props,context);
                    // 为了组件的重新渲染 关联到 容器的注册事件 
                    this.static={
                        ...this.mountProps(),
                    },
                };
                // 要使用必须写这个静态属性
                static contextTypes = {
                    store:PropsTypes.object,
                }
                mountProps(){
                    let obj = {};
                    // store  state  和  dispatch 
                    let {getState,dispatch} = this.context.store;
                    let state = getSatte();
                    let stateObj = mapStateToProps(state);
                    let dispatchObj = mapDispatchToProps(dispatch);
                    return {
                        ...stateObj,
                        ...dispatchObj,
                    }
                };

                render(){
                    // 1) 将容器里面的状态 和 dispatch 对象 以属性的方法挂载到组件上
                    let propsObj = this.mountProps();
                    // 这个写法是 babel 编译出来为 createElement({ ...,{...propsObj} ,...children })
                    return <AnonymousComponent {...propsObj}></AnonymousComponent>
                };

                componentDidMount(){
                    this.context.store.subscribe(()=>{
                        this.setState({
                            // 状态和dispatch对象改变的时候会触发
                            // 组件重新渲染 因为会用不到 dispatch 函数的时候 需要解除 dispatch() 函数
                            ...this.mountProps(), 
                        })
                    })
                }
                
            }
        }
    }

    let HotComponent = connect(mapStateProps,mapDispatchProps)(MyComponent)
    export default HotComponent;

```
