/**
 *
 * @param {String} tab 一个JQ选择器，tab的触发元素
 * @param {String} tabCont 一个JQ选择器，tab的内容切换区
 * @param {String} klass 当前活动tab的class值，默认为active
 * @param {String} action 触发切换的动作，默认为click
 */
function tab(tab, tabCont, klass, action) {
    let $tab = $(tab);
    let $tabCont = $(tabCont);

    klass = klass || 'active';
    action = action || 'click';

    $tab.each(function (index) {
        $(this).on(action, function () {
            $(this).addClass(klass).siblings().removeClass(klass);
            $tabCont.removeClass(klass).eq(index).addClass(klass);
        });
    });
}

module.exports = tab;
