/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // blue-500
        secondary: '#1E40AF', // blue-800
        accent: '#F59E0B', // amber-500
        background: '#F3F4F6', // gray-100
      },
    },
  },
  plugins: [],
}
