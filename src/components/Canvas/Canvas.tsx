import { useEffect, useRef } from "react";
import Orb from "./Orb";
import SpatialHashGrid from "./SpatialHashGrid";

type Color = {
  r: number;
  g: number;
  b: number;
};
const ARC_END_ANGLE = Math.PI * 2;
const DARK_COLOR: Color = {
  r: 30,
  g: 41,
  b: 59,
};
const LIGHT_COLOR: Color = {
  r: 60,
  g: 82,
  b: 118,
};
const COLOR_DIFF: Color = {
  r: LIGHT_COLOR.r - DARK_COLOR.r,
  g: LIGHT_COLOR.g - DARK_COLOR.g,
  b: LIGHT_COLOR.b - DARK_COLOR.b,
};

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
        for (let i = 0; i < 175; i++) {
          OrbMap.add(new Orb(2));
        }
      };

      const drawOrb = (orb: Orb) => {
        if (ctx) {
          ctx.beginPath();
          ctx.fillStyle = `rgb(${LIGHT_COLOR.r},${LIGHT_COLOR.g},${LIGHT_COLOR.b})`;
          ctx.arc(orb.getX(), orb.getY(), orb.getRadius(), 0, ARC_END_ANGLE);
          ctx.fill();
        }
      };
      const drawLineBetweenOrbs = (
        orb1: Orb,
        orb2: Orb,
        percentage: number
      ) => {
        if (ctx) {
          ctx.beginPath();
          ctx.strokeStyle = `rgb(${DARK_COLOR.r + COLOR_DIFF.r * percentage},${
            DARK_COLOR.g + COLOR_DIFF.r * percentage
          },${DARK_COLOR.b + COLOR_DIFF.r * percentage})`;
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
          const qualifyingDistSq = Math.pow(Orb.qualifyingNearDistance, 2);
          const connections = OrbMap.reduce((acc, cur) => {
            const neighbors = OrbMap.getPossibleNeighbors(
              cur,
              Orb.qualifyingNearDistance
            );
            neighbors.forEach((neighborOrb) => {
              const distBetweenSq = OrbMap.distBetweenSquared(cur, neighborOrb);
              const difference = qualifyingDistSq - distBetweenSq;
              if (difference > 0) {
                if (
                  acc.get(neighborOrb) === null ||
                  !acc.get(neighborOrb)?.has(cur)
                ) {
                  if (acc.get(cur)) {
                    acc.get(cur)?.set(neighborOrb, difference);
                  } else {
                    const newMap: Map<Orb, number> = new Map();
                    newMap.set(neighborOrb, difference);
                    acc.set(cur, newMap);
                  }
                }
              }
            });
            return acc;
          }, new Map<Orb, Map<Orb, number>>());

          connections.forEach((connection, orb) => {
            connection.forEach((distSq, neighbor) => {
              drawLineBetweenOrbs(orb, neighbor, distSq / qualifyingDistSq);
            });
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
