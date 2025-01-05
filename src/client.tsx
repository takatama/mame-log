import { render } from "hono/jsx/dom";

function App() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}

const root = document.getElementById('root');
if (root) render(<App />, root);