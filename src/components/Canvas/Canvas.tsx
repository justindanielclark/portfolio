import { useEffect, useRef } from "react";
import Orb from "./Orb";
import SpatialHashGrid from "./SpatialHashGrid";

const endAngle = Math.PI * 2;

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationFrameID = useRef<number | null>(null);
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.setAttribute("width", window.innerWidth.toString());
      canvasRef.current.setAttribute("height", window.innerHeight.toString());
      const ctx = canvasRef.current.getContext("2d");
      const OrbMap = new SpatialHashGrid<Orb>(
        window.innerWidth,
        window.innerHeight,
        Orb.qualifyingNearDistance
      );

      const initializeDrawableObjects = () => {
        Orb.canvasHeight = window.innerHeight;
        Orb.canvasWidth = window.innerWidth;
        for (let i = 0; i < 100; i++) {
          OrbMap.add(new Orb(2));
        }
      };

      const drawOrb = (orb: Orb) => {
        if (ctx) {
          ctx.beginPath();
          ctx.fillStyle = "#FFFFFF";
          ctx.arc(orb.getX(), orb.getY(), orb.getRadius(), 0, endAngle);
          ctx.fill();
        }
      };
      const drawLineBetweenOrbs = (orb1: Orb, orb2: Orb) => {
        if (ctx) {
          ctx.beginPath();
          ctx.strokeStyle = "#FFFFFF";
          ctx.moveTo(orb1.getX(), orb1.getY());
          ctx.lineTo(orb2.getX(), orb2.getY());
          ctx.stroke();
        }
      };

      const renderFrame = () => {
        const { width, height } = canvasRef.current as HTMLCanvasElement;
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          OrbMap.updateAll();
          OrbMap.applyAll(drawOrb);
          const distSq = Math.pow(Orb.qualifyingNearDistance, 2);
          const connections = OrbMap.reduce((acc, cur) => {
            const neighbors = OrbMap.getPossibleNeighbors(
              cur,
              Orb.qualifyingNearDistance
            );
            neighbors.forEach((neighborOrb) => {
              if (OrbMap.isNearby(cur, neighborOrb, distSq)) {
                if (
                  acc.get(neighborOrb) === null ||
                  !acc.get(neighborOrb)?.has(cur)
                ) {
                  if (acc.get(cur)) {
                    acc.get(cur)?.add(neighborOrb);
                  } else {
                    const newSet: Set<Orb> = new Set([neighborOrb]);
                    acc.set(cur, newSet);
                  }
                }
              }
            });
            return acc;
          }, new Map<Orb, Set<Orb>>());
          Array.from(connections.keys()).forEach((key) => {
            connections
              .get(key)
              ?.forEach((orb) => drawLineBetweenOrbs(key, orb));
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
