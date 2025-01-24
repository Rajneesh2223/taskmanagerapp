import { Bona_Nova } from 'next/font/google';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        geistSans: "var(--font-geist-sans)",
        geistMono: "var(--font-geist-mono)",
        Bona_Nova : "var(--font-bona-nova)"
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        darkbackground:"bg-[#0A0A0A]",
        secondryBakcground:"bg-[#44403C]"
      },
    },
  },
  plugins: [],
};
