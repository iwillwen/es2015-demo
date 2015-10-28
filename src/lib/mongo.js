import monk from 'monk'
import wrap from 'co-monk'

import config from '../../config.json'

const db = monk(config.dbs.mongo)

function collection(name) {
  return wrap(db.get(name))
}

export default {
  collection
}