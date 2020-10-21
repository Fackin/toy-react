/*
 * @author: fackin
 * @Date: 2020-10-22 00:17:42
 * @LastEditors: fackin
 * @LastEditTime: 2020-10-22 01:00:41
 * @Description: 
 * @FilePath: /toy-react/toy-react.js
 */
/**
 * 实现自定义组件Class的元素 
 * document.createElement()
 */
class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
  appendChild(component) {
    this.root.appendChild(component.root)
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
}
/**
 * 组件基础类
 */
export class Component {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this._root = null
  }
  setAttribute(name, value) {
    this.props[name] = value
  }
  appendChild(component) {
    this.children.push(component)
  }
  get root() {
    if (!this._root) {
      this._root = this.render().root
    }
    return this._root
  }
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
  parentElement.appendChild(component.root)
}