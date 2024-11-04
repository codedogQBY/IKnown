import { WechatyBuilder, Message, types } from 'wechaty'
const qrTerm = require('qrcode-terminal')
const convert = require('xml-js')
import urlParseService from '../service/urlParseService'
import openAiService from '../service/openAiService'

const bot = WechatyBuilder.build({
  name: 'IKnown',
})

// 从json中提取出信息，
const extractInfo = (json: string) => {
  try {
    const obj = JSON.parse(json) || {}
    const msg = obj.msg || {}
    const { title = {}, url = {} } = msg.appmsg || {}
    const { _text: titleText } = title
    const { _text: urlText } = url
    return {
      title: titleText,
      url: urlText,
    }
  } catch (e) {
    console.log(e)
    return {}
  }
}

bot
  .on('scan', (qrcode: string) => {
    qrTerm.generate(qrcode, {
      small: true,
    })
  })
  .on('login', (user: any) => {
    console.log(`User ${user} logged in`)
  })
  .on('message', async (message: Message) => {
    const room = message.room()
    const content = message.text()
    const contact = message.talker()
    if (!room) {
      if (!message.self()) {
        console.log(message.type())
        if (message.type() === types.Message.Text) {
          // 是http或者https链接
          if (/^https?:\/\//.test(content)) {
            try {
              const {
                title,
                author,
                content: article,
                link,
              } = await urlParseService.parseUrl(content)
              const summary = await openAiService.getSummary(article)
              await contact.say(summary || '解析失败')
            } catch (e) {
              console.log(e)
            }
          }
        }
        if (message.type() === types.Message.Url) {
          try {
            const json = convert.xml2json(content, { compact: true })
            const { url, title } = extractInfo(json)
            if (url) {
              const { title, author, content, link } =
                await urlParseService.parseUrl(url)
              const summary = await openAiService.getSummary(content)
              await contact.say(summary || '解析失败')
            }
          } catch (e) {
            console.log(e)
          }
        }
      }
    }
  })

export default bot
