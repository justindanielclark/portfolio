import { useEffect, useRef } from "react";
import Orb from "./Orb";
import SpatialHashMap from "./SpatialHash";

const endAngle = Math.PI * 2;

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationFrameID = useRef<number | null>(null);
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.setAttribute("width", window.innerWidth.toString());
      canvasRef.current.setAttribute("height", window.innerHeight.toString());
      const ctx = canvasRef.current.getContext("2d");
      const OrbMap = new SpatialHashMap<Orb>(
        window.innerWidth,
        window.innerHeight,
        Orb.qualifyingNearDistance
      );

      const initializeDrawableObjects = () => {
        Orb.canvasHeight = window.innerHeight;
        Orb.canvasWidth = window.innerWidth;
        for (let i = 0; i < 75; i++) {
          OrbMap.add(new Orb(2));
        }
        OrbMap.reduce<Array<{ orb1: Orb; orb2: Orb }>>((acc, cur) => {
          return acc;
        }, []);
      };

      const drawOrb = (orb: Orb) => {
        if (ctx) {
          ctx.beginPath();
          ctx.fillStyle = "#FFFFFF";
          ctx.arc(orb.getX(), orb.getY(), orb.getRadius(), 0, endAngle);
          ctx.fill();
        }
      };

      const renderFrame = () => {
        const { width, height } = canvasRef.current as HTMLCanvasElement;
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          OrbMap.updateAll();
          OrbMap.applyAll(drawOrb);
        }
      };

      const tick = () => {
        renderFrame();
        requestAnimationFrameID.current = requestAnimationFrame(tick);
      };

      initializeDrawableObjects();
      requestAnimationFrameID.current = requestAnimationFrame(tick);
    }

    //Cleanup
    return () => {
      if (requestAnimationFrameID.current) {
        cancelAnimationFrame(requestAnimationFrameID.current);
      }
    };
  }, []);
  return <canvas ref={canvasRef} />;
}

export default Canvas;
