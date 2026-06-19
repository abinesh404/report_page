import { useRef, useEffect, useCallback } from 'react';

const ClickSpark = ({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  children
}) => {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeTimeout;

    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(parent);

    resizeCanvas();

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  const easeFunc = useCallback(
    (t) => {
      switch (easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        case 'ease-out':
        default:
          return 1 - Math.pow(1 - t, 3);
      }
    },
    [easing]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;

    const draw = () => {
      if (sparksRef.current.length === 0) return;

      if (!startTimeRef.current) startTimeRef.current = performance.now();
      const elapsed = performance.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeFunc(progress);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current.forEach((spark) => {
        const x = spark.x + Math.cos(spark.angle) * sparkRadius * easedProgress * extraScale;
        const y = spark.y + Math.sin(spark.angle) * sparkRadius * easedProgress * extraScale;
        const currentSize = sparkSize * (1 - easedProgress);
        const opacity = 1 - easedProgress;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = sparkColor;
        ctx.beginPath();
        ctx.arc(x, y, currentSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (progress < 1) {
        animationId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sparksRef.current = [];
        startTimeRef.current = null;
      }
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [duration, sparkColor, sparkSize, sparkRadius, easeFunc, extraScale]);

  const handleClick = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
        x,
        y,
        angle: (2 * Math.PI * i) / sparkCount
      }));

      sparksRef.current = newSparks;
      startTimeRef.current = null;
    },
    [sparkCount]
  );

  return (
    <div
      style={{ position: 'relative', display: 'contents' }}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999
        }}
      />
      {children}
    </div>
  );
};

export default ClickSpark;
