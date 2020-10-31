import { createElement, Component, render } from './toy-react'

class MyComponent extends Component {
  constructor() {
    super()
    this.state = {
      a: 1,
      b: 2
    }
  }
  render() {
    return <div>
      <h1>my component</h1>
      {/* <button onclick={() => { this.state.a++; this.rerender() }}>add</button> */}
      <button onclick={() => { this.setState({ a: this.state.a++ }) }}>add</button>
      <span>{this.state.a.toString()}</span>
      <span>{this.state.b.toString()}</span>
      {this.children}
    </div>
  }
}

let b = <MyComponent id="b" class="c">
  <div>fackin</div>
  <div></div>
  <div></div>
  <div></div>
</MyComponent>

// document.body.appendChild(b)
render(b, document.body)
