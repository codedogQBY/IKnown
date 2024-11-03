import OpenAI from 'openai'
const { ZHIPU_API_KEY, ZHIPU_BASE_URL } = require('../config')

type IMessage = {
  role: string
  content: string
}

class OpenAiService {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: ZHIPU_API_KEY,
      baseURL: ZHIPU_BASE_URL,
      timeout: 20 * 1000,
    })
  }

  // 非流式接口
  public async getAnswer(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  ) {
    const res = await this.openai.chat.completions.create({
      model: 'glm-4-flash',
      messages,
      stream: false,
      max_tokens: 4095,
      temperature: 0.5,
      top_p: 1,
    })
    return res.choices[0].message.content
  }

  // 获取文章摘要
  public async getSummary(text: string) {
    // prompt
    const prompt = `
    你是一名善于总结文章的专家，请将文章分析并转成对应的json，格式如下:
    {
    one_word:"一句话概括文章的内容",
    key_points:["文章关键点1","文章关键点2"],
    content_len:number,
    word_counts:number,
    read_time:number,
    curious:["什么是xxx","为啥是xxx"]，
    tags:["标签1","标签2"，"标签3"],
    category:"分类",
    toc:"#xxxxx\\n##xxxxx"
    }
    注意点:
    -one_word为文章一句话概括的内容
    -key_points为文章的关键观点/论点，请控制在10个及以内
    -content_len为文章的长度
    -word_counts为文章的字数
    -read_time为文章大致阅读完成的时间，单位为s
    -curious为相关问题数量控制在3个及以内
    -tags为文章的tag数组，控制在3个及以内
    -category为文章的分类
    -toc为本文摘要，输出markdown字符串
    文章：${text}
    `
    const data = await this.getAnswer([
      {
        role: 'user',
        content: text,
      },
    ])
    return data
  }
}
