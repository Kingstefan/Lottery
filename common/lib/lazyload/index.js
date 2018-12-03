import './lazyload'

const LAZYLOAD_VISIBLE_CLASS = 'fn-lazyload-visible'
const DEFAULT_LAZYLOAD_OPTION = {
    data_attribute: 'src', // 使用 data-src 替换默认的 data-original
    effect: 'fadeIn', // 默认 动画效果
    effect_params: [1000], // 默认动画参数
    vertical_only: true, // 仅使用垂直方向检测，解决未正确设置容器宽度时未正确显示的问题，并提升性能
    placeholder_real_img: '' // 禁用 IE6/7 的 placeholder，默认资源为外链的百度图片
}

/*
 * 改变默认配置和行为
 * 解除其全局挂载特性
 * 由 global 确保至少加载过一次
 */

const lazyloadRef = $.fn.lazyload
delete $.fn.lazyload

function singleLazyload($ele, option) {
    const fateOption = $.extend({}, DEFAULT_LAZYLOAD_OPTION, option)
    if ($ele.is('img')) {
        fateOption.appear = function () {
            $ele.toggleClass(LAZYLOAD_VISIBLE_CLASS, true)
        }
    } else {
        // 背景图，提供 data-src 绕过 lazyload 检查
        if (!$ele.data('src')) {
            $ele.attr('data-src', '')
        }
        fateOption.appear = function () {
            $ele.toggleClass(LAZYLOAD_VISIBLE_CLASS, true)
            // 存在背景图时，提取背景图地址，并转由 lazyload 加载（事实上图片已开始加载，主要是复用 lazyload 动画和行为）
            const imgUrl = $ele.css('background-image')
            if (imgUrl && imgUrl.startsWith('url(')) {
                const realImgUrl = imgUrl.replace(/^url\(['"]?/, '').replace(/['"]?\)/, '')
                $ele.css('background-image', 'none')
                $ele.attr('data-src', realImgUrl)
                // 重新触发 lazyload，以便使用 lazyload 效果
                lazyloadRef.call($ele, DEFAULT_LAZYLOAD_OPTION)
            }
        }
    }
    // 执行原 lazyload
    return lazyloadRef.call($ele, fateOption)
}

const lazyload = function lazyload($ele, option) {
    return $ele.each(function () {
        singleLazyload($(this), option)
    })
}

$.fn.lazyload = function (option) {
    return lazyload(this, option)
}

export default lazyload
