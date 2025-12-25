import React from "react";

const BackgroundDecorations = () => {
  return (
    <div className="pointer-events-none abs`zolute inset-0 overflow-hidden">
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/5 blur-3xl" />
    </div>
  );
};

export default BackgroundDecorations;
