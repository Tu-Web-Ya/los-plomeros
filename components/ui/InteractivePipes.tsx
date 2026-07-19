"use client";

import React, { useEffect, useRef } from "react";

export function InteractivePipes() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    interface Segment {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      thickness: number;
    }

    interface Pulse {
      segIndex: number;
      pos: number;
      speed: number;
      isEmergency: boolean;
    }

    let segments: Segment[] = [];
    let pulses: Pulse[] = [];

    const initGrid = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth || window.innerWidth;
      height = parent?.clientHeight || window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      segments = [];
      const cols = Math.floor(width / 95) + 1;
      const rows = Math.floor(height / 95) + 1;
      const spacingX = width / Math.max(1, cols);
      const spacingY = height / Math.max(1, rows);

      // Build grid of pipe segments
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * spacingX;
          const y = r * spacingY;

          // Horizontal pipe
          if (c < cols && Math.random() > 0.3) {
            segments.push({
              x1: x,
              y1: y,
              x2: x + spacingX,
              y2: y,
              thickness: Math.random() > 0.65 ? 6 : 4,
            });
          }
          // Vertical pipe
          if (r < rows && Math.random() > 0.3) {
            segments.push({
              x1: x,
              y1: y,
              x2: x,
              y2: y + spacingY,
              thickness: Math.random() > 0.65 ? 6 : 4,
            });
          }
        }
      }

      // Initialize fluid pulses flowing inside pipes
      pulses = Array.from({ length: 30 }).map(() => ({
        segIndex: Math.floor(Math.random() * Math.max(1, segments.length)),
        pos: Math.random(),
        speed: 0.003 + Math.random() * 0.006,
        isEmergency: Math.random() > 0.35,
      }));
    };

    initGrid();

    const handleResize = () => {
      initGrid();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      // Smooth lerp mouse tracking
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Pipe Network
      segments.forEach((seg) => {
        const midX = (seg.x1 + seg.x2) / 2;
        const midY = (seg.y1 + seg.y2) / 2;
        const distToMouse = Math.hypot(mouseX - midX, mouseY - midY);
        const mouseGlow = Math.max(0, 1 - distToMouse / 240);

        // Pipe Outer Shadow
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.lineWidth = seg.thickness + 4;
        ctx.strokeStyle = `rgba(10, 10, 14, ${0.75 + mouseGlow * 0.25})`;
        ctx.lineCap = "round";
        ctx.stroke();

        // Pipe Metallic Tube Body
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.lineWidth = seg.thickness;

        if (mouseGlow > 0.05) {
          ctx.strokeStyle = `rgba(${Math.floor(50 + mouseGlow * 180)}, ${Math.floor(20 + mouseGlow * 40)}, ${Math.floor(25 + mouseGlow * 40)}, ${0.4 + mouseGlow * 0.5})`;
        } else {
          ctx.strokeStyle = `rgba(32, 32, 38, 0.35)`;
        }
        ctx.stroke();

        // Connection Flange Rings at joints
        [{ x: seg.x1, y: seg.y1 }, { x: seg.x2, y: seg.y2 }].forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, seg.thickness * 1.15, 0, Math.PI * 2);
          if (mouseGlow > 0.15) {
            ctx.fillStyle = `rgba(239, 68, 68, ${0.35 + mouseGlow * 0.55})`;
          } else {
            ctx.fillStyle = `rgba(24, 24, 28, 0.5)`;
          }
          ctx.fill();
        });
      });

      // 2. Draw Fluid Pulses in Pipes
      if (segments.length > 0) {
        pulses.forEach((p) => {
          const seg = segments[p.segIndex];
          if (!seg) return;

          p.pos += p.speed;
          if (p.pos > 1) {
            p.pos = 0;
            p.segIndex = Math.floor(Math.random() * segments.length);
          }

          const currX = seg.x1 + (seg.x2 - seg.x1) * p.pos;
          const currY = seg.y1 + (seg.y2 - seg.y1) * p.pos;

          const distToMouse = Math.hypot(mouseX - currX, mouseY - currY);
          const nearMouse = distToMouse < 220;

          ctx.beginPath();
          ctx.arc(currX, currY, nearMouse ? 4.5 : 2.5, 0, Math.PI * 2);

          if (p.isEmergency || nearMouse) {
            ctx.fillStyle = `rgba(239, 68, 68, ${nearMouse ? 0.95 : 0.6})`;
            ctx.shadowColor = "#ef4444";
            ctx.shadowBlur = nearMouse ? 14 : 6;
          } else {
            ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 6;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 3. Ambient Pressure Halo around Mouse
      if (mouseX > 0 && mouseY > 0) {
        const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 240);
        grad.addColorStop(0, "rgba(239, 68, 68, 0.12)");
        grad.addColorStop(0.5, "rgba(239, 68, 68, 0.03)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 240, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
