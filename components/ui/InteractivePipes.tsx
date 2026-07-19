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
      angle: number;
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

    interface Roach {
      segIndex: number;
      t: number;
      dir: number;
      speed: number;
      legPhase: number;
      size: number;
    }

    interface Rat {
      jointIndex: number;
      targetJointIndex: number;
      peekProgress: number;
      jumpProgress: number;
      state: "hidden" | "peeking" | "watching" | "ducking" | "jumping";
      timer: number;
      whiskerPhase: number;
      lookOffset: number;
    }

    let segments: Segment[] = [];
    let joints: { x: number; y: number; hasGauge: boolean; pressureVal: number }[] = [];
    let leaks: Leak[] = [];
    let roaches: Roach[] = [];
    let rat: Rat = {
      jointIndex: -1,
      targetJointIndex: -1,
      peekProgress: 0,
      jumpProgress: 0,
      state: "hidden",
      timer: 120,
      whiskerPhase: 0,
      lookOffset: 0,
    };

    let nextLeakId = 1;
    let wrenchAngle = 0;
    let isHoveringLeak = false;

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

      segments = [];
      joints = [];

      const cols = Math.floor(width / 100) + 1;
      const rows = Math.floor(height / 100) + 1;
      const spacingX = width / Math.max(1, cols);
      const spacingY = height / Math.max(1, rows);

      const centerX = width / 2;
      const centerY = height / 2;

      // Refined clearance zone for Hero text
      const clearWidth = Math.min(width * 0.60, 720);
      const clearHeight = Math.min(height * 0.75, 540);

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

          const hasGauge = (r + c) % 3 === 0 && Math.random() > 0.35;
          joints.push({ x, y, hasGauge, pressureVal: 0.4 + Math.random() * 0.5 });

          // Horizontal pipe segment
          if (c < cols && Math.random() > 0.15) {
            const nextX = x + spacingX;
            if (
              !isInCenterZone(x, y) &&
              !isInCenterZone(nextX, y) &&
              !isInCenterZone((x + nextX) / 2, y)
            ) {
              segments.push({
                x1: x,
                y1: y,
                x2: nextX,
                y2: y,
                thickness: 9,
                angle: 0,
              });
            }
          }

          // Vertical pipe segment
          if (r < rows && Math.random() > 0.15) {
            const nextY = y + spacingY;
            if (
              !isInCenterZone(x, y) &&
              !isInCenterZone(x, nextY) &&
              !isInCenterZone(x, (y + nextY) / 2)
            ) {
              segments.push({
                x1: x,
                y1: y,
                x2: x,
                y2: nextY,
                thickness: 9,
                angle: Math.PI / 2,
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

      // Initialize 3 Cockroaches on random pipe segments
      roaches = [];
      if (segments.length > 0) {
        for (let i = 0; i < 3; i++) {
          const segIdx = Math.floor(Math.random() * segments.length);
          roaches.push({
            segIndex: segIdx,
            t: Math.random(),
            dir: Math.random() > 0.5 ? 1 : -1,
            speed: 0.0025 + Math.random() * 0.0025,
            legPhase: Math.random() * 10,
            size: 8.5 + Math.random() * 2.5,
          });
        }
      }

      // Initialize Rat position
      if (joints.length > 0) {
        rat.jointIndex = Math.floor(Math.random() * joints.length);
        rat.targetJointIndex = rat.jointIndex;
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

    // Wrench Drawer
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

    // Draw Detailed Cockroach
    const drawRoach = (x: number, y: number, angle: number, legPhase: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Shadow on pipe
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.ellipse(0, 3, size * 0.9, size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // 6 Wiggling Legs
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 1.2;
      for (let side of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          const legOffset = (i - 1) * 3;
          const wiggle = Math.sin(legPhase + i * 1.5) * 3.5 * side;
          ctx.beginPath();
          ctx.moveTo(legOffset, 0);
          ctx.lineTo(legOffset + (i - 1) * 2, side * (6 + wiggle));
          ctx.stroke();
        }
      }

      // Main Amber Mahogany Shell
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.8, size * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#78350f";
      ctx.fill();

      // Specular Highlight
      ctx.beginPath();
      ctx.ellipse(-2, -1.5, size * 0.4, size * 0.18, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(251, 191, 36, 0.45)";
      ctx.fill();

      // Head
      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      ctx.arc(size * 0.75, 0, size * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // 2 Waving Antennae
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 0.9;
      const antWiggle = Math.sin(legPhase * 0.8) * 3;
      ctx.beginPath();
      ctx.moveTo(size * 0.85, -1);
      ctx.quadraticCurveTo(size * 1.4, -4 + antWiggle, size * 1.8, -7 + antWiggle);
      ctx.moveTo(size * 0.85, 1);
      ctx.quadraticCurveTo(size * 1.4, 4 - antWiggle, size * 1.8, 7 - antWiggle);
      ctx.stroke();

      ctx.restore();
    };

    // Draw Detailed Peeking City Rat
    const drawRat = (x: number, y: number, peekProgress: number, lookOffset: number, whiskerPhase: number) => {
      if (peekProgress <= 0.05) return;

      const peekY = y - peekProgress * 22;

      ctx.save();
      ctx.translate(x, peekY);

      // Ears
      ctx.fillStyle = "#52525b";
      ctx.beginPath();
      ctx.arc(-8, -10, 6.5, 0, Math.PI * 2);
      ctx.arc(8, -10, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner Pink Ears
      ctx.fillStyle = "#f472b6";
      ctx.beginPath();
      ctx.arc(-8, -10, 3.8, 0, Math.PI * 2);
      ctx.arc(8, -10, 3.8, 0, Math.PI * 2);
      ctx.fill();

      // Furry Head
      ctx.fillStyle = "#3f3f46";
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Snout
      ctx.fillStyle = "#71717a";
      ctx.beginPath();
      ctx.ellipse(lookOffset * 2, 4, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shiny Eyes
      const eyeXOffset = lookOffset * 2.5;
      ctx.fillStyle = "#09090b";
      ctx.beginPath();
      ctx.arc(-4.5 + eyeXOffset, -2, 2.4, 0, Math.PI * 2);
      ctx.arc(4.5 + eyeXOffset, -2, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Eye Reflection
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-5 + eyeXOffset, -2.8, 0.8, 0, Math.PI * 2);
      ctx.arc(4 + eyeXOffset, -2.8, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(lookOffset * 3, 6, 2, 0, Math.PI * 2);
      ctx.fill();

      // Whiskers
      ctx.strokeStyle = "#e4e4e7";
      ctx.lineWidth = 0.8;
      const wWiggle = Math.sin(whiskerPhase * 8) * 1.5;
      ctx.beginPath();
      ctx.moveTo(lookOffset * 3 - 2, 6);
      ctx.lineTo(-14, 4 + wWiggle);
      ctx.moveTo(lookOffset * 3 - 2, 7);
      ctx.lineTo(-14, 8 - wWiggle);
      ctx.moveTo(lookOffset * 3 + 2, 6);
      ctx.lineTo(14, 4 - wWiggle);
      ctx.moveTo(lookOffset * 3 + 2, 7);
      ctx.lineTo(14, 8 + wWiggle);
      ctx.stroke();

      // Paws on Flange
      ctx.fillStyle = "#f472b6";
      ctx.beginPath();
      ctx.arc(-7, 12, 2.5, 0, Math.PI * 2);
      ctx.arc(7, 12, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw Parabolic Jumping City Rat
    const drawJumpingRat = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      progress: number
    ) => {
      const currentX = x1 + (x2 - x1) * progress;
      const arcHeight = Math.sin(progress * Math.PI) * 48;
      const currentY = y1 + (y2 - y1) * progress - arcHeight;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx) + (progress - 0.5) * 0.4;

      ctx.save();
      ctx.translate(currentX, currentY);
      ctx.rotate(angle);

      // Trailing Pink Tail
      ctx.strokeStyle = "#f472b6";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-10, 2);
      ctx.quadraticCurveTo(-18, 6 + Math.sin(progress * 12) * 5, -24, 2);
      ctx.stroke();

      // Ears
      ctx.fillStyle = "#52525b";
      ctx.beginPath();
      ctx.arc(-4, -8, 5.5, 0, Math.PI * 2);
      ctx.arc(4, -8, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f472b6";
      ctx.beginPath();
      ctx.arc(-4, -8, 3, 0, Math.PI * 2);
      ctx.arc(4, -8, 3, 0, Math.PI * 2);
      ctx.fill();

      // Furry Body
      ctx.fillStyle = "#3f3f46";
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = "#71717a";
      ctx.beginPath();
      ctx.arc(8, 1, 6, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = "#09090b";
      ctx.beginPath();
      ctx.arc(9, -1, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(8.5, -1.6, 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(13, 2, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Paws
      ctx.fillStyle = "#f472b6";
      ctx.beginPath();
      ctx.arc(-2, 7, 2, 0, Math.PI * 2);
      ctx.arc(4, 7, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Main Render Loop
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

      // 1. Draw 3D Metallic Pipes
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
        ctx.strokeStyle = mouseGlow > 0.1 ? "#3f3f46" : "#27272a";
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.lineWidth = seg.thickness * 0.28;
        ctx.strokeStyle = mouseGlow > 0.1 ? "#ef4444" : "#71717a";
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // 2. Draw Cockroaches scurrying on pipes
      for (let i = 0; i < roaches.length; i++) {
        const r = roaches[i]!;
        const seg = segments[r.segIndex];
        if (!seg) continue;

        const distToMouse = Math.hypot(
          mouseX - (seg.x1 + (seg.x2 - seg.x1) * r.t),
          mouseY - (seg.y1 + (seg.y2 - seg.y1) * r.t)
        );

        const currentSpeed = distToMouse < 90 ? r.speed * 2.8 : r.speed;
        r.t += currentSpeed * r.dir;
        r.legPhase += currentSpeed * 40;

        if (r.t >= 1 || r.t <= 0) {
          r.dir *= -1;
          r.t = Math.max(0, Math.min(1, r.t));
          if (Math.random() > 0.3 && segments.length > 0) {
            r.segIndex = Math.floor(Math.random() * segments.length);
          }
        }

        const roachX = seg.x1 + (seg.x2 - seg.x1) * r.t;
        const roachY = seg.y1 + (seg.y2 - seg.y1) * r.t;
        const walkAngle = seg.angle + (r.dir === -1 ? Math.PI : 0);

        drawRoach(roachX, roachY, walkAngle, r.legPhase, r.size);
      }

      // 3. Draw Flange Joints & Gauges
      for (let i = 0; i < joints.length; i++) {
        const j = joints[i]!;
        const distToMouse = Math.hypot(mouseX - j.x, mouseY - j.y);
        const mouseGlow = distToMouse < 240 ? 1 - distToMouse / 240 : 0;

        // Draw Little Rat peeking behind this joint
        if (rat.jointIndex === i && rat.peekProgress > 0.05 && rat.state !== "jumping") {
          drawRat(j.x, j.y, rat.peekProgress, rat.lookOffset, rat.whiskerPhase);
        }

        // Flange Ring
        ctx.beginPath();
        ctx.arc(j.x, j.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = mouseGlow > 0.15 ? "#ef4444" : "#3f3f46";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(j.x, j.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#18181b";
        ctx.fill();

        // Hex Bolts
        for (let b = 0; b < 4; b++) {
          const bAngle = (b * Math.PI) / 2;
          const bx = j.x + Math.cos(bAngle) * 6.5;
          const by = j.y + Math.sin(bAngle) * 6.5;
          ctx.beginPath();
          ctx.arc(bx, by, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = "#a1a1aa";
          ctx.fill();
        }

        // Gauges
        if (j.hasGauge) {
          ctx.beginPath();
          ctx.arc(j.x, j.y - 16, 9, 0, Math.PI * 2);
          ctx.fillStyle = "#09090b";
          ctx.strokeStyle = "#52525b";
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(j.x, j.y - 16, 6, -Math.PI * 0.2, Math.PI * 0.35);
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2;
          ctx.stroke();

          const needleAngle = -Math.PI * 0.75 + j.pressureVal * (Math.PI * 1.5);
          ctx.beginPath();
          ctx.moveTo(j.x, j.y - 16);
          ctx.lineTo(
            j.x + Math.cos(needleAngle) * 5.5,
            j.y - 16 + Math.sin(needleAngle) * 5.5
          );
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Draw Jumping Rat in Mid-Air Parabolic Leap (Rare Event - Gentle Realistic Hop)
      if (rat.state === "jumping" && joints[rat.jointIndex] && joints[rat.targetJointIndex]) {
        const j1 = joints[rat.jointIndex]!;
        const j2 = joints[rat.targetJointIndex]!;
        drawJumpingRat(j1.x, j1.y, j2.x, j2.y, rat.jumpProgress);

        // Slow, graceful, realistic jump speed (~2 seconds for full arc)
        rat.jumpProgress += 0.008;
        if (rat.jumpProgress >= 1) {
          rat.jumpProgress = 0;
          rat.jointIndex = rat.targetJointIndex;
          rat.state = "peeking";
          rat.peekProgress = 0.6;
        }
      }

      // Update Rat State Machine with Low Probability Jump Arc
      if (joints.length > 0) {
        const activeJoint = joints[rat.jointIndex];
        if (activeJoint) {
          const distToMouse = Math.hypot(mouseX - activeJoint.x, mouseY - activeJoint.y);

          rat.whiskerPhase += 0.1;
          rat.lookOffset = Math.sin(Date.now() * 0.002) * 0.8;

          if (distToMouse < 100 && (rat.state === "peeking" || rat.state === "watching")) {
            rat.state = "ducking";
          }

          if (rat.state === "hidden") {
            rat.timer--;
            if (rat.timer <= 0) {
              // Rare 10% probability of triggering a gentle hop to a NEARBY joint!
              const triggerJump = Math.random() < 0.10 && joints.length > 1;

              if (triggerJump) {
                const jStart = joints[rat.jointIndex]!;
                // Find neighboring joints within 220px
                const neighbors = joints.filter((j, idx) => {
                  if (idx === rat.jointIndex) return false;
                  const d = Math.hypot(j.x - jStart.x, j.y - jStart.y);
                  return d > 60 && d < 220;
                });

                if (neighbors.length > 0) {
                  const chosen = neighbors[Math.floor(Math.random() * neighbors.length)]!;
                  rat.targetJointIndex = joints.indexOf(chosen);
                  rat.state = "jumping";
                  rat.jumpProgress = 0;
                } else {
                  rat.jointIndex = Math.floor(Math.random() * joints.length);
                  rat.state = "peeking";
                }
              } else {
                rat.jointIndex = Math.floor(Math.random() * joints.length);
                rat.state = "peeking";
              }
            }
          } else if (rat.state === "peeking") {
            rat.peekProgress += 0.05;
            if (rat.peekProgress >= 1) {
              rat.peekProgress = 1;
              rat.state = "watching";
              rat.timer = 150;
            }
          } else if (rat.state === "watching") {
            rat.timer--;
            if (rat.timer <= 0) {
              rat.state = "ducking";
            }
          } else if (rat.state === "ducking") {
            rat.peekProgress -= 0.08;
            if (rat.peekProgress <= 0) {
              rat.peekProgress = 0;
              rat.state = "hidden";
              rat.timer = 220 + Math.floor(Math.random() * 280);
            }
          }
        }
      }

      // 4. Draw Leaks & Water Spray Particles
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

          ctx.beginPath();
          ctx.arc(leak.x, leak.y, 14, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(239, 68, 68, 0.28)";
          ctx.fill();

          if (leak.fixProgress > 0) {
            ctx.beginPath();
            ctx.arc(
              leak.x,
              leak.y,
              20,
              -Math.PI / 2,
              -Math.PI / 2 + Math.PI * 2 * leak.fixProgress
            );
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#22c55e";
            ctx.stroke();
          }
        }

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
          ctx.arc(leak.x, leak.y, 8, 0, Math.PI * 2);
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

    const timer = setTimeout(() => {
      render();
    }, 400);

    return () => {
      clearTimeout(timer);
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
