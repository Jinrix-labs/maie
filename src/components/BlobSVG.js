import React from 'react';
import './BlobSVG.css';

export default function BlobSVG({ blinking, onMouseEnter, onMouseLeave }) {
  return (
    <div
      className="blob-svg-container"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <svg
        className={`blob-svg ${blinking ? "blink" : ""}`}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main blob shape - organic, fluid blob */}
        <path
          d="M100,40 C120,40 140,50 150,70 C160,90 160,110 150,130 C140,150 120,160 100,160 C80,160 60,150 50,130 C40,110 40,90 50,70 C60,50 80,40 100,40 Z"
          fill="#667eea"
          className="blob-path"
        />
        {/* Optional: Add a highlight/shine effect */}
        <ellipse
          cx="80"
          cy="70"
          rx="20"
          ry="15"
          fill="rgba(255, 255, 255, 0.3)"
          className="blob-highlight"
        />
        
        {/* Face features */}
        {/* Left eyebrow - more arched */}
        <path
          d="M 68 78 Q 80 65 92 78"
          stroke="#ffffff"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          className="eyebrow"
        />
        
        {/* Right eyebrow - more arched */}
        <path
          d="M 108 78 Q 120 65 132 78"
          stroke="#ffffff"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          className="eyebrow"
        />
        
        {/* Left eye - bigger */}
        <circle
          cx="80"
          cy="90"
          r="10"
          fill="#ffffff"
          className="eye"
        />
        <circle
          cx="82"
          cy="92"
          r="5"
          fill="#667eea"
          className="eye-pupil"
        />
        
        {/* Right eye - bigger */}
        <circle
          cx="120"
          cy="90"
          r="10"
          fill="#ffffff"
          className="eye"
        />
        <circle
          cx="122"
          cy="92"
          r="5"
          fill="#667eea"
          className="eye-pupil"
        />
        
        {/* Mouth - friendly smile */}
        <path
          d="M 85 120 Q 100 130 115 120"
          stroke="#ffffff"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          className="mouth"
        />
      </svg>
    </div>
  );
}

