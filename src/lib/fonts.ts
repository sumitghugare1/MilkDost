import localFont from 'next/font/local'

// Define Rubik font with multiple weights and styles
export const rubik = localFont({
  src: [
    {
      path: '../../public/fonts/Rubik/static/Rubik-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-LightItalic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-ExtraBoldItalic.ttf',
      weight: '800',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-Black.ttf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Rubik/static/Rubik-BlackItalic.ttf',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-rubik',
  display: 'swap',
})

// Alternative: Use variable font (more efficient)
export const rubikVariable = localFont({
  src: [
    {
      path: '../../public/fonts/Rubik/Rubik-VariableFont_wght.ttf',
      weight: '300 900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Rubik/Rubik-Italic-VariableFont_wght.ttf',
      weight: '300 900',
      style: 'italic',
    },
  ],
  variable: '--font-rubik',
  display: 'swap',
})

// Export the preferred font (using variable font for better performance)
export const primaryFont = rubikVariable