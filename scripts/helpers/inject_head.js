'use strict'

hexo.extend.helper.register('inject_head_js', function () {
    const {darkmode, sidebar} = this.theme

    const localStore = `
    win.saveToLocal = {
      set: function setWithExpiry(key, value, ttl) {
        if (ttl === 0) return
        const now = new Date()
        const expiryDay = ttl * 86400000
        const item = {
          value: value,
          expiry: now.getTime() + expiryDay,
        }
        localStorage.setItem(key, JSON.stringify(item))
      },

      get: function getWithExpiry(key) {
        const itemStr = localStorage.getItem(key)

        if (!itemStr) {
          return undefined
        }
        const item = JSON.parse(itemStr)
        const now = new Date()

        if (now.getTime() > item.expiry) {
          localStorage.removeItem(key)
          return undefined
        }
        return item.value
      }
    }
  `

    const getScript = `
    win.getScript = url => new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.async = true
      script.onerror = reject
      script.onload = script.onreadystatechange = function() {
        const loadState = this.readyState
        if (loadState && loadState !== 'loaded' && loadState !== 'complete') return
        script.onload = script.onreadystatechange = null
        resolve()
      }
      document.head.appendChild(script)
    })
  `
    let darkmodeJs = ''
    if (darkmode.enable) {
        darkmodeJs = `
      win.activateDarkMode = function () {
        document.documentElement.setAttribute('data-theme', 'dark')
        if (document.querySelector('meta[name="theme-color"]') !== null) {
          document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0d0d0d')
        }
      }
      win.activateLightMode = function () {
        document.documentElement.setAttribute('data-theme', 'light')
        if (document.querySelector('meta[name="theme-color"]') !== null) {
          document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff')
        }
      }
      const t = saveToLocal.get('theme')
    `

        const autoChangeMode = darkmode.autoChangeMode

        if (autoChangeMode === 1) {
            darkmodeJs += `
          const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
          const isLightMode = window.matchMedia('(prefers-color-scheme: light)').matches
          const isNotSpecified = window.matchMedia('(prefers-color-scheme: no-preference)').matches
          const hasNoSupport = !isDarkMode && !isLightMode && !isNotSpecified

          if (t === undefined) {
            if (isLightMode) activateLightMode()
            else if (isDarkMode) activateDarkMode()
            else if (isNotSpecified || hasNoSupport) {
              const now = new Date()
              const hour = now.getHours()
              const isNight = hour <= 6 || hour >= 18
              isNight ? activateDarkMode() : activateLightMode()
            }
            window.matchMedia('(prefers-color-scheme: dark)').addListener(function (e) {
              if (saveToLocal.get('theme') === undefined) {
                e.matches ? activateDarkMode() : activateLightMode()
              }
            })
          } else if (t === 'light') activateLightMode()
          else activateDarkMode()
        `
        } else if (autoChangeMode === 2) {
            darkmodeJs += `
          const now = new Date()
          const hour = now.getHours()
          const isNight = hour <= 6 || hour >= 18
          if (t === undefined) isNight ? activateDarkMode() : activateLightMode()
          else if (t === 'light') activateLightMode()
          else activateDarkMode()
        `
        } else {
            darkmodeJs += `
          if (t === 'dark') activateDarkMode()
          else if (t === 'light') activateLightMode()
        `
        }
    }

    return `<script>(win=>{${localStore + getScript + darkmodeJs}})(window)</script>`
})
