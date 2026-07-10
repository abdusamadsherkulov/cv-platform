import { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('loading...');

  useEffect(() => {
    fetch('https://cw-platform.onrender.com/health')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('error connecting'));
  }, []);

  return <h1>API status: {status}</h1>;
}

export default App;