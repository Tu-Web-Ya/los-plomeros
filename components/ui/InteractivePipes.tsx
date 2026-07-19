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
  fixProgress: number; // 0 to 1
  particles: WaterParticle[];
  repairTextTimer: number;
  pressure: number; // 0 to 1
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  material: "copper" | "steel" | "bronze";
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

    // Helper: Draw 3D Metallic Cylindrical Pipe
    const drawRealisticPipe = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      thickness: number,
      material: "copper" | "steel" | "bronze",
      mouseGlow: number
    ) => {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const halfW = thickness * 1.3;
      const perpX = -Math.sin(angle) * halfW;
      const perpY = Math.cos(angle) * halfW;

      ctx.save();

      // Outer Drop Shadow
      ctx.beginPath();
      ctx.moveTo(x1 - perpX * 1.4, y1 - perpY * 1.4);
      ctx.lineTo(x2 - perpX * 1.4, y2 - perpY * 1.4);
      ctx.lineTo(x2 + perpX * 1.4, y2 + perpY * 1.4);
      ctx.lineTo(x1 + perpX * 1.4, y1 + perpY * 1.4);
      ctx.closePath();
      ctx.fillStyle = "rgba(2, 6, 23, 0.75)";
      ctx.fill();

      // 3D Cylindrical Metallic Gradient
      const grad = ctx.createLinearGradient(
        x1 - perpX,
        y1 - perpY,
        x1 + perpX,
        y1 + perpY
      );

      if (material === "copper") {
        grad.addColorStop(0, "#451a03"); // Dark shadow edge
        grad.addColorStop(0.3, "#9a3412"); // Copper body
        grad.addColorStop(0.55, "#fed7aa"); // Specular chrome/copper highlight
        grad.addColorStop(0.8, "#ea580c"); // Midtone reflection
        grad.addColorStop(1, "#292524"); // Dark bottom edge
      } else if (material === "bronze") {
        grad.addColorStop(0, "#291d09");
        grad.addColorStop(0.3, "#b45309");
        grad.addColorStop(0.55, "#fef3c7");
        grad.addColorStop(0.8, "#d97706");
        grad.addColorStop(1, "#1c1917");
      } else {
        // Steel / Galvanized Chrome
        grad.addColorStop(0, "#0f172a");
        grad.addColorStop(0.3, "#475569");
        grad.addColorStop(0.55, "#f8fafc"); // Specular highlight
        grad.addColorStop(0.8, "#64748b");
        grad.addColorStop(1, "#020617");
      }

      ctx.beginPath();
      ctx.moveTo(x1 - perpX, y1 - perpY);
      ctx.lineTo(x2 - perpX, y2 - perpY);
      ctx.lineTo(x2 + perpX, y2 + perpY);
      ctx.lineTo(x1 + perpX, y1 + perpY);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Reactive Emergency Heat Glow when mouse is near
      if (mouseGlow > 0.05) {
        ctx.fillStyle = `rgba(239, 68, 68, ${mouseGlow * 0.3})`;
        ctx.fill();
      }

      ctx.restore();
    };

    // Helper: Draw 3D Flange Connection Rings with Hex Bolts
    const drawFlangeJoint = (x: number, y: number, r: number, mouseGlow: number) => {
      ctx.save();

      // Outer Metallic Flange Ring
      const grad = ctx.createRadialGradient(x, y, 2, x, y, r + 5);
      grad.addColorStop(0, "#f8fafc");
      grad.addColorStop(0.5, "#475569");
      grad.addColorStop(1, "#0f172a");

      ctx.beginPath();
      ctx.arc(x, y, r + 5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = mouseGlow > 0.2 ? "rgba(239, 68, 68, 0.75)" : "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = mouseGlow > 0.2 ? 16 : 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Pipe Fitting Core
      ctx.beginPath();
      ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "#1e293b";
      ctx.fill();

      // 4 Hex Bolts around Flange
      for (let b = 0; b < 4; b++) {
        const bAngle = (b * Math.PI) / 2;
        const bx = x + Math.cos(bAngle) * (r * 0.72);
        const by = y + Math.sin(bAngle) * (r * 0.72);

        ctx.beginPath();
        ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#e2e8f0";
        ctx.fill();
      }

      ctx.restore();
    };

    // Helper: Draw Industrial Brass Pressure Gauge (Manómetro)
    const drawPressureGauge = (x: number, y: number, r: number, pressure: number) => {
      ctx.save();

      // Brass Outer Case
      const caseGrad = ctx.createRadialGradient(x, y, r * 0.5, x, y, r + 3);
      caseGrad.addColorStop(0, "#fde047");
      caseGrad.addColorStop(0.6, "#d97706");
      caseGrad.addColorStop(1, "#78350f");

      ctx.beginPath();
      ctx.arc(x, y, r + 3, 0, Math.PI * 2);
      ctx.fillStyle = caseGrad;
      ctx.fill();
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // White Dial Face
      ctx.beginPath();
      ctx.arc(x, y, r * 0.82, 0, Math.PI * 2);
      ctx.fillStyle = "#f8fafc";
      ctx.fill();

      // Red Danger PSI Zone Arc
      ctx.beginPath();
      ctx.arc(x, y, r * 0.65, -Math.PI * 0.2, Math.PI * 0.35);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Needle (Pressure Indicator)
      const needleAngle = -Math.PI * 0.75 + pressure * (Math.PI * 1.5);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(needleAngle) * (r * 0.62), y + Math.sin(needleAngle) * (r * 0.62));
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Needle Cap
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();

      ctx.restore();
    };

    // Helper: Draw Heavy-Duty Stilson Pipe Wrench Cursor
    const drawHDWrench = (x: number, y: number, rot: number) => {
      ctx.save();
      ctx.translate(x + 18, y - 18);
      ctx.rotate(rot);

      // Wrench Shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 14;

      // Heavy-Duty Red Handle
      const handleGrad = ctx.createLinearGradient(-6, 0, 6, 0);
      handleGrad.addColorStop(0, "#7f1d1d");
      handleGrad.addColorStop(0.4, "#ef4444");
      handleGrad.addColorStop(1, "#991b1b");
      ctx.fillStyle = handleGrad;
      ctx.beginPath();
      ctx.roundRect(-6, 6, 12, 38, 4);
      ctx.fill();

      // Brass Knurled Adjusting Nut
      const nutGrad = ctx.createLinearGradient(-7, 0, 7, 0);
      nutGrad.addColorStop(0, "#78350f");
      nutGrad.addColorStop(0.5, "#fde047");
      nutGrad.addColorStop(1, "#b45309");
      ctx.fillStyle = nutGrad;
      ctx.fillRect(-7, 0, 14, 6);

      // Chrome Plated Steel Jaw Base
      const steelGrad = ctx.createLinearGradient(-10, -16, 10, 0);
      steelGrad.addColorStop(0, "#334155");
      steelGrad.addColorStop(0.5, "#f1f5f9");
      steelGrad.addColorStop(1, "#475569");
      ctx.fillStyle = steelGrad;

      ctx.beginPath();
      ctx.roundRect(-9, -16, 18, 16, 3);
      ctx.fill();

      // Top Movable Hook Jaw
      ctx.beginPath();
      ctx.rect(-12, -26, 24, 8);
      ctx.rect(8, -26, 4, 16);
      ctx.fill();

      ctx.restore();
    };

    // Initialize Realistic Pipe Network & Leaks
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
      const cols = Math.floor(width / 130) + 1;
      const rows = Math.floor(height / 130) + 1;
      const spacingX = width / Math.max(1, cols);
      const spacingY = height / Math.max(1, rows);

      const materials: ("copper" | "steel" | "bronze")[] = ["steel", "copper", "bronze"];

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * spacingX;
          const y = r * spacingY;
          const hasGauge = (r + c) % 3 === 0 && Math.random() > 0.4;
          joints.push({ x, y, hasGauge, pressureVal: 0.4 + Math.random() * 0.5 });

          // Horizontal pipe
          if (c < cols && Math.random() > 0.2) {
            segments.push({
              x1: x,
              y1: y,
              x2: x + spacingX,
              y2: y,
              thickness: Math.random() > 0.5 ? 9 : 6,
              material: materials[Math.floor(Math.random() * materials.length)]!,
            });
          }
          // Vertical pipe
          if (r < rows && Math.random() > 0.2) {
            segments.push({
              x1: x,
              y1: y,
              x2: x,
              y2: y + spacingY,
              thickness: Math.random() > 0.5 ? 9 : 6,
              material: materials[Math.floor(Math.random() * materials.length)]!,
            });
          }
        }
      }

      // Initialize initial active leaks
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
            pressure: 0.85 + Math.random() * 0.15,
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

    // Main Render Loop
    const render = () => {
      mouseX += (targetMouseX - mouseX) * 0.12;
      mouseY += (targetMouseY - mouseY) * 0.12;
      wrenchAngle += 0.12;

      ctx.clearRect(0, 0, width, height);
      isHoveringLeak = false;

      // 1. Render Realistic 3D Pipe Network
      segments.forEach((seg) => {
        const midX = (seg.x1 + seg.x2) / 2;
        const midY = (seg.y1 + seg.y2) / 2;
        const distToMouse = Math.hypot(mouseX - midX, mouseY - midY);
        const mouseGlow = Math.max(0, 1 - distToMouse / 240);

        drawRealisticPipe(
          seg.x1,
          seg.y1,
          seg.x2,
          seg.y2,
          seg.thickness,
          seg.material,
          mouseGlow
        );
      });

      // 2. Render Flange Joints and Gauges
      joints.forEach((j) => {
        const distToMouse = Math.hypot(mouseX - j.x, mouseY - j.y);
        const mouseGlow = Math.max(0, 1 - distToMouse / 240);

        drawFlangeJoint(j.x, j.y, 8, mouseGlow);

        if (j.hasGauge) {
          drawPressureGauge(j.x, j.y - 18, 11, j.pressureVal);
        }
      });

      // 3. Process & Render Water Leaks and High Pressure Spray Jets
      leaks.forEach((leak) => {
        const distToMouse = Math.hypot(mouseX - leak.x, mouseY - leak.y);

        if (!leak.fixed) {
          // If mouse is over leak, trigger pipe wrench tightening repair
          if (distToMouse < 70) {
            isHoveringLeak = true;
            leak.fixProgress += 0.035;

            if (leak.fixProgress >= 1) {
              leak.fixed = true;
              leak.repairTextTimer = 65;

              // Respawn a new leak somewhere else after 3 seconds
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
                  pressure: 0.9,
                });
              }, 3000);
            }
          } else if (leak.fixProgress > 0) {
            leak.fixProgress = Math.max(0, leak.fixProgress - 0.01);
          }

          // Emit High Pressure Water Jet Spray Particles
          if (Math.random() > 0.15) {
            const spread = 0.45;
            const angle = leak.sprayAngle + (Math.random() - 0.5) * spread;
            const speed = 3.5 + Math.random() * 4.5;
            leak.particles.push({
              x: leak.x,
              y: leak.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed + 0.6, // Gravity pull
              life: 0,
              maxLife: 22 + Math.random() * 16,
              size: 2.5 + Math.random() * 3,
              opacity: 0.85,
            });
          }

          // Warning Red Flare at Leaking Joint
          const pulseR = 12 + Math.sin(Date.now() * 0.009) * 5;
          ctx.beginPath();
          ctx.arc(leak.x, leak.y, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
          ctx.shadowColor = "#ef4444";
          ctx.shadowBlur = 18;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Repair Progress Arc Ring
          if (leak.fixProgress > 0) {
            ctx.beginPath();
            ctx.arc(
              leak.x,
              leak.y,
              22,
              -Math.PI / 2,
              -Math.PI / 2 + Math.PI * 2 * leak.fixProgress
            );
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#22c55e";
            ctx.shadowColor = "#22c55e";
            ctx.shadowBlur = 12;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        // Render Water Droplet Spray & Steam Mist
        leak.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          const alpha = Math.max(0, p.opacity * (1 - p.life / p.maxLife));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(186, 230, 253, ${alpha})`; // Water droplet specular glow
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
        leak.particles = leak.particles.filter((p) => p.life < p.maxLife);

        // Fixed Seal Sparkle
        if (leak.fixed) {
          ctx.beginPath();
          ctx.arc(leak.x, leak.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(34, 197, 94, 0.85)";
          ctx.shadowColor = "#22c55e";
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Floating "+1 REPARADO" text
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

      // 4. Render Heavy Duty Pipe Wrench Cursor when hovering over leaks
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
