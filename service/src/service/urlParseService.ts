const extract = require('we-extract').extract
import { IArticle } from '@/model/article'
type SUPPORTED_SITES =
  | 'jianshu'
  | 'juejin'
  | 'cnblogs'
  | 'wechat'
  | 'zhihu'
  | 'segmentfault'

type IPickArticle = Pick<IArticle, 'title' | 'author' | 'content' | 'link'>
class UrlParseService {
  private allSites: string[]
  private articleSites: Record<SUPPORTED_SITES, string[]>
  constructor () {
    // 文章站点map、目前支持简书、掘金、博客园、微信公众号、知乎专栏、思否，后续会增加更多站点
    const articleSites = {
      jianshu: ['www.jianshu.com/p/'],
      juejin: ['juejin.cn/post/'],
      cnblogs: ['www.cnblogs.com/kagol/p/'],
      wechat: ['mp.weixin.qq.com'],
      zhihu: [
        'zhuanlan.zhihu.com/p/',
        'www.zhihu.com/question/516551830/answer/'
      ],
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
    const siteMap: Record<string, (url:string)=>Promise<IPickArticle>> = {
      jianshu: this.jianshuParseUrl,
      juejin: this.juejinParseUrl,
      cnblogs: this.cnblogsParseUrl,
      wechat: this.wechatParseUrl,
      zhihu: this.zhihuParseUrl,
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

  // 简书解析函数
  private async jianshuParseUrl (url: string): Promise<IPickArticle> {
    return {
      title: '',
      author: '',
      content: '',
      link: url
    }
  }

  // 掘金解析函数
  private async juejinParseUrl (url: string): Promise<IPickArticle> {
    return {
      title: '',
      author: '',
      content: '',
      link: url
    }
  }

  // 博客园解析函数
  private async cnblogsParseUrl (url: string): Promise<IPickArticle> {
    return {
      title: '',
      author: '',
      content: '',
      link: url
    }
  }

  // 知乎解析函数
  private async zhihuParseUrl (url: string): Promise<IPickArticle> {
    return {
      title: '',
      author: '',
      content: '',
      link: url
    }
  }

  // 思否解析函数
  private async segmentfaultParseUrl (url: string): Promise<IPickArticle> {
    return {
      title: '',
      author: '',
      content: '',
      link: url
    }
  }


  // 微信解析函数
  private async wechatParseUrl (url: string): Promise<IPickArticle> {
    const { data = {} } = extract(url)
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
