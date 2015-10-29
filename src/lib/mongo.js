import monk from 'monk'
import wrap from 'co-monk'

import config from '../../config.json'

const db = monk(config.dbs.mongo)

/**
 * 返回 MongoDB 中的 Collection 實例
 * 
 * @param  {String} name collection name
 * @return {Object}      Collection
 */
function collection(name) {
  return wrap(db.get(name))
}

export default {
  collection
}