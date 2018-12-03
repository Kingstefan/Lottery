
//推送"setCustomerId"和"cart"command
window.emarsysHeaderCommand = function (goCommand) {
    jQuery.ajax({
        url: '/o_exp/index/emarsys',
        type: 'post',
        dataType: 'json',
        success: function (data) {
            if (data.setEmail !== '') {
                ScarabQueue.push(['setCustomerId', data.setCustomerId]);
            }
            ScarabQueue.push(['cart', data.carts]);
            //最后执行"go"command
            goCommand();
        }
    });
};

//异步获取价格库存同步更新到emarsys推荐商品数据
window.updateEmarsysProduct = function (data, callback) {
    var emarsysProducts = data.page.products,
        sku;

    if (!emarsysProducts.length) return false;

    sku = emarsysProducts.map(item => item.id).join(',');

    // fix emarsys price
    $.ajax({
        url: '/queryapi/fetch',
        type: 'get',
        data: {
            sku: sku,
            includes: 'merchant_sku,final_price,price,status,merchant_currency,reference_price,reference_currency,sales'
        },
        dataType: 'json'
    })
    .then(function (resp) {
        var productsWithPriceNew = resp.results || resp.data || [];

        for (var i = 0; i < emarsysProducts.length; i++) {
            var eSku = emarsysProducts[i].id;
            for (var j = 0; j < productsWithPriceNew.length; j++) {
                var mSku = productsWithPriceNew[j].merchant_sku || productsWithPriceNew[j].sku_full;
                if (mSku === eSku) {
                    emarsysProducts[i].price = productsWithPriceNew[j].final_price;
                    emarsysProducts[i].msrp = productsWithPriceNew[j].price;
                    emarsysProducts[i].rmb_price = productsWithPriceNew[j].reference_price;
                    emarsysProducts[i].sales = (100 - productsWithPriceNew[j].sales) / 10;
                    emarsysProducts[i].is_in_stock = (+productsWithPriceNew[j].status || +productsWithPriceNew[j].is_stock) === 1 ? 1 : 0;
                    emarsysProducts[i].merchant_currency = productsWithPriceNew[j].merchant_currency;
                    break;
                }
            }
        }

        var inStock = false;

        for (var i = 0; i < emarsysProducts.length; i++) {
            if (emarsysProducts[i].is_in_stock) {
                inStock = true;
                break;
            }
        }

        data.page.products = inStock ? emarsysProducts : [];

        callback(data);
    });
};


var index=0;

$('.main').on('click','.J_change_viewpoint',function() {
    var _this=$(this);
    if(_this.attr('data-disable')=='disable'){
        return false;
    };
    _this.attr('data-disable','disable');
    var parent=$(this).parents('.J_emarsys'),
        emarsys_page=parent.find('.J_emarsys_page');
    index++;
    if(index>=emarsys_page.length){
        index=0;
        emarsys_page.eq((emarsys_page.length-1)).fadeOut(200);
    };
    emarsys_page.eq(Math.abs(index-1)).fadeOut(200);
    var lazy_emarsys=emarsys_page.eq(index).find('.lazy_emarsys');
    lazy_emarsys.each(function(i) {
        var src=lazy_emarsys.eq(i).attr('data-original');
        lazy_emarsys.eq(i).attr('src',src);
    });
    setTimeout(function(){
        emarsys_page.eq(index).fadeIn(500);
    },300);
    setTimeout(function(){
        _this.removeAttr('data-disable');
    },800)
});

//add by yuands
var turn_left=false;
$('body').on("click",'.J_change_viewpoint_mb',function(){
    var _this=$(this);
    if(_this.attr('data-disable')=='disable'){
        return false;
    };
    _this.attr('data-disable','disable');
    var parent=$(this).parents('.m-emarsys'),
        emarsys_page_mb=parent.find('.index-pro-box');
    if(!turn_left){
        emarsys_page_mb[0].style.transform="translateX(-100%)"
        turn_left=true;
    }else{
        emarsys_page_mb[0].style.transform="translateX(0)";
        turn_left=false;
    }
    setTimeout(function(){
        _this.removeAttr('data-disable');
    },800)
})
