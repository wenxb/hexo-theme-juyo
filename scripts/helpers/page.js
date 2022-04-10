'use strict'
const { stripHTML, escapeHTML, prettyUrls } = require('hexo-util')

hexo.extend.helper.register('page_description', function () {

    const { config, page } = this
    let description = page.description || page.content || page.title || config.description

    if (description) {
        description = escapeHTML(stripHTML(description).substring(0, 150)
            .trim()
        ).replace(/\n/g, ' ')
        return description
    }
})

hexo.extend.helper.register('injectHtml', function (data) {
    let result = ''
    if (!data) return ''
    for (let i = 0; i < data.length; i++) {
        result += data[i]
    }
    return result
})

hexo.extend.helper.register('authority', function (url = null) {
    return prettyUrls(url || this.url, { trailing_index: false, trailing_html: false })
})

hexo.extend.helper.register('findArchivesTitle', function (menu) {
    const defaultTitle = this._p('page.archives')
    if (!menu) return defaultTitle

    const loop = (m) => {
        for (const key in m) {
            if (typeof m[key] === 'object') {
                loop(m[key])
            }

            if (/\/archives\//.test(m[key])) {
                return key
            }
        }
    }

    return loop(menu) || defaultTitle
})