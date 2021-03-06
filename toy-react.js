/*
 * @author: fackin
 * @Date: 2020-10-22 00:17:42
 * @LastEditors: fackin
 * @LastEditTime: 2020-10-31 22:18:52
 * @Description: 
 * @FilePath: /toy-react/toy-react.js
 */
/**
 * 实现自定义组件Class的元素 
 * document.createElement()
 */
const RENDER_TO_DOM = Symbol("render to dom")
class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    // on事件
    if (name.match(/^on([\s\S]+)$/)) {
      this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value)
    } else {
      // classname 处理
      if (name === "className") {
        this.root.setAttribute("class", value)
      }
      this.root.setAttribute(name, value)
    }
  }
  appendChild(component) {
    // this.root.appendChild(component.root)

    let range = document.createRange()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    range.deleteContents()
    component[RENDER_TO_DOM](range)
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}
/**
 * 实现自定义组件Class的文本 
 * document.createTextNode()
 */
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}
/**
 * 组件基础类
 */
export class Component {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
  }
  setAttribute(name, value) {
    this.props[name] = value
  }
  appendChild(component) {
    this.children.push(component)
  }
  [RENDER_TO_DOM](range) {
    this._range = range
    this.render()[RENDER_TO_DOM](range)
  }
  rerender() {
    let oldRange = this._range
    // 插入的range
    let range = document.createRange()
    range.setStart(oldRange.startContainer, oldRange.startOffset)
    range.setEnd(oldRange.startContainer, oldRange.startOffset)
    this[RENDER_TO_DOM](range)

    oldRange.setStart(range.endContainer, range.endOffset)
    oldRange.deleteContents()
  }
  setState(newState) {
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState
      this.rerender()
      return
    }
    let merge = (oldState, newState) => {
      for (const p in newState) {
        if (oldState[p] === null || typeof oldState[p] !== 'object') {
          oldState[p] = newState[p]

        } else {
          merge(oldState[p], newState[p])
        }
      }
    }
    merge(this.state, newState)
    this.rerender()
  }
  // get root() {
  //   if (!this._root) {
  //     this._root = this.render().root
  //   }
  //   return this._root
  // }
}
/**
 * createElement
 * @param {string|Class} type 
 * @param {object} attributes 
 * @param  {...any} children 
 */
export function createElement(type, attributes, ...children) {
  let e
  if (typeof type === "string") {
    e = new ElementWrapper(type)
  } else {
    e = new type
  }
  for (let att in attributes) {
    e.setAttribute(att, attributes[att])
  }
  let insertChildren = (children) => {
    for (let child of children) {
      if (typeof child === 'string') {
        child = new TextWrapper(child)
      }
      // child 为null的
      if (child === null) {
        continue
      }
      if ((typeof child === 'object') && (child instanceof Array)) {
        insertChildren(child)
      } else {
        e.appendChild(child)
      }
    }
  }
  insertChildren(children)
  return e
}
/**
 * render
 * appendChild()
 * @param {class} component 
 * @param {DOMNode} parentElement 
 */
export function render(component, parentElement) {
  // parentElement.appendChild(component.root)
  let range = document.createRange()
  range.setStart(parentElement, 0)
  range.setEnd(parentElement, parentElement.childNodes.length)
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}