import baseRoutes from '../modules/base/routes/index.js'
import googleRoutes from '../modules/google/routes/index.js'
import benefitsRoutes from '../modules/benefits/routes'

const modulesRoutes = [
  ...baseRoutes,
  ...googleRoutes,
    ...benefitsRoutes

]

export default modulesRoutes
export {modulesRoutes}
