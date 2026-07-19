"use client";

import React, { useEffect, useRef } from "react";

interface LeakParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface Leak {
  id: number;
  x: number;
  y: number;
  sprayAngle: number;
  fixed: boolean;
  fixProgress: number; // 0 to 1
  particles: LeakParticle[];
  repairTextTimer: number; // for floating "+1 Reparado"
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
}

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

    let segments: Segment[] = [];
    let leaks: Leak[] = [];
    let nextLeakId = 1;
    let wrenchAngle = 0;
    let isHoveringLeak = false;

    // Initialize pipe grid and random leak spots
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
      const cols = Math.floor(width / 110) + 1;
      const rows = Math.floor(height / 110) + 1;
      const spacingX = width / Math.max(1, cols);
      const spacingY = height / Math.max(1, rows);

      const joints: { x: number; y: number }[] = [];

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * spacingX;
          const y = r * spacingY;
          joints.push({ x, y });

          if (c < cols && Math.random() > 0.25) {
            segments.push({
              x1: x,
              y1: y,
              x2: x + spacingX,
              y2: y,
              thickness: Math.random() > 0.6 ? 6 : 4,
            });
          }
          if (r < rows && Math.random() > 0.25) {
            segments.push({
              x1: x,
              y1: y,
              x2: x,
              y2: y + spacingY,
              thickness: Math.random() > 0.6 ? 6 : 4,
            });
          }
        }
      }

      // Create initial active leaks at random pipe joints
      leaks = [];
      const shuffleJoints = [...joints].sort(() => Math.random() - 0.5);
      const numLeaks = Math.min(4, shuffleJoints.length);

      for (let i = 0; i < numLeaks; i++) {
        const j = shuffleJoints[i];
        if (j) {
          leaks.push({
            id: nextLeakId++,
            x: j.x,
            y: j.y,
            sprayAngle: Math.random() * Math.PI * 2,
            fixed: false,
            fixProgress: 0,
            particles: [],
            repairTextTimer: 0,
          });
        }
      }
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

    // Draw Pipe Wrench Cursor over leak
    const drawPipeWrench = (x: number, y: number, rot: number) => {
      ctx.save();
      ctx.translate(x + 12, y - 12);
      ctx.rotate(rot);

      // Shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 12;

      // Handle (Red Industrial Wrench)
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.roundRect(-5, 4, 10, 32, 3);
      ctx.fill();
      ctx.strokeStyle = "#991b1b";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Metallic Adjusting Nut
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(-6, 0, 12, 5);

      // Silver Steel Jaw Head
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.roundRect(-8, -14, 16, 14, 2);
      ctx.fill();
      ctx.strokeStyle = "#475569";
      ctx.stroke();

      // Top Hook Jaw
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.rect(-10, -22, 20, 8);
      ctx.rect(6, -22, 4, 14);
      ctx.fill();

      ctx.restore();
    };

    // Main Animation Loop
    const render = () => {
      mouseX += (targetMouseX - mouseX) * 0.12;
      mouseY += (targetMouseY - mouseY) * 0.12;
      wrenchAngle += 0.12;

      ctx.clearRect(0, 0, width, height);
      isHoveringLeak = false;

      // 1. Draw Metallic Pipe Lines
      segments.forEach((seg) => {
        const midX = (seg.x1 + seg.x2) / 2;
        const midY = (seg.y1 + seg.y2) / 2;
        const distToMouse = Math.hypot(mouseX - midX, mouseY - midY);
        const mouseGlow = Math.max(0, 1 - distToMouse / 220);

        // Pipe Shadow
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.lineWidth = seg.thickness + 4;
        ctx.strokeStyle = `rgba(10, 10, 14, ${0.8 + mouseGlow * 0.2})`;
        ctx.lineCap = "round";
        ctx.stroke();

        // Pipe Inner Metal Body
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.lineWidth = seg.thickness;
        ctx.strokeStyle = mouseGlow > 0.1
          ? `rgba(${Math.floor(60 + mouseGlow * 170)}, ${Math.floor(25 + mouseGlow * 40)}, ${Math.floor(30 + mouseGlow * 40)}, ${0.4 + mouseGlow * 0.5})`
          : `rgba(36, 36, 42, 0.4)`;
        ctx.stroke();

        // Flange / Elbow Joints
        [{ x: seg.x1, y: seg.y1 }, { x: seg.x2, y: seg.y2 }].forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, seg.thickness * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = mouseGlow > 0.2
            ? `rgba(239, 68, 68, ${0.4 + mouseGlow * 0.5})`
            : `rgba(26, 26, 30, 0.6)`;
          ctx.fill();
        });
      });

      // 2. Process & Draw Leaks + Water Spray
      leaks.forEach((leak) => {
        const distToMouse = Math.hypot(mouseX - leak.x, mouseY - leak.y);

        if (!leak.fixed) {
          // If mouse is near leak, user is tightening/fixing it!
          if (distToMouse < 65) {
            isHoveringLeak = true;
            leak.fixProgress += 0.035; // Fixes in ~0.3 seconds

            if (leak.fixProgress >= 1) {
              leak.fixed = true;
              leak.repairTextTimer = 60; // Show "+1 Reparado" for 60 frames

              // Spawn new leak somewhere else after 3 seconds
              setTimeout(() => {
                const newX = (Math.random() * 0.8 + 0.1) * width;
                const newY = (Math.random() * 0.8 + 0.1) * height;
                leaks.push({
                  id: nextLeakId++,
                  x: newX,
                  y: newY,
                  sprayAngle: Math.random() * Math.PI * 2,
                  fixed: false,
                  fixProgress: 0,
                  particles: [],
                  repairTextTimer: 0,
                });
              }, 3000);
            }
          } else if (leak.fixProgress > 0) {
            leak.fixProgress = Math.max(0, leak.fixProgress - 0.01);
          }

          // Emit Water Spray Particles
          if (Math.random() > 0.2) {
            const spread = 0.5;
            const angle = leak.sprayAngle + (Math.random() - 0.5) * spread;
            const speed = 2.5 + Math.random() * 3.5;
            leak.particles.push({
              x: leak.x,
              y: leak.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed + 0.5, // subtle gravity
              life: 0,
              maxLife: 20 + Math.random() * 15,
              size: 2 + Math.random() * 2.5,
            });
          }

          // Draw Warning Pulse around broken pipe joint
          const pulseRadius = 10 + Math.sin(Date.now() * 0.008) * 4;
          ctx.beginPath();
          ctx.arc(leak.x, leak.y, pulseRadius, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
          ctx.shadowColor = "#ef4444";
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Draw Repairing Progress Ring
          if (leak.fixProgress > 0) {
            ctx.beginPath();
            ctx.arc(
              leak.x,
              leak.y,
              18,
              -Math.PI / 2,
              -Math.PI / 2 + Math.PI * 2 * leak.fixProgress
            );
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#22c55e"; // Green repair ring
            ctx.shadowColor = "#22c55e";
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        // Render Water Spray Particles
        leak.particles.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          const alpha = Math.max(0, 1 - p.life / p.maxLife);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.8})`; // Water Cyan Glow
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
        leak.particles = leak.particles.filter((p) => p.life < p.maxLife);

        // Draw Fixed Joint Sparkle Glow
        if (leak.fixed) {
          ctx.beginPath();
          ctx.arc(leak.x, leak.y, 7, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(34, 197, 94, 0.8)"; // Green repaired seal
          ctx.shadowColor = "#22c55e";
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Floating "+1 REPARADO" text
          if (leak.repairTextTimer > 0) {
            leak.repairTextTimer--;
            const offsetY = (60 - leak.repairTextTimer) * 0.5;
            const textAlpha = Math.min(1, leak.repairTextTimer / 20);

            ctx.save();
            ctx.font = "900 12px sans-serif";
            ctx.fillStyle = `rgba(34, 197, 94, ${textAlpha})`;
            ctx.shadowColor = "#22c55e";
            ctx.shadowBlur = 8;
            ctx.textAlign = "center";
            ctx.fillText("¡FUGA REPARADA! 🔧", leak.x, leak.y - 15 - offsetY);
            ctx.restore();
          }
        }
      });

      // Remove fixed leaks after text timer finishes
      leaks = leaks.filter((l) => !l.fixed || l.repairTextTimer > 0);

      // 3. Render Custom Pipe Wrench Cursor when hovering near a leak
      if (isHoveringLeak && mouseX > 0 && mouseY > 0) {
        drawPipeWrench(mouseX, mouseY, Math.sin(wrenchAngle) * 0.3);
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
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
