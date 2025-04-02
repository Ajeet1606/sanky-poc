import React from 'react';

const GradientLink = () => {
  return (
    <div className="flex h-screen w-52 items-center justify-center">
      <div className="h-40 w-10 bg-green-400"></div>
      <div className="h-40 w-32 bg-gradient-to-r from-green-400 to-red-400"></div>
      <div className="h-40 w-10 bg-red-400"></div>
    </div>
  );
};

export default GradientLink;
