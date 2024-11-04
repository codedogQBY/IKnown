const extract = require('we-extract').extract
import { IArticle } from '@/model/article'
const turndown = require('turndown')
const cheerio = require('cheerio')
import axios from 'axios'
type SUPPORTED_SITES = 'juejin' | 'cnblogs' | 'wechat' | 'segmentfault'

type IPickArticle = Pick<IArticle, 'title' | 'author' | 'content' | 'link'>
class UrlParseService {
  private allSites: string[]
  private articleSites: Record<SUPPORTED_SITES, string[]>
  constructor () {
    // 文章站点map、目前支持简书、掘金、博客园、微信公众号、知乎专栏、思否，后续会增加更多站点
    const articleSites = {
      juejin: ['juejin.cn/post/'],
      cnblogs: ['www.cnblogs.com'],
      wechat: ['mp.weixin.qq.com'],
      segmentfault: ['segmentfault.com/a/']
    }

    const allSites = Object.values(articleSites).reduce(
      (pre, cur) => pre.concat(cur),
      []
    )
    this.allSites = allSites
    this.articleSites = articleSites
  }

  public async parseUrl (url: string): Promise<IPickArticle> {
    // 策略模式，根据url判断是哪个站点，然后调用对应的解析函数
    const site = this.getSite(url)
    const siteMap: Record<string, (url: string) => Promise<IPickArticle>> = {
      juejin: this.juejinParseUrl,
      cnblogs: this.cnblogsParseUrl,
      wechat: this.wechatParseUrl,
      segmentfault: this.segmentfaultParseUrl
    }
    if (site) {
      return await siteMap[site](url)
    } else {
      return {
        title: '',
        content: '',
        link: url,
        author: ''
      }
    }
  }
  // 根据url解析出出是哪个站点
  private getSite (url: string): SUPPORTED_SITES | null {
    // tslint:disable-next-line:forin
    for (const key in this.articleSites) {
      const sites = this.articleSites[key as SUPPORTED_SITES]
      for (const site of sites) {
        if (url.includes(site)) {
          return key as SUPPORTED_SITES
        }
      }
    }
    // tslint:disable-next-line:no-null-keyword
    return null
  }

  // 掘金解析函数
  private async juejinParseUrl (url: string): Promise<IPickArticle> {
    // 链接是这样的 https://juejin.cn/post/7379158120102035507
    const article_id = url.split('/').pop()?.split('?')[0]
    console.log(article_id)
    const client_type = 2608
    const result = await axios.post(
      'https://api.juejin.cn/content_api/v1/article/detail',
      {
        article_id,
        client_type
      },
      {
        headers: {
          'User-Agent': 'juejin/5.12.0 (iPhone; iOS 13.3; Scale/3.00)',
          'Accept': '*/*',
          'Host': 'api.juejin.cn',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json'
        }
      }
    )
    const { data = {} } = result.data
    const { article_info = {}, author_user_info = {} } = data
    const { title = '', mark_content = '' } = article_info
    const { user_name = '' } = author_user_info
    return {
      title,
      content: mark_content,
      link: url,
      author: user_name
    }
  }

  // 博客园解析函数
  private async cnblogsParseUrl (url: string): Promise<IPickArticle> {
    const result = await axios.get(url)
    const html = result.data
    const $ = cheerio.load(html)
    const title = $('title').text()
    const content = turndown().turndown($('#cnblogs_post_body').html())
    const author = $('#profile_block a').text()
    return {
      title,
      content,
      link: url,
      author
    }
  }

  // 思否解析函数
  private async segmentfaultParseUrl (url: string): Promise<IPickArticle> {
    const result = await axios.get(url)
    const html = result.data
    const $ = cheerio.load(html)
    const title = $('title').text()
    const content = turndown().turndown($('.article').html())
    const author = $('.author a').text()
    return {
      title,
      author,
      content,
      link: url
    }
  }

  // 微信解析函数
  private async wechatParseUrl (url: string): Promise<IPickArticle> {
    const { data = {} } = await extract(url)
    const {
      account_name: author = '',
      msg_title: title = '',
      msg_content: content = '',
      msg_link: link = ''
    } = data
    return {
      title,
      author,
      content,
      link
    }
  }
}

export default new UrlParseService()
