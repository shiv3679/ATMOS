// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This tells Tailwind where to look for classes
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),      // These plugins are optional
    require('@tailwindcss/typography'),
  ],
};
