import { useEffect, useRef } from "react";
import Orb from "./Orb";
import SpatialHashGrid from "./SpatialHashGrid";
import useDebounce from "../../utils/useDebouncer";

type Color = {
  r: number;
  g: number;
  b: number;
};
const ARC_END_ANGLE = Math.PI * 2;
//Currently matches background of container
const DARK_COLOR: Color = {
  r: 30,
  g: 41,
  b: 59,
};
const LIGHT_COLOR: Color = {
  r: 0,
  g: 100,
  b: 100,
};
const COLOR_DIFF: Color = {
  r: LIGHT_COLOR.r - DARK_COLOR.r,
  g: LIGHT_COLOR.g - DARK_COLOR.g,
  b: LIGHT_COLOR.b - DARK_COLOR.b,
};
//Num Px Area Required Per Orb
const ORB_COEFF = 30000;

function Canvas() {
  const [timerID, setDebounce] = useDebounce();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationFrameID = useRef<number | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.setAttribute("width", window.innerWidth.toString());
      canvas.setAttribute("height", window.innerHeight.toString());
      const OrbMap = new SpatialHashGrid<Orb>(
        window.innerWidth,
        window.innerHeight,
        Orb.qualifyingNearDistance
      );
      if (ctx) {
        const onWindowResize = (
          canvas: HTMLCanvasElement,
          ctx: CanvasRenderingContext2D,
          orbMap: SpatialHashGrid<Orb>
        ) => {
          setDebounce(() => {
            ctx.clearRect(0, 0, Orb.canvasWidth, Orb.canvasHeight);
            canvas.setAttribute("width", window.innerWidth.toString());
            canvas.setAttribute("height", window.innerHeight.toString());
            Orb.canvasWidth = window.innerWidth;
            Orb.canvasHeight = window.innerHeight;
            orbMap.reset(
              window.innerWidth,
              window.innerHeight,
              Orb.qualifyingNearDistance
            );
            Orb.canvasHeight = window.innerHeight;
            Orb.canvasWidth = window.innerWidth;
            const numOrbs = Math.floor(
              (window.innerWidth * window.innerHeight) / ORB_COEFF
            );
            for (let i = 0; i < numOrbs; i++) {
              orbMap.add(new Orb(2));
            }
          }, 10);
        };
        const onWindowResizeHandler = () => {
          onWindowResize(canvas, ctx, OrbMap);
        };
        window.addEventListener("resize", onWindowResizeHandler);

        const initializeDrawableObjects = () => {
          Orb.canvasHeight = window.innerHeight;
          Orb.canvasWidth = window.innerWidth;
          const numOrbs = Math.floor(
            (window.innerWidth * window.innerHeight) / ORB_COEFF
          );
          for (let i = 0; i < numOrbs; i++) {
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
            ctx.strokeStyle = `rgb(${
              DARK_COLOR.r + COLOR_DIFF.r * percentage
            },${DARK_COLOR.g + COLOR_DIFF.g * percentage},${
              DARK_COLOR.b + COLOR_DIFF.b * percentage
            })`;
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
            // OrbMap.applyAll(drawOrb);
            const qualifyingDistSq = Math.pow(Orb.qualifyingNearDistance, 2);
            const connections = OrbMap.reduce((acc, cur) => {
              const neighbors = OrbMap.getPossibleNeighbors(
                cur,
                Orb.qualifyingNearDistance
              );
              neighbors.forEach((neighborOrb) => {
                const distBetweenSq = OrbMap.distBetweenSquared(
                  cur,
                  neighborOrb
                );
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

        //Cleanup
        return () => {
          window.removeEventListener("resize", onWindowResizeHandler);
          if (requestAnimationFrameID.current) {
            cancelAnimationFrame(requestAnimationFrameID.current);
          }
        };
      }
    }
  }, []);
  return <canvas ref={canvasRef} className="absolute z-0" />;
}

export default Canvas;
