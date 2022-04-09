document.addEventListener('DOMContentLoaded', function () {

    const switchDarkMode = () => {
        const nowMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
        if (nowMode === 'light') {
            activateDarkMode()
            saveToLocal.set('theme', 'dark', 2)
            GLOBAL_CONFIG.Snackbar !== undefined && jyUtils.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
        } else {
            activateLightMode()
            saveToLocal.set('theme', 'light', 2)
            GLOBAL_CONFIG.Snackbar !== undefined && jyUtils.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
        }
        typeof runMermaid === 'function' && window.runMermaid()
    }

    document.getElementById('moon-switch').addEventListener('click', switchDarkMode)

    let mobileMenuOpen = false
    const sidebarFn = {
        open: () => {
            document.body.style.overflow = 'hidden'
            jyUtils.animateIn(document.getElementById('mobile-header'), 'bottom-effect .5s')
            document.getElementById('mobile-header').classList.add('show-mobile-header')
            mobileMenuOpen = true
        },
        close: () => {
            const $body = document.body
            $body.style.overflow = ''
            jyUtils.animateOut(document.getElementById('mobile-header'), 'to_hide .5s')
            document.getElementById('mobile-header').classList.remove('show-mobile-header')
            mobileMenuOpen = false
        }
    }

    /**
     * menu
     * 导航栏点击展开、收缩
     */
    const clickFnOfSubMenu = () => {
        document.querySelectorAll('#mobile-header .name.group').forEach(function (item) {
            item.addEventListener('click', function () {
                this.classList.toggle('mobile-hide')
            })
        })
    }
    const rightSideFn = () => {
        const $goTopBtn = document.getElementById('go-top');
        if ($goTopBtn) {
            $goTopBtn.addEventListener('click', function () {
                jyUtils.scrollToDest(0, 350)
            })
        }
    }
    /**
     * table overflow
     */
    const addTableWrap = () => {
        const $table = document.querySelectorAll('.post-inner :not(.highlight) > table, .post-inner > table')
        if ($table.length) {
            $table.forEach(item => {
                jyUtils.wrap(item, 'div', {class: 'table-wrap'})
            })
        }
    }

    /**
     * tag-hide
     */
    const clickFnOfTagHide = function () {
        const $hideInline = document.querySelectorAll('.post-inner .hide-button')
        if ($hideInline.length) {
            $hideInline.forEach(function (item) {
                item.addEventListener('click', function (e) {
                    const $this = this
                    $this.classList.add('open')
                    const $fjGallery = $this.nextElementSibling.querySelectorAll('.fj-gallery')
                    $fjGallery.length && jyUtils.initJustifiedGallery($fjGallery)
                })
            })
        }
    }

    /**
     * justified-gallery
     */
    const runJustifiedGallery = function (ele) {
        ele.forEach(item => {
            const $imgList = item.querySelectorAll('img')

            $imgList.forEach(i => {
                const dataLazySrc = i.getAttribute('data-lazy-src')
                if (dataLazySrc) i.src = dataLazySrc
                jyUtils.wrap(i, 'div', {class: 'fj-gallery-item'})
            })
        })

        if (window.fjGallery) {
            setTimeout(() => {
                jyUtils.initJustifiedGallery(ele)
            }, 100)
            return
        }

        const newEle = document.createElement('link')
        newEle.rel = 'stylesheet'
        newEle.href = GLOBAL_CONFIG.source.justifiedGallery.css
        document.body.appendChild(newEle)
        getScript(`${GLOBAL_CONFIG.source.justifiedGallery.js}`).then(() => {
            jyUtils.initJustifiedGallery(ele)
        })
    }

    const tabsFn = {
        clickFnOfTabs: function () {
            document.querySelectorAll('.post-inner .tab > button').forEach(function (item) {
                item.addEventListener('click', function (e) {
                    const $this = this
                    const $tabItem = $this.parentNode

                    if (!$tabItem.classList.contains('active')) {
                        const $tabContent = $tabItem.parentNode.nextElementSibling
                        const $siblings = jyUtils.siblings($tabItem, '.active')[0]
                        $siblings && $siblings.classList.remove('active')
                        $tabItem.classList.add('active')
                        const tabId = $this.getAttribute('data-href').replace('#', '')
                        const childList = [...$tabContent.children]
                        childList.forEach(item => {
                            if (item.id === tabId) item.classList.add('active')
                            else item.classList.remove('active')
                        })
                        const $isTabJustifiedGallery = $tabContent.querySelectorAll(`#${tabId} .fj-gallery`)
                        if ($isTabJustifiedGallery.length > 0) {
                            jyUtils.initJustifiedGallery($isTabJustifiedGallery)
                        }
                    }
                })
            })
        },
        backToTop: () => {
            document.querySelectorAll('.post-inner .tabs .tab-to-top').forEach(function (item) {
                item.addEventListener('click', function () {
                    jyUtils.scrollToDest(jyUtils.getEleTop(jyUtils.getParents(this, '.tabs')), 300)
                })
            })
        },
        getEleTop: ele => {
            let actualTop = ele.offsetTop
            let current = ele.offsetParent

            while (current !== null) {
                actualTop += current.offsetTop
                current = current.offsetParent
            }

            return actualTop
        },
        getParents: (elem, selector) => {
            for (; elem && elem !== document; elem = elem.parentNode) {
                if (elem.matches(selector)) return elem
            }
            return null
        }
    }

    const addHighlightTool = function () {
        const highLight = GLOBAL_CONFIG.highlight
        if (!highLight) return

        const isHighlightCopy = highLight.highlightCopy
        const isHighlightLang = highLight.highlightLang
        const isHighlightShrink = GLOBAL_CONFIG.isHighlightShrink
        const highlightHeightLimit = highLight.highlightHeightLimit
        const isShowTool = isHighlightCopy || isHighlightLang || isHighlightShrink !== undefined
        const $figureHighlight = highLight.plugin === 'highlighjs' ? document.querySelectorAll('figure.highlight') : document.querySelectorAll('pre[class*="language-"]')

        if (!((isShowTool || highlightHeightLimit) && $figureHighlight.length)) return

        const isPrismjs = highLight.plugin === 'prismjs'

        let highlightShrinkEle = ''
        let highlightCopyEle = ''
        const highlightShrinkClass = isHighlightShrink === true ? 'closed' : ''

        if (isHighlightShrink !== undefined) {
            highlightShrinkEle = `<i class="fas fa-angle-down expand ${highlightShrinkClass}"></i>`
        }

        if (isHighlightCopy) {
            highlightCopyEle = '<div class="copy-notice"></div><i class="fas fa-paste copy-button"></i>'
        }

        const copy = (text, ctx) => {
            if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
                document.execCommand('copy')
                if (GLOBAL_CONFIG.Snackbar !== undefined) {
                    jyUtils.snackbarShow(GLOBAL_CONFIG.copy.success)
                } else {
                    const prevEle = ctx.previousElementSibling
                    prevEle.innerText = GLOBAL_CONFIG.copy.success
                    prevEle.style.opacity = 1
                    setTimeout(() => {
                        prevEle.style.opacity = 0
                    }, 700)
                }
            } else {
                if (GLOBAL_CONFIG.Snackbar !== undefined) {
                    jyUtils.snackbarShow(GLOBAL_CONFIG.copy.noSupport)
                } else {
                    ctx.previousElementSibling.innerText = GLOBAL_CONFIG.copy.noSupport
                }
            }
        }

        // click events
        const highlightCopyFn = (ele) => {
            const $buttonParent = ele.parentNode
            $buttonParent.classList.add('copy-true')
            const selection = window.getSelection()
            const range = document.createRange()
            if (isPrismjs) range.selectNodeContents($buttonParent.querySelectorAll('pre code')[0])
            else range.selectNodeContents($buttonParent.querySelectorAll('table .code pre')[0])
            selection.removeAllRanges()
            selection.addRange(range)
            const text = selection.toString()
            copy(text, ele.lastChild)
            selection.removeAllRanges()
            $buttonParent.classList.remove('copy-true')
        }

        const highlightShrinkFn = (ele) => {
            const $nextEle = [...ele.parentNode.children].slice(1)
            ele.firstChild.classList.toggle('closed')
            if (jyUtils.isHidden($nextEle[$nextEle.length - 1])) {
                $nextEle.forEach(e => {
                    e.style.display = 'block'
                })
            } else {
                $nextEle.forEach(e => {
                    e.style.display = 'none'
                })
            }
        }

        const highlightToolsFn = function (e) {
            const $target = e.target.classList
            if ($target.contains('expand')) highlightShrinkFn(this)
            else if ($target.contains('copy-button')) highlightCopyFn(this)
        }

        const expandCode = function () {
            this.classList.toggle('expand-done')
        }

        function createEle(lang, item, service) {
            const fragment = document.createDocumentFragment()

            if (isShowTool) {
                const hlTools = document.createElement('div')
                hlTools.className = `highlight-tools ${highlightShrinkClass}`
                hlTools.innerHTML = highlightShrinkEle + lang + highlightCopyEle
                hlTools.addEventListener('click', highlightToolsFn)
                fragment.appendChild(hlTools)
            }

            if (highlightHeightLimit && item.offsetHeight > highlightHeightLimit + 30) {
                const ele = document.createElement('div')
                ele.className = 'code-expand-btn'
                ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
                ele.addEventListener('click', expandCode)
                fragment.appendChild(ele)
            }

            if (service === 'hl') {
                item.insertBefore(fragment, item.firstChild)
            } else {
                item.parentNode.insertBefore(fragment, item)
            }
        }

        if (isHighlightLang) {
            if (isPrismjs) {
                $figureHighlight.forEach(function (item) {
                    const langName = item.getAttribute('data-language') ? item.getAttribute('data-language') : 'Code'
                    const highlightLangEle = `<div class="code-lang">${langName}</div>`
                    jyUtils.wrap(item, 'figure', {class: 'highlight'})
                    createEle(highlightLangEle, item)
                })
            } else {
                $figureHighlight.forEach(function (item) {
                    let langName = item.getAttribute('class').split(' ')[1]
                    if (langName === 'plain' || langName === undefined) langName = 'Code'
                    const highlightLangEle = `<div class="code-lang">${langName}</div>`
                    createEle(highlightLangEle, item, 'hl')
                })
            }
        } else {
            if (isPrismjs) {
                $figureHighlight.forEach(function (item) {
                    jyUtils.wrap(item, 'figure', {class: 'highlight'})
                    createEle('', item)
                })
            } else {
                $figureHighlight.forEach(function (item) {
                    createEle('', item, 'hl')
                })
            }
        }
    }
    /**
     * Lightbox
     */
    const runLightbox = () => {
        jyUtils.loadLightbox(document.querySelectorAll('.post-inner img:not(.no-lightbox)'))
    }

    //postColor
    window.postColor = function () {
        function getPostMainColor(img) {
            function getMainColor(image) {
                return new Promise((resolve, reject) => {
                    try {
                        const canvas = document.createElement("canvas");
                        const img = new Image();
                        img.src = image;
                        img.crossOrigin = '';
                        img.onload = () => {
                            let color = getImageColor(canvas, img);
                            resolve(color);
                        };
                    } catch (e) {
                        reject(e);
                    }
                });
            }

            function getImageColor(canvas, img) {
                const context = canvas.getContext("2d");
                context.drawImage(img, 0, 0);

                let pixelData = context.getImageData(0, 0, canvas.width, canvas.height).data;
                return getCountsArr(pixelData);
            }

            function getCountsArr(pixelData) {
                let colorList = [];
                let rgba = [];
                let rgbaStr = "";
                for (let i = 0; i < pixelData.length; i += 4) {
                    rgba[0] = pixelData[i];
                    rgba[1] = pixelData[i + 1];
                    rgba[2] = pixelData[i + 2];
                    rgba[3] = pixelData[i + 3];

                    if (rgba.indexOf(undefined) !== -1 || pixelData[i + 3] === 0) {
                        continue;
                    }
                    rgbaStr = rgba.join(",");
                    if (rgbaStr in colorList) {
                        ++colorList[rgbaStr];
                    } else {
                        colorList[rgbaStr] = 1;
                    }
                }
                var arr = []
                for (let prop in colorList) {
                    arr.push({
                        color: `rgba(${prop})`
                    });
                }
                // 数组排序
                arr.sort((a, b) => {
                    return b.count - a.count;
                });

                return arr;
            }

            getMainColor(img.getAttribute('data-lazy-src') || img.src).then(function (arr) {
                const color = arr[0].color
                document.body.style.setProperty('--post-info-color', color)
            })
        }

        const post_top_img = document.getElementById('post-info-img');
        if (post_top_img) {
            getPostMainColor(post_top_img);
        }
    }

    /**
     * 滚动处理
     */
    const scrollFn = function () {

        window.tocScrollFn = () => {
            function TocScrollSpy(element, options) {
                this.$ele = $(element);
                this.$win = $(window);
                this.options = $.extend({}, options);
                this.boxs = {};
                this.init();
            }

            TocScrollSpy.prototype = {
                init: function () {
                    this.$a = this.$ele.find(this.options.tocItems);
                    this.getBoxTop();

                    this.$a.on("click", $.proxy(this.clickSwitch, this));

                    this.$win.on("scroll", $.proxy(this.scrolling, this));

                    return this;
                },

                changeToc: function (self, $a) {
                    var current = self.options.current;
                    self.$ele.find("." + current).removeClass(current);
                    $a.addClass(current);
                },

                getBoxTop: function () {
                    var self = this;
                    self.$a.each(function () {
                        let boxId = $(this).attr("href").split('#')[1];
                        let boxTop = $("#" + boxId).offset().top;
                        self.boxs[boxId] = parseInt(boxTop);
                    });
                },

                scrolling: function () {
                    var st = $(window).scrollTop();
                    for (let box in this.boxs) {
                        if (st >= this.boxs[box] - 100) {
                            let $ca = this.$ele.find('a[href="#' + box + '"]');
                            this.changeToc(this, $ca);
                        }
                    }
                },

                clickSwitch: function (e) {
                    let $a = $(e.currentTarget);
                    let self = this;
                    let target = $a.attr("href");
                    if (!$a.hasClass(self.options.current)) {
                        self.scrollTo(target);
                    }

                    e.preventDefault();
                },

                scrollTo: function (target) {
                    let offset = $(target).offset().top;
                    let $el = $('html,body');
                    if (!$el.is(":animated")) {
                        $el.animate({
                            scrollTop: offset - 60
                        }, this.options.speed, 'swing');
                    }
                }
            };

            $.fn.tocScrollSpy = function (options) {
                $.data(new TocScrollSpy(this, options));
            };

            $(".toc").tocScrollSpy({
                tocItems: '.toc-link', current: "current", speed: 400
            });

        }

        function scrollJudge(currentTop) {
            const result = currentTop > initTop
            initTop = currentTop
            return result
        }

        let initTop = 0;
        const $header = document.getElementById('header');
        const $right_side = document.getElementById('right-side');
        window.scrollCollect = function () {
            let oldScrollTop = window.scrollY || document.documentElement.scrollTop;
            let menuTimeout;
            return function () {
                let newScrollTop = window.scrollY || document.documentElement.scrollTop;
                const isDown = scrollJudge(newScrollTop);
                if (newScrollTop > 50) {
                    if (isDown) {
                        if (menuTimeout) {
                            clearTimeout(menuTimeout);
                            menuTimeout = setTimeout(() => {
                                if ($header.classList.contains('header-visible')) $header.classList.remove('header-visible')
                                oldScrollTop = newScrollTop;
                            }, 100)
                        }
                    } else {
                        menuTimeout = setTimeout(() => {
                            if (!$header.classList.contains('header-visible')) $header.classList.add('header-visible')
                            oldScrollTop = newScrollTop;
                        }, 100)
                    }
                    $right_side.classList.add('show-right-side');
                    $header.classList.add('header-bg', 'bg-filter');
                } else {
                    if (newScrollTop === 0) {
                        $header.classList.remove('header-bg', 'bg-filter', 'header-visible');
                    }
                    $right_side.classList.remove('show-right-side');
                }
            }

        }
        window.onscroll = scrollCollect();
    }

    //网站运行时间
    const siteRuntime = function () {
        const $runtimeDay = document.getElementById('site-runtime-day')
        if ($runtimeDay) $runtimeDay.innerHTML = new jyUtils.DiffDate().runDay
        const $runtime = document.getElementById('site-runtime')
        if ($runtime) {
            setInterval(function () {
                $runtime.innerHTML = new jyUtils.DiffDate().runTime;
            }, 1000)
        }
    }
    const lazyloadImg = () => {
        window.lazyLoadInstance = new LazyLoad({
            elements_selector: 'img',
            threshold: 0,
            data_src: 'lazy-src'
        })
    }

    const unRefreshFn = function () {
        window.addEventListener('pjax:complete', () => {
            mobileMenuOpen && sidebarFn.close()
        })
        document.getElementById('close-mobile-menu').addEventListener('click', e => {
            sidebarFn.close()
        })

        clickFnOfSubMenu()
        GLOBAL_CONFIG.islazyload && lazyloadImg()
    }

    window.refreshFn = function () {
        scrollFn();
        tocScrollFn();
        postColor();
        addTableWrap();
        tabsFn.clickFnOfTabs();
        tabsFn.backToTop();
        const $jgEle = document.querySelectorAll('.post-inner .fj-gallery')
        $jgEle.length && runJustifiedGallery($jgEle)
        runLightbox();
        rightSideFn();
        addHighlightTool();
        clickFnOfTagHide();
        siteRuntime();
        document.getElementById('moon-switch').addEventListener('click', switchDarkMode)
        document.getElementById('navbar-toggle').addEventListener('click', () => {
            sidebarFn.open()
        })
    }
    refreshFn();
    unRefreshFn();
})