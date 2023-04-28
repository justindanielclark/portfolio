import Canvas from "./components/Canvas/Canvas";
import { useRef } from "react";

function App() {
  const mainRef = useRef<HTMLElement | null>(null);
  return (
    <main ref={mainRef} className="flex flex-1 w-full">
      <Canvas />
    </main>
  );
}

export default App;
