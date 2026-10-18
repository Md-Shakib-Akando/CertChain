'use client';

import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      avatar: '/images/sarah.jpg',
      quote: "“I verified a candidate's degree in less than 10 seconds. The process is simple, fast and reliable.”",
      name: 'Sarah Ahmed',
      role: 'HR Manager, TechCorp',
    },
    {
      avatar: '/images/rafiq.jpg',
      quote: '“The student portal makes it easy to manage and share my certificates whenever I need to.”',
      name: 'Rafiq Islam',
      role: 'Computer Science Graduate',
    },
    {
      avatar: '/images/nusrat.jpg',
      quote: '“This platform has modernized our credential management and reduced administrative workload.”',
      name: 'Dr. Nusrat Jahan',
      role: 'Registrar, Global University',
    },
  ];

  return (
    <section className="bg-white py-16 sm:py-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-14">
          <span className="text-xs font-bold tracking-wider uppercase text-[#2563EB] bg-blue-50 px-3.5 py-1.5 rounded-full inline-block border border-blue-100">
            What People Say
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] tracking-tight">
            Trusted by Students, Employers and Universities
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Real stories from our growing community.
          </p>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 p-7 shadow-xs hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between space-y-5"
            >
              {/* Avatar + Quote */}
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm shrink-0">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  {item.quote}
                </p>
              </div>

              {/* Author & Stars */}
              <div className="pt-4 border-t border-slate-100 space-y-1.5">
                <div className="font-bold text-sm text-slate-900">
                  {item.name}
                </div>
                <div className="text-xs text-slate-500">
                  {item.role}
                </div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 pt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
