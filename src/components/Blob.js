import React, { useState, useEffect } from "react";
import "./Blob.css";

export default function Blob() {
  const [blinking, setBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto blink every 3 seconds (only when not hovered)
  useEffect(() => {
    if (isHovered) return; // Don't auto-blink when hovered

    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => {
        setBlinking(false);
      }, 200); // blink length
    }, 3000); // blink every 3 sec
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setBlinking(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setBlinking(false);
  };

  return (
    <div
      className="blob-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src="/blob.png.png"
        alt="blob"
        className={`blob ${blinking ? "fade-out" : ""}`}
      />
      <img
        src="/blob-blink.png"
        alt="blob blink"
        className={`blob blink ${blinking ? "fade-in" : ""}`}
      />
    </div>
  );
}
