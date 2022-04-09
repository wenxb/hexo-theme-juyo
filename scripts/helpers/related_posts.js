'use strict'

hexo.extend.helper.register('related_posts', function (currentPost, allPosts) {
    let relatedPosts = []
    const theme = hexo.theme.config
    currentPost.tags.forEach(function (tag) {
        allPosts.forEach(function (post) {
            if (isRelatedTag(tag.name, post.tags)) {
                const relatedPost = {
                    title: post.title,
                    path: post.path,
                    cover: post.cover || theme.default_post,
                    weight: 1
                }

                const index = findItem(relatedPosts, 'path', post.path)

                if (index !== -1) {
                    relatedPosts[index].weight += 1
                } else {
                    if (currentPost.path !== post.path) {
                        relatedPosts.push(relatedPost)
                    }
                }
            }
        })
    })
    if (relatedPosts.length === 0) {
        return ''
    }
    let result = ''
    const limitNum = theme.related_post.limit || 6

    relatedPosts = relatedPosts.sort(compare('weight'))

    if (relatedPosts.length > 0) {
        for (let i = 0; i < Math.min(relatedPosts.length, limitNum); i++) {
            result += `<div class="related-posts-item"><a href="${this.url_for(relatedPosts[i].path)}" title="${relatedPosts[i].title}">`
            result += `<img class="cover" src="${this.url_for(relatedPosts[i].cover)}" alt="cover">`
            result += `<div class="mask"></div>`
            result += `<div class="title">${relatedPosts[i].title}</div>`
            result += '</a></div>'
        }
        return result
    }

    function isRelatedTag (currentTag, allTags) {
        let result = false
        allTags.forEach(function (tag) {
            if (currentTag === tag.name) {
                result = true
            }
        })
        return result
    }

    function findItem (arrayToSearch, attr, val) {
        for (let i = 0; i < arrayToSearch.length; i++) {
            if (arrayToSearch[i][attr] === val) {
                return i
            }
        }
        return -1
    }

    function compare (attr) {
        return function (a, b) {
            const val1 = a[attr]
            const val2 = b[attr]
            return val2 - val1
        }
    }
})