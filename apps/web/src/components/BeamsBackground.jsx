// components/BeamsBackground.jsx
import { useEffect, useRef } from 'react';

// hues sampled from your theme palette ( #2c4663, #41679b, #accfff, #395b81 all sit ~200-215)
function createBeam(width, height) {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.14 + Math.random() * 0.18,
    hue: 200 + Math.random() * 20,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

function BeamsBackground({ children }) {
  const canvasRef = useRef(null);
  const beamsRef = useRef([]);
  const animationFrameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const MINIMUM_BEAMS = 20;

    function updateCanvasSize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      const totalBeams = MINIMUM_BEAMS * 1.5;
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(canvas.width, canvas.height)
      );
    }

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    function resetBeam(beam, index, totalBeams) {
      const column = index % 3;
      const spacing = canvas.width / 3;
      beam.y = canvas.height + 100;
      beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = 200 + (index * 20) / totalBeams; // stays within the theme's blue range
      beam.opacity = 0.22 + Math.random() * 0.12;
      return beam;
    }

    function drawBeam(beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2);
      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 55%, 45%, 0)`);
      gradient.addColorStop(0.1, `hsla(${beam.hue}, 55%, 45%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(0.4, `hsla(${beam.hue}, 55%, 45%, ${pulsingOpacity})`);
      gradient.addColorStop(0.6, `hsla(${beam.hue}, 55%, 45%, ${pulsingOpacity})`);
      gradient.addColorStop(0.9, `hsla(${beam.hue}, 55%, 45%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, 55%, 45%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'blur(35px)';

      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -100) resetBeam(beam, index, totalBeams);
        drawBeam(beam);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#0c1620',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, filter: 'blur(15px)' }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default BeamsBackground;