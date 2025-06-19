import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json'

export default {
  input: 'src/index.js',
  output: {
    dir: 'C:/codespace/obplus/fastify_mjs/build/dist',
    sourcemap: false,
    format: 'cjs',
  },
  plugins: [commonjs(), json({ compact: true }), terser()],
}
