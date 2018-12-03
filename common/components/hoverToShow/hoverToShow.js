/**
 * 处理悬浮展示的函数
 * @param {String} hoverElem 一个JQ选择器，鼠标悬停的元素
 * @param {String} toggleElem 一个JQ选择器，要显示和隐藏的元素
 */
function hoverToShow(hoverElem, toggleElem) {
    let timer;
    let $hoverElem = $(hoverElem);
    let $toggleElem = $(toggleElem);

    $hoverElem.hover(function () {
        clearTimeout(timer);
        $toggleElem.show();
    }, function () {
        timer = setTimeout(function () {
            $toggleElem.hide();
        }, 200);
    });
}

module.exports = hoverToShow;
