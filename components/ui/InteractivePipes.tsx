"use client";

import React, { useEffect, useRef } from "react";

interface WaterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
}

interface Leak {
  id: number;
  x: number;
  y: number;
  sprayAngle: number;
  fixed: boolean;
  fixProgress: number;
  particles: WaterParticle[];
  repairTextTimer: number;
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
}

interface JointNode {
  x: number;
  y: number;
  hasGauge: boolean;
  pressureVal: number;
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
    let joints: JointNode[] = [];
    let leaks: Leak[] = [];
    let nextLeakId = 1;
    let wrenchAngle = 0;
    let isHoveringLeak = false;

    // Helper: Draw Dark Gunmetal Steel Pipe with 3D Cylindrical Highlight
    const drawGunmetalPipe = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      thickness: number,
      mouseGlow: number
    ) => {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const halfW = thickness * 1.25;
      const perpX = -Math.sin(angle) * halfW;
      const perpY = Math.cos(angle) * halfW;

      ctx.save();

      // Outer Shadow
      ctx.beginPath();
      ctx.moveTo(x1 - perpX * 1.5, y1 - perpY * 1.5);
      ctx.lineTo(x2 - perpX * 1.5, y2 - perpY * 1.5);
      ctx.lineTo(x2 + perpX * 1.5, y2 + perpY * 1.5);
      ctx.lineTo(x1 + perpX * 1.5, y1 + perpY * 1.5);
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fill();

      // Gunmetal Metal Gradient (Dark Slate / Silver Specular Line)
      const grad = ctx.createLinearGradient(
        x1 - perpX,
        y1 - perpY,
        x1 + perpX,
        y1 + perpY
      );
      grad.addColorStop(0, "#09090b");
      grad.addColorStop(0.3, "#27272a");
      grad.addColorStop(0.52, "#71717a"); // Crisp silver specular highlight line
      grad.addColorStop(0.78, "#3f3f46");
      grad.addColorStop(1, "#09090b");

      ctx.beginPath();
      ctx.moveTo(x1 - perpX, y1 - perpY);
      ctx.lineTo(x2 - perpX, y2 - perpY);
      ctx.lineTo(x2 + perpX, y2 + perpY);
      ctx.lineTo(x1 + perpX, y1 + perpY);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Subtle Red Mouse Proximity Glow
      if (mouseGlow > 0.05) {
        ctx.fillStyle = `rgba(239, 68, 68, ${mouseGlow * 0.25})`;
        ctx.fill();
      }

      ctx.restore();
    };

    // Helper: Draw Dark Flange Joint Ring
    const drawFlangeJoint = (x: number, y: number, r: number, mouseGlow: number) => {
      ctx.save();

      const grad = ctx.createRadialGradient(x, y, 2, x, y, r + 4);
      grad.addColorStop(0, "#71717a");
      grad.addColorStop(0.5, "#27272a");
      grad.addColorStop(1, "#09090b");

      ctx.beginPath();
      ctx.arc(x, y, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = mouseGlow > 0.2 ? "rgba(239, 68, 68, 0.6)" : "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = mouseGlow > 0.2 ? 14 : 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Pipe Fitting Core
      ctx.beginPath();
      ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "#18181b";
      ctx.fill();

      // 4 Hex Bolts
      for (let b = 0; b < 4; b++) {
        const bAngle = (b * Math.PI) / 2;
        const bx = x + Math.cos(bAngle) * (r * 0.7);
        const by = y + Math.sin(bAngle) * (r * 0.7);

        ctx.beginPath();
        ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "#a1a1aa";
        ctx.fill();
      }

      ctx.restore();
    };

    // Helper: Draw Sleek Dark Gauge
    const drawGauge = (x: number, y: number, r: number, pressure: number) => {
      ctx.save();

      // Outer Gunmetal Ring
      ctx.beginPath();
      ctx.arc(x, y, r + 2, 0, Math.PI * 2);
      ctx.fillStyle = "#27272a";
      ctx.fill();
      ctx.strokeStyle = "#52525b";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Dark Dial Face
      ctx.beginPath();
      ctx.arc(x, y, r * 0.82, 0, Math.PI * 2);
      ctx.fillStyle = "#09090b";
      ctx.fill();

      // Red Arc
      ctx.beginPath();
      ctx.arc(x, y, r * 0.65, -Math.PI * 0.2, Math.PI * 0.35);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Red Needle
      const needleAngle = -Math.PI * 0.75 + pressure * (Math.PI * 1.5);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(needleAngle) * (r * 0.62), y + Math.sin(needleAngle) * (r * 0.62));
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    };

    // Helper: Draw Stilson Pipe Wrench Cursor
    const drawHDWrench = (x: number, y: number, rot: number) => {
      ctx.save();
      ctx.translate(x + 16, y - 16);
      ctx.rotate(rot);

      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 12;

      // Dark Red Rubber Handle
      const handleGrad = ctx.createLinearGradient(-6, 0, 6, 0);
      handleGrad.addColorStop(0, "#7f1d1d");
      handleGrad.addColorStop(0.4, "#ef4444");
      handleGrad.addColorStop(1, "#991b1b");
      ctx.fillStyle = handleGrad;
      ctx.beginPath();
      ctx.roundRect(-5, 6, 10, 36, 3);
      ctx.fill();

      // Silver Steel Jaw
      const steelGrad = ctx.createLinearGradient(-9, -15, 9, 0);
      steelGrad.addColorStop(0, "#27272a");
      steelGrad.addColorStop(0.5, "#e4e4e7");
      steelGrad.addColorStop(1, "#52525b");
      ctx.fillStyle = steelGrad;

      ctx.beginPath();
      ctx.roundRect(-8, -15, 16, 15, 3);
      ctx.fill();

      ctx.beginPath();
      ctx.rect(-11, -24, 22, 7);
      ctx.rect(7, -24, 4, 14);
      ctx.fill();

      ctx.restore();
    };

    // Build Pipe Grid Framing the Edges (Clearing the Center)
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
      joints = [];
      const cols = Math.floor(width / 120) + 1;
      const rows = Math.floor(height / 120) + 1;
      const spacingX = width / Math.max(1, cols);
      const spacingY = height / Math.max(1, rows);

      const centerX = width / 2;
      const centerY = height / 2;

      // Define central clearance zone where NO pipes can pass
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

          // Skip joint if inside central hero text zone
          if (isInCenterZone(x, y)) continue;

          const hasGauge = (r + c) % 3 === 0 && Math.random() > 0.4;
          joints.push({ x, y, hasGauge, pressureVal: 0.4 + Math.random() * 0.5 });

          // Horizontal pipe (only if outside central zone)
          if (c < cols && Math.random() > 0.2) {
            const nextX = x + spacingX;
            const midX = (x + nextX) / 2;
            if (!isInCenterZone(midX, y)) {
              segments.push({
                x1: x,
                y1: y,
                x2: nextX,
                y2: y,
                thickness: Math.random() > 0.5 ? 9 : 6,
              });
            }
          }
          // Vertical pipe (only if outside central zone)
          if (r < rows && Math.random() > 0.2) {
            const nextY = y + spacingY;
            const midY = (y + nextY) / 2;
            if (!isInCenterZone(x, midY)) {
              segments.push({
                x1: x,
                y1: y,
                x2: x,
                y2: nextY,
                thickness: Math.random() > 0.5 ? 9 : 6,
              });
            }
          }
        }
      }

      // Initialize leaks on the outer framing joints
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

    // Render Loop
    const render = () => {
      mouseX += (targetMouseX - mouseX) * 0.12;
      mouseY += (targetMouseY - mouseY) * 0.12;
      wrenchAngle += 0.12;

      ctx.clearRect(0, 0, width, height);
      isHoveringLeak = false;

      // 1. Render Outer Framing Pipe Network (Dark Gunmetal Steel)
      segments.forEach((seg) => {
        const midX = (seg.x1 + seg.x2) / 2;
        const midY = (seg.y1 + seg.y2) / 2;
        const distToMouse = Math.hypot(mouseX - midX, mouseY - midY);
        const mouseGlow = Math.max(0, 1 - distToMouse / 240);

        drawGunmetalPipe(
          seg.x1,
          seg.y1,
          seg.x2,
          seg.y2,
          seg.thickness,
          mouseGlow
        );
      });

      // 2. Render Joints & Gauges on Outer Edges
      joints.forEach((j) => {
        const distToMouse = Math.hypot(mouseX - j.x, mouseY - j.y);
        const mouseGlow = Math.max(0, 1 - distToMouse / 240);

        drawFlangeJoint(j.x, j.y, 7, mouseGlow);

        if (j.hasGauge) {
          drawGauge(j.x, j.y - 16, 10, j.pressureVal);
        }
      });

      // 3. Render Leaks & Water Spray Jets on Outer Edges
      leaks.forEach((leak) => {
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

          // Emit Spray Jet Droplets
          if (Math.random() > 0.15) {
            const spread = 0.45;
            const angle = leak.sprayAngle + (Math.random() - 0.5) * spread;
            const speed = 3.5 + Math.random() * 4;
            leak.particles.push({
              x: leak.x,
              y: leak.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed + 0.5,
              life: 0,
              maxLife: 20 + Math.random() * 15,
              size: 2.5 + Math.random() * 2.5,
              opacity: 0.85,
            });
          }

          // Red Warning Flare
          const pulseR = 12 + Math.sin(Date.now() * 0.009) * 5;
          ctx.beginPath();
          ctx.arc(leak.x, leak.y, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
          ctx.shadowColor = "#ef4444";
          ctx.shadowBlur = 16;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Repair Ring
          if (leak.fixProgress > 0) {
            ctx.beginPath();
            ctx.arc(
              leak.x,
              leak.y,
              20,
              -Math.PI / 2,
              -Math.PI / 2 + Math.PI * 2 * leak.fixProgress
            );
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#22c55e";
            ctx.shadowColor = "#22c55e";
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        // Water Droplet Particles
        leak.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          const alpha = Math.max(0, p.opacity * (1 - p.life / p.maxLife));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(186, 230, 253, ${alpha})`;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
        leak.particles = leak.particles.filter((p) => p.life < p.maxLife);

        // Fixed Seal
        if (leak.fixed) {
          ctx.beginPath();
          ctx.arc(leak.x, leak.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(34, 197, 94, 0.85)";
          ctx.shadowColor = "#22c55e";
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;

          if (leak.repairTextTimer > 0) {
            leak.repairTextTimer--;
            const offsetY = (65 - leak.repairTextTimer) * 0.5;
            const textAlpha = Math.min(1, leak.repairTextTimer / 20);

            ctx.save();
            ctx.font = "900 13px sans-serif";
            ctx.fillStyle = `rgba(34, 197, 94, ${textAlpha})`;
            ctx.shadowColor = "#22c55e";
            ctx.shadowBlur = 10;
            ctx.textAlign = "center";
            ctx.fillText("¡FUGA REPARADA! 🔧", leak.x, leak.y - 18 - offsetY);
            ctx.restore();
          }
        }
      });

      leaks = leaks.filter((l) => !l.fixed || l.repairTextTimer > 0);

      // 4. Render Pipe Wrench Cursor over Leaks
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
