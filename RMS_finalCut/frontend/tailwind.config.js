module.exports = {
  purge: [],
  content:[
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily :{
        "cavet": ['Pacifico','sans-serif']
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
