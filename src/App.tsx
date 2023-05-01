import Canvas from "./components/Canvas/Canvas";
import { useRef } from "react";

function App() {
  const mainRef = useRef<HTMLElement | null>(null);
  return (
    <main ref={mainRef} className="flex flex-1 w-full flex-col relative">
      <div className="p-3 z-10">
        <p className="text-5xl font-bold font-serif">J. Clark</p>
        <p className="text-3xl font-bold font-serif">{`<Web Developer />`}</p>
      </div>

      <Canvas />
    </main>
  );
}

export default App;
