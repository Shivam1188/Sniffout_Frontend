import React, { useState, useEffect } from "react";

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center text-xl font-mono bg-gray-100 rounded-lg p-4 shadow-inner">
      {time.toLocaleTimeString()}
    </div>
  );
};

export default DigitalClock;
