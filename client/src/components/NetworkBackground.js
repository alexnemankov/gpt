import React, { useEffect, useRef } from 'react';

const NODE_COUNT = 130;
const LINK_DISTANCE = 130;
const WAVE_SPEED = 0.00055;

const makeNodes = (width, height) => {
  const nodes = [];

  for (let index = 0; index < NODE_COUNT; index += 1) {
    nodes.push({
      baseX: Math.random() * width,
      baseY: Math.random() * height,
      x: 0,
      y: 0,
      phase: Math.random() * Math.PI * 2,
      drift: 0.45 + Math.random() * 0.95
    });
  }

  return nodes;
};

const NetworkBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrame;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    setupCanvas();
    let nodes = makeNodes(width, height);

    const draw = (timestamp) => {
      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(2, 8, 24, 1)');
      gradient.addColorStop(1, 'rgba(2, 7, 18, 0.95)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const motionSpeed = reducedMotion ? 0.0001 : WAVE_SPEED;
        node.x = node.baseX + Math.sin(timestamp * motionSpeed + node.phase) * 38 * node.drift;
        node.y = node.baseY + Math.cos(timestamp * motionSpeed * 0.82 + node.phase) * 24 * node.drift;
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const first = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const second = nodes[j];
          const dx = first.x - second.x;
          const dy = first.y - second.y;
          const distance = Math.hypot(dx, dy);

          if (distance < LINK_DISTANCE) {
            const alpha = (1 - distance / LINK_DISTANCE) * 0.36;
            context.strokeStyle = `rgba(130, 185, 255, ${alpha})`;
            context.lineWidth = 1.05;
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.stroke();
          }
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const glow = context.createRadialGradient(node.x, node.y, 0, node.x, node.y, 8);
        glow.addColorStop(0, 'rgba(244, 249, 255, 0.95)');
        glow.addColorStop(1, 'rgba(114, 176, 255, 0)');
        context.fillStyle = glow;
        context.beginPath();
        context.arc(node.x, node.y, 4.8, 0, Math.PI * 2);
        context.fill();
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    animationFrame = window.requestAnimationFrame(draw);

    const handleResize = () => {
      setupCanvas();
      nodes = makeNodes(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="network-canvas" />;
};

export default NetworkBackground;
