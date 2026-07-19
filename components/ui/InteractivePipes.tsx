"use client";

import React, { useEffect, useRef } from "react";

export function InteractivePipes() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
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
      isHoriz: boolean;
    }

    interface Leak {
      id: number;
      x: number;
      y: number;
      sprayAngle: number;
      fixed: boolean;
      fixProgress: number;
      particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[];
      repairTextTimer: number;
    }

    let segments: Segment[] = [];
    let joints: { x: number; y: number; hasGauge: boolean; pressureVal: number }[] = [];
    let leaks: Leak[] = [];
    let nextLeakId = 1;
    let wrenchAngle = 0;
    let isHoveringLeak = false;

    // Cached gradients for ultra-fast rendering
    let hPipeGrad: CanvasGradient | null = null;
    let vPipeGrad: CanvasGradient | null = null;

    const initGrid = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth || window.innerWidth;
      height = parent?.clientHeight || window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Pre-create pipe gradients per resize
      hPipeGrad = ctx.createLinearGradient(0, 0, 0, 8);
      hPipeGrad.addColorStop(0, "#09090b");
      hPipeGrad.addColorStop(0.3, "#27272a");
      hPipeGrad.addColorStop(0.52, "#71717a");
      hPipeGrad.addColorStop(0.78, "#3f3f46");
      hPipeGrad.addColorStop(1, "#09090b");

      vPipeGrad = ctx.createLinearGradient(0, 0, 8, 0);
      vPipeGrad.addColorStop(0, "#09090b");
      vPipeGrad.addColorStop(0.3, "#27272a");
      vPipeGrad.addColorStop(0.52, "#71717a");
      vPipeGrad.addColorStop(0.78, "#3f3f46");
      vPipeGrad.addColorStop(1, "#09090b");

      segments = [];
      joints = [];

      const cols = Math.floor(width / 120) + 1;
      const rows = Math.floor(height / 120) + 1;
      const spacingX = width / Math.max(1, cols);
      const spacingY = height / Math.max(1, rows);

      const centerX = width / 2;
      const centerY = height / 2;
      const clearWidth = Math.min(width * 0.65, 750);
      const clearHeight = Math.min(height * 0.7, 520);

      const isInCenterZone = (px: number, py: number) => {
        return (
          px > centerX - clearWidth / 2 &&
          px < centerX + clearWidth / 2 &&
          py > centerY - clearHeight / 2 &&
          py < centerY + clearHeight / 2
        );
      };

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * spacingX;
          const y = r * spacingY;

          if (isInCenterZone(x, y)) continue;

          const hasGauge = (r + c) % 3 === 0 && Math.random() > 0.4;
          joints.push({ x, y, hasGauge, pressureVal: 0.4 + Math.random() * 0.5 });

          if (c < cols && Math.random() > 0.2) {
            const nextX = x + spacingX;
            if (!isInCenterZone((x + nextX) / 2, y)) {
              segments.push({
                x1: x,
                y1: y,
                x2: nextX,
                y2: y,
                thickness: 8,
                isHoriz: true,
              });
            }
          }

          if (r < rows && Math.random() > 0.2) {
            const nextY = y + spacingY;
            if (!isInCenterZone(x, (y + nextY) / 2)) {
              segments.push({
                x1: x,
                y1: y,
                x2: x,
                y2: nextY,
                thickness: 8,
                isHoriz: false,
              });
            }
          }
        }
      }

      // Initialize leaks
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

    // Fast Wrench Drawer
    const drawHDWrench = (x: number, y: number, rot: number) => {
      ctx.save();
      ctx.translate(x + 16, y - 16);
      ctx.rotate(rot);

      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.roundRect(-5, 6, 10, 36, 3);
      ctx.fill();

      ctx.fillStyle = "#e4e4e7";
      ctx.fillRect(-8, -15, 16, 15);
      ctx.fillRect(-11, -24, 22, 7);
      ctx.fillRect(7, -24, 4, 14);

      ctx.restore();
    };

    // Render loop with high FPS optimizations
    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      mouseX += (targetMouseX - mouseX) * 0.12;
      mouseY += (targetMouseY - mouseY) * 0.12;
      wrenchAngle += 0.12;

      ctx.clearRect(0, 0, width, height);
      isHoveringLeak = false;

      // 1. Draw Pipes using cached gradients
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]!;
        const midX = (seg.x1 + seg.x2) / 2;
        const midY = (seg.y1 + seg.y2) / 2;
        const distToMouse = Math.hypot(mouseX - midX, mouseY - midY);
        const mouseGlow = distToMouse < 240 ? 1 - distToMouse / 240 : 0;

        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.lineWidth = seg.thickness;
        ctx.strokeStyle = (seg.isHoriz ? hPipeGrad : vPipeGrad) || "#27272a";
        ctx.stroke();

        if (mouseGlow > 0.05) {
          ctx.fillStyle = `rgba(239, 68, 68, ${mouseGlow * 0.25})`;
          ctx.fill();
        }
      }

      // 2. Draw Joints
      for (let i = 0; i < joints.length; i++) {
        const j = joints[i]!;
        ctx.beginPath();
        ctx.arc(j.x, j.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#27272a";
        ctx.fill();

        if (j.hasGauge) {
          ctx.beginPath();
          ctx.arc(j.x, j.y - 14, 8, 0, Math.PI * 2);
          ctx.fillStyle = "#09090b";
          ctx.strokeStyle = "#52525b";
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
        }
      }

      // 3. Draw Leaks & Water Particles
      for (let i = 0; i < leaks.length; i++) {
        const leak = leaks[i]!;
        const distToMouse = Math.hypot(mouseX - leak.x, mouseY - leak.y);

        if (!leak.fixed) {
          if (distToMouse < 70) {
            isHoveringLeak = true;
            leak.fixProgress += 0.035;

            if (leak.fixProgress >= 1) {
              leak.fixed = true;
              leak.repairTextTimer = 65;

              setTimeout(() => {
                if (joints.length > 0) {
                  const randomJoint = joints[Math.floor(Math.random() * joints.length)]!;
                  leaks.push({
                    id: nextLeakId++,
                    x: randomJoint.x,
                    y: randomJoint.y,
                    sprayAngle: Math.random() * Math.PI * 2,
                    fixed: false,
                    fixProgress: 0,
                    particles: [],
                    repairTextTimer: 0,
                  });
                }
              }, 3000);
            }
          } else if (leak.fixProgress > 0) {
            leak.fixProgress = Math.max(0, leak.fixProgress - 0.01);
          }

          if (Math.random() > 0.2) {
            const spread = 0.45;
            const angle = leak.sprayAngle + (Math.random() - 0.5) * spread;
            const speed = 3.5 + Math.random() * 4;
            leak.particles.push({
              x: leak.x,
              y: leak.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed + 0.5,
              life: 0,
              maxLife: 18 + Math.random() * 12,
              size: 2 + Math.random() * 2,
            });
          }

          // Warning Ring
          ctx.beginPath();
          ctx.arc(leak.x, leak.y, 12, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
          ctx.fill();

          if (leak.fixProgress > 0) {
            ctx.beginPath();
            ctx.arc(
              leak.x,
              leak.y,
              18,
              -Math.PI / 2,
              -Math.PI / 2 + Math.PI * 2 * leak.fixProgress
            );
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#22c55e";
            ctx.stroke();
          }
        }

        // Draw Water Droplets
        for (let pIdx = leak.particles.length - 1; pIdx >= 0; pIdx--) {
          const p = leak.particles[pIdx]!;
          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          const alpha = Math.max(0, 1 - p.life / p.maxLife);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(186, 230, 253, ${alpha * 0.85})`;
          ctx.fill();

          if (p.life >= p.maxLife) {
            leak.particles.splice(pIdx, 1);
          }
        }

        if (leak.fixed) {
          ctx.beginPath();
          ctx.arc(leak.x, leak.y, 7, 0, Math.PI * 2);
          ctx.fillStyle = "#22c55e";
          ctx.fill();

          if (leak.repairTextTimer > 0) {
            leak.repairTextTimer--;
            const offsetY = (65 - leak.repairTextTimer) * 0.5;
            const textAlpha = Math.min(1, leak.repairTextTimer / 20);

            ctx.save();
            ctx.font = "900 13px sans-serif";
            ctx.fillStyle = `rgba(34, 197, 94, ${textAlpha})`;
            ctx.textAlign = "center";
            ctx.fillText("¡FUGA REPARADA! 🔧", leak.x, leak.y - 18 - offsetY);
            ctx.restore();
          }
        }
      }

      leaks = leaks.filter((l) => !l.fixed || l.repairTextTimer > 0);

      if (isHoveringLeak && mouseX > 0 && mouseY > 0) {
        drawHDWrench(mouseX, mouseY, Math.sin(wrenchAngle) * 0.35);
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
