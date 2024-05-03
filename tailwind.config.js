/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        main: '#9ADDE7',
        sub1: '#1998AC',
        sub2: '#A781F9',
        sub3: '#FF005C',
        sub4: '#EBFFC9',
        sub5: '#E4F3F6',
        hint1: '#FBD4D7',
        hint2: '#FEE1C3',
        hint3: '#B3F4DD',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
