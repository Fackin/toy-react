// for (let i=0; i<3; i++) {
//   console.log(i)
// }

// window.a = <div id="b" class="c">
//   <div>fackin</div>
//   <div></div>
//   <div></div>
//   <div></div>
// </div>
import { createElement, Component, render } from './toy-react'

class MyComponent extends Component {
  render() {
    return <div>
      <h1>my component</h1>
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
