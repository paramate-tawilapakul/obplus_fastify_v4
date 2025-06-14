const dotenv = require('dotenv')

function initEnv() {
  if (process.env.NODE_ENV === 'production') {
    // const { fileURLToPath } = require('url')
    // const path = require('path')
    // const filename = fileURLToPath(
    //   require('url').pathToFileURL(__filename).href
    // )
    // const __dirname = path.dirname(filename)
    // console.log('dirname1', __dirname + '\\' + '../.env')
    // dotenv.config({ path: __dirname + '\\' + '../.env' })

    const path = require('path')
    const filename = path.join(process.cwd(), '.env')
    const dirname = path.dirname(filename)
    // console.log('dirname2', path.join(dirname, '../', '.env'))
    dotenv.config({ path: path.join(dirname, '../', '.env') })
  } else {
    dotenv.config({})
  }
}

exports.default = initEnv
