import { db } from '../mongodb'
import autoIncrement = require('mongoose-auto-increment')
import mongoosePaginate = require('mongoose-paginate')
import { Document } from 'mongoose'
import { IArticle } from '@/model/article'

autoIncrement.initialize(db.connection)

type TQuestions = {
  question: string
  answer: string
}

export interface ISummary extends Document {
  article: IArticle
  one_word: string
  key_points: string[]
  questions: TQuestions[]
  curious: string[]
  toc: string
  post_url: string
  create_at: Date
  update_at: Date
  delete_at: Date
}

const summarySchema = new db.Schema({
  article: { type: [Object], required: true },
  one_word: { type: String, required: true },
  key_points: { type: [String], required: true },
  questions: { type: [Object], required: true },
  curious: { type: [String], required: true },
  toc: { type: String, required: true },
  post_url: { type: String, required: true },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  delete_at: { type: Date, default: undefined },
})

summarySchema.set('toObject', { getters: true })
// 翻页 + 自增ID插件配置
summarySchema.plugin(mongoosePaginate)
summarySchema.plugin(autoIncrement.plugin, {
  model: 'Summary',
  field: 'id',
  startAt: 1,
  incrementBy: 1,
})

const Summary = db.model<ISummary>('Summary', summarySchema)
export default Summary
