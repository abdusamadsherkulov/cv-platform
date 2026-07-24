import { useState, useEffect } from 'react';

function CountUp({ end, duration = 1000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(end); // make sure it lands exactly on the real number
      }
    }

    requestAnimationFrame(step);
  }, [end, duration]);

  return <>{count}</>;
}

export default CountUp;