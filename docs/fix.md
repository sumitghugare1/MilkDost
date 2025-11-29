The "white block" issue you are seeing is likely caused by invisible icons due to a combination of Tailwind CSS v4 updates and color configuration issues.

Here is the breakdown of the problem:

White on White: Your icons have the class text-white. The container should have a colored gradient background (like from-sage or from-blue-500).

Missing Background: In Tailwind v4, custom colors defined in tailwind.config.ts (like sage) or standard gradients might not resolve correctly if the configuration isn't detected or mapped to CSS variables. This creates a transparent background.

Result: A transparent container on a white card = White Background. A white icon on a white background = Invisible.

The "Block": The container has shadow-lg, so even without a color, you see the faint shadow outline of the square container, creating the "white block" effect.

How to Fix It
You need to properly register your custom colors for Tailwind v4 and ensure the gradient syntax works.

Step 1: Update src/app/globals.css
Tailwind v4 prefers defining theme variables directly in CSS. Since you already have :root variables, you should map them in a @theme block.

Replace or update your src/app/globals.css with this:

CSS

@import "tailwindcss";

@theme {
  /* Register custom colors so Tailwind classes like bg-sage, text-sage work */
  --color-sage: #b5cbb7;
  --color-cream: #f3efe6;
  --color-dark: #2e2e2e;
  
  /* Map your other semantic colors if needed */
  --color-primary: #2e2e2e;
  --color-secondary: #b5cbb7;
  --color-accent: #b5cbb7;
}

/* Keep your font imports and other styles below */
/* ... existing font-face code ... */

:root {
  /* You can keep these if used by other libraries, but @theme handles Tailwind */
  --background: #f3efe6;
  --foreground: #2e2e2e;
}

/* ... rest of your CSS ... */
Step 2: Update Component Styles (Gradient Fix)
Tailwind v4 introduces bg-linear-to-* for gradients, though bg-gradient-to-* usually still works. To be safe and ensure visibility, let's update the ClientDashboard and ClientProfile.

For src/components/dashboard/ClientDashboard.tsx: Locate the StatCard component. Add a fallback background color and ensure the icon has fill-none to prevent it from becoming a solid block.

TypeScript

// In StatCard component
function StatCard({ title, value, icon: Icon, iconBgClass = 'bg-sage', subtitle }: StatCardProps) {
  return (
    <div className="bg-gradient-to-br from-white/95 to-white/90 ...">
      <div className="flex items-center justify-between mb-4">
        {/* Added 'relative' and fallback color. Ensure iconBgClass uses valid v4 colors */}
        <div className={`w-14 h-14 flex items-center justify-center p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${iconBgClass}`}>
          {/* Added 'fill-none' to ensure it doesn't render as a solid square */}
          <Icon size={32} className="text-white stroke-2 fill-none" />
        </div>
        {/* ... rest of the code ... */}
For src/components/clients/ClientProfile.tsx: Update the icon container classes to ensure the gradient picks up the new @theme colors.

TypeScript

// Around line 74
<div className="p-3 bg-gradient-to-br from-sage to-sage/90 rounded-xl shadow-lg">
  <User size={28} className="text-white stroke-2 fill-none" />
</div>
(Make sure to add fill-none to the Icon classes)

Step 3: Verify Icon Imports
Ensure your imports in ClientDashboard.tsx and ClientProfile.tsx are correct. They look correct in your file, but double-check that lucide-react is installed and functioning.

TypeScript

import { User, Calendar, FileText, ... } from 'lucide-react';
Summary of Changes
Define Colors in CSS: Added @theme { --color-sage: #b5cbb7; ... } to globals.css so Tailwind v4 can see them.

Add fill-none: Added fill-none to the Icon classes to ensure they don't render as solid squares.

Check Backgrounds: The gradients (from-sage) will now work because sage is defined in the @theme block.

After these changes, the "white block" (container) will turn green (sage color), and the white icon inside it will become visible.