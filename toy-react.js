/*
 * @author: fackin
 * @Date: 2020-10-22 00:17:42
 * @LastEditors: fackin
 * @LastEditTime: 2020-10-31 23:59:43
 * @Description: 
 * @FilePath: /toy-react/toy-react.js
 */
/**
 * 实现自定义组件Class的元素 
 * document.createElement()
 */
const RENDER_TO_DOM = Symbol("render to dom")

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
  get vdom() {
    return this.render().vdom
  }

  // get vchildren() {
  //   return this.children(child => child.vdom)
  // }
  [RENDER_TO_DOM](range) {
    this._range = range
    this._vdom = this.vdom
    // this.render()[RENDER_TO_DOM](range)
    this._vdom[RENDER_TO_DOM](range)
  }

  // vdom比对

  update() {
    let isSameNode = (oldNode, newNode) => {
      // 类型不同
      if (oldNode.type !== newNode.type)
        return false
      // 属性不同
      for (let name in newNode.props) {
        if (newNode.props[name] !== oldNode.props[name]) {
          return false
        }
      }
      // 属性数量不同
      if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length)
        return false
      // 文本内容不同
      if (newNode.type === "#text") {
        if (newNode.content !== oldNode.content)
          return false
      }
      return true
    }
    let update = (oldNode, newNode) => {
      // type, props, children
      // #text content

      if (!isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range)
        return
      }
      newNode._range = oldNode._range

      let newChildren = newNode.vchildren
      let oldChildren = oldNode.vchildren

      if (!newChildren || !newChildren.length)
        return

      let tailRange = oldChildren[oldChildren.length - 1]._range

      for (let i = 0; i < newChildren.length; i++) {
        let newChild = newChildren[i]
        let oldChild = oldChildren[i]
        if (i < oldChildren.length) {
          update(oldChild, newChild)
        } else {
          //TODO
          let range = document.createRange();
          range.setStart(tailRange.endContainer, tailRange.endOffset)
          range.setEnd(tailRange.endContainer, tailRange.endOffset)
          newChild[RENDER_TO_DOM](range)
          tailRange = range
        }
      }
    }

    let vdom = this.vdom
    update(this._vdom, vdom)
    this._vdom = vdom
  }

  /*
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
  */
  setState(newState) {
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState
      // this.rerender()
      this.update()
      return
    }
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (oldState[p] === null || typeof oldState[p] !== 'object') {
          oldState[p] = newState[p]

        } else {
          merge(oldState[p], newState[p])
        }
      }
    }
    merge(this.state, newState)
    // this.rerender()
    this.update()
  }
  // get root() {
  //   if (!this._root) {
  //     this._root = this.render().root
  //   }
  //   return this._root
  // }
}
class ElementWrapper extends Component {
  constructor(type) {
    super(type)
    this.type = type
    // this.root = document.createElement(type)
  }
  /*
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
    // range.deleteContents()
    component[RENDER_TO_DOM](range)
  }*/
  // 为了实现虚拟DOM
  get vdom() {
    this.vchildren = this.children.map(child => child.vdom)
    return this
    /*{
      type: this.type,
      props: this.props,
      children: this.children.map(child => child.vdom)
    }*/
  }

  [RENDER_TO_DOM](range) {
    this._range = range
    // range.deleteContents()

    let root = document.createElement(this.type)

    for (let name in this.props) {
      let value = this.props[name]
      // on事件
      if (name.match(/^on([\s\S]+)$/)) {
        root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value)
      } else {
        // classname 处理
        if (name === "className") {
          root.setAttribute("class", value)
        }
        root.setAttribute(name, value)
      }
    }

    if (!this.vchildren)
      this.vchildren = this.children.map(child => child.vdom)

    for (const child of this.vchildren) {

      let childRange = document.createRange()
      childRange.setStart(root, root.childNodes.length)
      childRange.setEnd(root, root.childNodes.length)
      child[RENDER_TO_DOM](childRange)
    }

    // range.insertNode(root)

    replaceContent(range, root)
  }
}
/**
 * 实现自定义组件Class的文本 
 * document.createTextNode()
 */
class TextWrapper extends Component {
  constructor(content) {
    super(content)
    this.type = "#text"
    this.content = content
    // this.root = document.createTextNode(content)
  }
  get vdom() {
    return this
    // {
    //   type: "#text",
    //   content: this.content
    // }
  }
  [RENDER_TO_DOM](range) {
    this._range = range
    // range.deleteContents()
    // range.insertNode(this.root)
    let root = document.createTextNode(this.content)

    replaceContent(range, root)
  }
}

function replaceContent(range, node) {
  range.insertNode(node)
  range.setStartAfter(node)
  range.deleteContents()

  range.setStartBefore(node)
  range.setEndAfter(node)
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