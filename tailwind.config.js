/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#005db6",
        "primary-container": "#131b2e",
        "primary-fixed": "#d8e3fb",
        "secondary": "#006a60",
        "secondary-fixed": "#9ff2e2",
        "tertiary": "#8f4c36",
        "tertiary-container": "#271901",
        "tertiary-fixed": "#ffdadc",
        "surface": "#f7f9fb",
        "surface-container": "#eceef0",
        "surface-container-low": "#f0f4f8",
        "surface-variant": "#e0e3e5",
        "surface-bright": "#f7f9fb",
        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#edf1f5",
        "outline": "#76777d",
        "outline-variant": "#c4c7c7",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "status-success": "#22c55e",
        "status-warning": "#f59e0b",
        "status-danger": "#ef4444",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
