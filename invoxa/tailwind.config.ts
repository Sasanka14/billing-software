content: [
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
],
darkMode: 'class',
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#7c3aed', // purple
        dark: '#4c1d95',
      },
      gray: {
        900: '#18181b',
        800: '#27272a',
        700: '#3f3f46',
        600: '#52525b',
        500: '#71717a',
        400: '#a1a1aa',
        300: '#d4d4d8',
        200: '#e4e4e7',
        100: '#f4f4f5',
      },
    },
  },
},
plugins: [], 