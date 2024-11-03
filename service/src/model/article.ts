import { db } from '../mongodb'
import autoIncrement = require('mongoose-auto-increment')
import mongoosePaginate = require('mongoose-paginate')
import { Document } from 'mongoose'

autoIncrement.initialize(db.connection)

export interface IArticle extends Document {
  uuid: string
  title: string
  author: string
  source: string
  content_len: number
  word_counts: number
  read_time: number
  content: string
  link: string
  category: string
  tags: string[]
  create_at: Date
  update_at: Date
  delete_at: Date
}

const articleSchema = new db.Schema({
  uuid: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: false },
  source: { type: String, required: true },
  content_len: { type: Number, required: true },
  word_counts: { type: Number, required: true },
  read_time: { type: Number, required: true },
  content: { type: String, required: true },
  link: { type: String, required: false },
  category: { type: String, required: true },
  tags: { type: [String], required: true },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  delete_at: { type: Date, default: undefined },
})

articleSchema.set('toObject', { getters: true })
// 翻页 + 自增ID插件配置
articleSchema.plugin(mongoosePaginate)
articleSchema.plugin(autoIncrement.plugin, {
  model: 'Article',
  field: 'id',
  startAt: 1,
  incrementBy: 1,
})

const Article = db.model<IArticle>('Article', articleSchema)
export default Article
