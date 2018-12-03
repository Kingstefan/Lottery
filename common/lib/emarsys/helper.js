import template from 'lodash/template';

function EmarsysHelper(options) {
    const _options = $.extend(true, EmarsysHelper.defaults, options);

    if (!window.ScarabQueue || !scarab_enable) {
        $(_options.container).remove();
        return;
    }

    this._options = options;
    this.loadTpl(_options);
}

EmarsysHelper.defaults = {
    templatePath: '',
    container: 'body',
    clsProductOutStock: 'g_product-outstock',
    type: 'recommend',
    callback: null,
    fail: null,
    data: {
        pageSize: 6,
        title: '',
        logic: '',
        placeholder: '',
        templateId: ''
    }
};

EmarsysHelper.prototype = {
    constructor: EmarsysHelper,
    loadTpl(options) {
        return $.get(options.templatePath)
        .then(html => {
            const groups = html.split(/-{3,}/g);
            $(options.container).append(template(groups[0])(options.data));
            $(document.body).append(template(groups[1])(options.data));
        })
        .then(() => {
            this.ready(options)
        })
    },
    ready(options) {
        const that = this;
        options.data.logic.split(',').forEach((item, index) => {
            ScarabQueue.push([
                options.type, {
                    logic: item,
                    containerId: 'topic' + index,
                    templateId: options.data.templateId,
                    limit: options.data.pageSize,
                    success: function (data, render) {
                        const context = this;
                        that.respHandler(data, render, context);
                    }
                }
            ]);
        });
    },
    respHandler(data, render, context) {
        const that = this
        const callback = this._options.callback;
        const failCb = this._options.fail;
        const $container = $('#' + context.containerId);

        window.updateEmarsysProduct(data, function (newData) {
            if (!newData.page.products.length) {
                failCb && $.isFunction(failCb) && failCb.call(context, $container, newData)
                $container.parent().remove();
                return false;
            }

            render(newData);

            callback && $.isFunction(callback) && callback.call(context, $container, newData)
        });
    }
};

EmarsysHelper.create = (options) => {
    return new EmarsysHelper(options);
};

window.EmarsysHelper = EmarsysHelper;
export default EmarsysHelper;
