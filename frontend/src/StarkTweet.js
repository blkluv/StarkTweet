// StarkTweetIcon.js
import React from "react";

const StarkTweetIcon = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    aria-label="StarkTweet logo"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block" }}
  >
    {/* Bird Body */}
    <path
      d="M20 40 Q10 30 24 24 Q12 20 28 18 Q24 10 40 16 Q52 10 54 24 Q60 24 56 32 Q62 38 54 38 Q48 44 40 40 Q36 50 28 46 Q22 50 20 40 Z"
      fill="#1d9bf0"
      stroke="#156db6"
      strokeWidth="2"
    />
    {/* Bird Wing */}
    <path
      d="M36 30 Q40 22 48 28 Q44 32 36 30 Z"
      fill="#fff"
      opacity="0.7"
    />
    {/* Bird Beak */}
    <polygon points="56,32 62,34 56,36" fill="#f4b400" />
    {/* Token (circle) */}
    <circle cx="54" cy="38" r="7" fill="#fff" stroke="#1d9bf0" strokeWidth="2" />
    {/* Stark star in token */}
    <polygon
      points="54,33 55.5,37 60,37 56,39.5 57.5,44 54,41.5 50.5,44 52,39.5 48,37 52.5,37"
      fill="#f4b400"
      stroke="#e6c200"
      strokeWidth="0.8"
    />
  </svg>
);

export default StarkTweetIcon;
