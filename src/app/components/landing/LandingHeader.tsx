import React from 'react';

interface LandingHeaderProps {
  headingText: string;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ headingText }) => (
  <>
    <h1 className="text-5xl font-extrabold leading-relaxed mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
      {headingText}
    </h1>
    <p className="text-xl mb-8 max-w-2xl text-center">
      Transform your wardrobe with AI-powered style intelligence. Attirely helps you organize your clothes, create perfect outfits, and discover your personal style.
    </p>
  </>
);

export default LandingHeader; 