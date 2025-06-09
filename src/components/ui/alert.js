import React from "react";

export function Alert({ children, className = "" }) {
  return <div className={`bg-red-100 p-3 rounded-md text-red-600 ${className}`}>{children}</div>;
}

export function AlertDescription({ children }) {
  return <p>{children}</p>;
}
