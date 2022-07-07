import {createStore} from "redux";
import PropTypes from "prop-types";
// react-redux 里面导出两个方法
// 一个是高级组件Provider 和 connect 是一个方法 

import React from "react";

/* 
    Provider 就是做一件事情 把 组件里面的 props 属性变为 上下文 
*/
class Provider extends React.Component{
    // 把Provider组件里面的属性给当前组件的上下文 
    // 在以后的组件可以直接使用上下文 进行获取 不需要在进行属性的传递
    // 这就是为什么 Privider 组件下面只能有一个子组件 
    // distinct is null is <layout>

    // Provide 属性 => 上下文  => 组件以后
    constructor(props,context,updater){
        // this.props.store = store => { dispatch(){}, subscribe(){} , getState(){} }
        super(props,context);
    };

    static childContextProps = {
        store:PropTypes.object,
    }

    getChildContext(){
        return {
            store:this.props.store,
        }
    }

    render(){
        //返回的是虚拟dom对象
        return this.props.children
    }

}

// let mapStateToProps = (state) =>{
//     return {

//     };
// }

// let mapDispatchToProps = (dispatch) =>{
//     return {

//     };
// }

function connect(mapStateToProps,mapDispatchToProps){
    /* 
        参数: mapStateToProps = (store里面的 getState() 获取的 state)=>{  } => return { redux中的部分信息挂载到组件的属性上 }
              mapDisPatchToProps = (store里面的store.dispatch 方法 dispatch)=>{  }
              而store是在儿子组件里面的 
              把这两个函数的返回值 对象直合并为一个对象 添加到组件上面 
        使用方法是: <MyComponent {...obj}> </MyComponent>
        
    */
    return function connectHOT(AnonymousComponent){
        /* 
            参数：是一个组件
            返回值：是一个新组件 这个新组件里面的是放在 Provider 根组件上面的
            因为 根组件 里面有 上下文对象 所以导出的组件是可以使用上下文来获取
            数据的
        */
        return class Proxy extends React.Component{
            constructor(props,context,updater){
                super(props,context);
                this.state = {
                    ...this.stateProps(),
                }
            };
            static contextTypes = {
                store:PropTypes.object,
            }

            render(){
                /*              
                    let {getState,dispatch} = this.context.store;
                    // 1) 执行mapStateToProps(state) 函数 state 是要根据 store 里面去取的
                    let state = getState();
                    let stateObj = typeof mapStateToProps==="function"?mapStateToProps(state):{};
                    let DispatchFnObj = typeof mapDispatchToProps === "function" ? mapDispatchToProps(dispatch):{};

                    // 2) 让这两这个对象合并
                    let propsObj = {...stateObj,...DispatchFnObj};
                    // 3) 把对象使用的 ... 的方式添加到 组件的属性上 渲染为虚拟 dom对象的时候
                    // 直接渲染为 props  
                */
                // babel 在解析的时候会转为 createElement({ xx , {...propsobj} , children })
                let propsObj = this.mountProps();
                return <AnonymousComponent {...propsObj }></AnonymousComponent>
            };

            stateProps(){
                let { getState} = this.context.store;

                // 1) 执行mapStateToProps(state) 函数 state 是要根据 store 里面去取的
                let state = getState();
                let stateObj = typeof mapStateToProps === "function" ? mapStateToProps(state) : {};
                return stateObj;
            };

            dispatchProps(){
                let { dispatch } = this.context.store;
                let DispatchFnObj = typeof mapDispatchToProps === "function" ? mapDispatchToProps(dispatch) : {};

                // 2) 让这两这个对象合并
                // 3) 把对象使用的 ... 的方式添加到 组件的属性上 渲染为虚拟 dom对象的时候
                // 直接渲染为 props 
                return DispatchFnObj;
            };

            mountProps(){
                return {
                    ...this.stateProps(),
                    ...this.dispatchProps(),
                }
            }

            // 注册事件通知函数
            componentDidMount(){
                let {subscribe} = this.context.store;
                subscribe(()=>{
                    // 1) 重新获取 redux 容器里面的数据 和 重新获取 dispatch 
                    // 里面 的对象函数 也更新 dispatch 
                    // 但是一般只有在容器中的状态发生改变才会去通知组件重新渲染主要
                    // 是 容器里面的状态挂载到 组件里面状态就行
                    let state = this.context.store.getState();
                    // 2）修改组件的状态 让组件重新渲染 部分更新其实没有必要把
                    // dispatch 状态古挂载上去 dispatch 不是容器里面的状态
                    this.setState({
                        ...this.mountProps(),
                    });
                });
            };
        };
    };
}

/* 
    函数里面 返回函数  返回函数返回组件 组件里面使用组件 
    注册事件通知<返回的容器状态> 挂载到 当前组件的 this.state ={} 上
    以后 dispatch 了 就会通知代理组件 状态进行更新 代理组件状态更新
    render 重新渲染 返回组件里面的属性发生变化 返回组件也会重新渲染
*/

// 使用
// let store = createStore();




