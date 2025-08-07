'use client';

import React from 'react';

/**
 * Typography showcase component demonstrating Rubik font usage
 * This component shows different font weights and styles available
 */
export default function TypographyShowcase() {
  return (
    <div className="p-6 space-y-8 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-dark mb-2">
          DairyMate Typography
        </h1>
        <p className="text-lg text-dark/70 mb-8">
          Showcasing the Rubik font family implementation
        </p>

        {/* Headings */}
        <section className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold text-dark border-b border-sage pb-2">
            Headings
          </h2>
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-dark">Heading 1 - Archia Bold</h1>
            <h2 className="text-4xl font-bold text-dark">Heading 2 - Archia Bold</h2>
            <h3 className="text-3xl font-semibold text-dark">Heading 3 - Archia Semibold</h3>
            <h4 className="text-2xl font-semibold text-dark">Heading 4 - Archia Semibold</h4>
            <h5 className="text-xl font-medium text-dark">Heading 5 - Archia Medium</h5>
            <h6 className="text-lg font-medium text-dark">Heading 6 - Archia Medium</h6>
          </div>
        </section>

        {/* Body Text */}
        <section className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold text-dark border-b border-sage pb-2">
            Body Text
          </h2>
          <div className="space-y-4">
            <p className="text-lg font-normal text-dark">
              <strong>Large Paragraph:</strong> This is a large paragraph using Archia Regular. 
              The font provides excellent readability for body text and maintains clarity 
              across different screen sizes and resolutions.
            </p>
            <p className="text-base font-normal text-dark">
              <strong>Regular Paragraph:</strong> This is a regular paragraph demonstrating 
              the standard body text appearance. Archia offers clean, modern letterforms 
              that enhance the reading experience in the DairyMate application.
            </p>
            <p className="text-sm font-normal text-dark">
              <strong>Small Paragraph:</strong> This smaller text is perfect for captions, 
              metadata, and secondary information. The font remains legible even at reduced sizes.
            </p>
          </div>
        </section>

        {/* Font Weights */}
        <section className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold text-dark border-b border-sage pb-2">
            Font Weights
          </h2>
          <div className="space-y-3">
            <p className="text-xl font-light text-dark">Font Weight 300 - Light</p>
            <p className="text-xl font-normal text-dark">Font Weight 400 - Regular (Default)</p>
            <p className="text-xl font-medium text-dark">Font Weight 500 - Medium</p>
            <p className="text-xl font-semibold text-dark">Font Weight 600 - Semibold</p>
            <p className="text-xl font-bold text-dark">Font Weight 700 - Bold</p>
          </div>
        </section>

        {/* UI Elements */}
        <section className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold text-dark border-b border-sage pb-2">
            UI Elements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Button Examples */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-dark">Buttons</h3>
              <button className="btn-primary w-full">
                Primary Button
              </button>
              <button className="btn-secondary w-full">
                Secondary Button
              </button>
              <button className="btn-outline w-full">
                Outline Button
              </button>
            </div>

            {/* Input Examples */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-dark">Input Fields</h3>
              <input 
                type="text" 
                placeholder="Name" 
                className="w-full px-4 py-2 border border-sage rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full px-4 py-2 border border-sage rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
              />
              <textarea 
                placeholder="Message"
                rows={3}
                className="w-full px-4 py-2 border border-sage rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent resize-none"
              />
            </div>

            {/* Card Example */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-dark">Cards</h3>
              <div className="bg-white border border-sage rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-dark mb-2">Card Title</h4>
                <p className="text-sm text-dark/70 mb-3">
                  This is a card component showing how the Archia font 
                  renders in different contexts.
                </p>
                <div className="flex justify-between items-center text-xs text-dark/60">
                  <span>Status: Active</span>
                  <span>Updated: Today</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Numbers and Data */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-dark border-b border-sage pb-2">
            Numbers & Data
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-sage">
              <div className="text-3xl font-bold text-dark">1,234</div>
              <div className="text-sm font-medium text-dark/70">Total Clients</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-sage">
              <div className="text-3xl font-bold text-dark">₹56,789</div>
              <div className="text-sm font-medium text-dark/70">Monthly Revenue</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-sage">
              <div className="text-3xl font-bold text-dark">98.5%</div>
              <div className="text-sm font-medium text-dark/70">Delivery Rate</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-sage">
              <div className="text-3xl font-bold text-dark">42</div>
              <div className="text-sm font-medium text-dark/70">Active Buffalo</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
