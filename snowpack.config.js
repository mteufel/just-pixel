module.exports = {
  mount: {
    /*
    public: '/',
    src: '/_dist_',
    */
    public: {url: '/', static: true},
    src: {url: '/dist'},
  },
  plugins: ['@snowpack/plugin-vue',
            '@snowpack/plugin-vue/plugin-tsx-jsx.js',
            '@snowpack/plugin-dotenv'],
  install: [
    /* ... */
  ],
  installOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
  proxy: {
    /* ... */
  },
  alias: {
    "vue": "vue/dist/vue.esm-bundler.js",
    "vue/dist/vue.esm-bundler.js": "vue/dist/vue.esm-bundler.js"
  },
};
