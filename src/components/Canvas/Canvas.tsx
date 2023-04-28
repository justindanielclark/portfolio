import { useEffect, useRef } from "react";
import Orb from "./Orb";

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const requestAnimationFrameID = useRef<number | null>(null);
  useEffect(() => {
    if (canvasRef.current) {
      const drawableObjects = {
        Orbs: [] as Array<Orb>,
      };
      canvasRef.current.setAttribute("width", window.innerWidth.toString());
      canvasRef.current.setAttribute("height", window.innerHeight.toString());
      canvasContextRef.current = canvasRef.current.getContext("2d");

      const initializeDrawableObjects = () => {
        Orb.canvasHeight = window.innerHeight;
        Orb.canvasWidth = window.innerWidth;
        for (let i = 0; i < 250; i++) {
          drawableObjects.Orbs.push(
            new Orb(
              Math.random() * (Orb.capVelocity - Orb.baseVelocity) +
                Orb.baseVelocity,
              2
            )
          );
        }
      };

      const renderFrame = () => {
        const { width, height } = canvasRef.current as HTMLCanvasElement;
        const ctx = canvasContextRef.current;
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          const coloredOrb = Array(drawableObjects.Orbs.length).fill(
            false,
            0,
            drawableObjects.Orbs.length
          );
          for (let i = 0; i < drawableObjects.Orbs.length - 1; i++) {
            for (let j = i + 1; j < drawableObjects.Orbs.length; j++) {
              if (
                Orb.willOrbsCollideWithinDistance(
                  drawableObjects.Orbs[i],
                  drawableObjects.Orbs[j],
                  15
                )
              ) {
                coloredOrb[i] = true;
                coloredOrb[j] = true;
              }
            }
          }
          drawableObjects.Orbs.forEach((orb, idx) => {
            ctx.beginPath();
            ctx.fillStyle = coloredOrb[idx] ? "#FFFF00" : "#6b7280";
            ctx.arc(orb.xPos, orb.yPos, orb.radius, 0, Math.PI * 2);
            ctx.fill();
            orb.update();
          });
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
