import React from 'react';
import Image from 'next/image';

const Clients: React.FC = () => {
  const clientLogos = [
    'client01.png',
    'client02.png',
    'client03.png',
    'client04.png',
    'client05.png',
    'client06.png',
    'client07.png',
    'client08.png',
  ];

  return (
    <section style={{ backgroundColor: '#000000' }} className="py-20">
      <div className="container mx-auto text-center">
        {/* Outer div scrolls horizontally but allows vertical overflow for glow */}
        <div className="overflow-x-auto md:overflow-visible">
          <div className="flex items-center gap-8 snap-x snap-mandatory md:flex-wrap md:justify-center pb-4 md:pb-0 px-4 md:px-0 py-4">
            {clientLogos.map((logo, index) => (
              <div key={index} className="flex-shrink-0 snap-center w-20 h-20 md:w-32 md:h-32 relative p-1 rounded-full border-2 border-yellow-500 transition-all duration-300 hover:shadow-[0_0_15px_5px_rgba(255,215,0,0.5)]">
                <Image
                  src={`/client/${logo}`}
                  alt={`Client ${index + 1}`}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Clients;