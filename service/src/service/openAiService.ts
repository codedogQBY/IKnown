const { ZHIPU_API_KEY, ZHIPU_BASE_URL } = require('../config')
import axios from 'axios'

type IMessage = {
  role: string
  content: string
}

class OpenAiService {

  // 非流式接口
  public async getAnswer (
    messages: IMessage[]
  ) {
    const res = await axios.post(
      `${ZHIPU_BASE_URL}`,
      {
        model: "glm-4-flash",
        max_tokens: 4095,
        messages
      },
      {
        headers: {
          'Authorization': `Bearer ${ZHIPU_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return res.data.choices[0].message.content
  }

  // 获取文章摘要
  public async getSummary (text: string) {
    // prompt
    const prompt = `
    你是一名擅长总结和分析文章的专家。请对以下文章进行深度分析，并生成对应的 JSON 格式的摘要，格式如下：
{
    "one_word": "一句话概括文章的核心内容",
    "key_points": ["关键观点1", "关键观点2"],
    "content_len": "文章长度（以段落数或其他合适方式表示）",
    "word_counts": "文章总字数",
    "read_time": "阅读时间（以分钟表示）",
    "curious": ["相关问题1", "相关问题2"],
    "tags": ["标签1", "标签2"],
    "category": "文章分类",
    "toc": "# 文章大纲 本文讲述了xxxxx\\n## 概述\\n## 第一段 介绍了xxxx\\n### 主要内容1\\n主要内容2xxx\\n## 第二段\\n### 主要内容\\n## 第三段\\n### 主要内容\\n## 第四段\\n### 主要内容\\n## 第五段\\n### 主要内容"
}
注意：

one_word：用一句话概括文章的核心内容。
key_points：列出文章的主要观点，控制在10个以内。
content_len：以合适的方式表示文章的长度。
word_counts：准确计算文章的字数。
read_time：根据字数估算大致阅读时间（可以假设每分钟阅读300字）。
curious：提供与文章相关的有趣问题，数量控制在3个及以内。
tags：列出文章相关的标签，控制在3个及以内。
category：确定文章的分类。
toc：需要逐段分析文章内容，并生成对应的章节标题和简要描述。每一段要突出其主要内容，确保涵盖文章的整体结构和核心观点。确保描述言简意赅，便于读者快速理解每一部分的主题。
文章：${text}
    `
    const data = await this.getAnswer([
      {
        role: 'user',
        content: prompt
      }
    ])
    return data
  }
}

export default new OpenAiService()
