import React from "react";

type OctopusIconProps = {
  size?: number;
  className?: string;
};

const OctopusIcon = ({ size = 20, className = "" }: OctopusIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M4 11H3v1h1Zm0 0h1V8h1v3h1V8h1V7H3v1h1Zm-4 0h2v-1H0Zm2-1h1V8H2Zm5 2h1v-1H7ZM2 7h1V2H2Zm6 3h1V8H8Zm1 1h2v-1H9ZM4 6h1V4H4Zm2 0h1V4H6ZM3 2h5V1H3Zm5 5h1V2H8Zm0 0"
    />
  </svg>
);

export default OctopusIcon;
