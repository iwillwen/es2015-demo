import AV from 'leanengine'

const APP_ID = process.env.LC_APP_ID || '1FyJrNv3YTh0gJgh1gmwfx1c'
const APP_KEY = process.env.LC_APP_KEY || '9xkimPSEA880LJvNj3SmvrNx'
const MASTER_KEY = process.env.LC_APP_MASTER_KEY || 'sw8kMfNc8apR1RxK5RbPVuaC'

AV.initialize(APP_ID, APP_KEY, MASTER_KEY)

export default AV