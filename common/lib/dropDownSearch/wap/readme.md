## dropdown-search

### 数据源

因为目前需要兼容之前的使用方式，和只录入一份数据的考虑，暂时沿用之前复制php模板的方式。下面两种方式二选一

1、数据源从php模板读入，直接拷贝或者存储为静态块从静态块读取

```
  <div class="search-box js-old-search-box">
  	<?php
  	    if(Mage::getStoreConfig("azoya_search/project/enabled")){
  	        $search = 'search/result';
  	    }else{
  	        $search = 'catalogsearch/result';
  	    }
  	?>
      <form action="<?php echo $this->getBaseUrl().$search; ?>" method="GET" class="search-form clearfix js-top-search-form">
          <div class="keyword-ctn">
              <?php echo $this->getLayout()->createBlock('cms/block')->setBlockId('mb-index-search')->toHtml() ?>
              <button type="submit" class="btn-submit"><i class="iconfont icon-search"></i></button>

          </div>
          <a href="javascript:history.go(-1);" class="back-home">取消</a>
      </form>
      <div class="hot-search" id="hot-search">
      	<h1 class="hot-search-title">热门搜索</h1>
      	<div class="hot-search-word">
      		<?php echo $this->getLayout()->createBlock("cms/block")->setBlockId("mb-hot-search")->toHtml(); ?>
      	</div>
      </div>
      <div class="search-list" id="search-list"></div>
  </div>

```

2、 读取magento配置的json对象，对象名称为SEARCH_HISTORY

```
  window.SEARCH_HISTORY = {
    action: '/search/result/',
    inputPlaceHolder: '请输入商品名称',
    hotSearch: [
      {
        value: '皇后水',
        href: '/caudalie.html',
        isCommUse: true
      },
      {
        value: '爱他美',
        href: '/aptamil.html',
        isCommUse: false
      }
    ]
  }
```

! 搜索关键词自动补全需要后台配置 SEARCH_TIP_API

### class钩子

目前预留两个cls钩子，分别是js-cmp-btn-search， js-cmp-search-input-box

- js-cmp-btn-search， 适用于一个按钮，点击会直接打开搜索下拉

- js-cmp-search-input-box， 适用于一个div块或者一个input输入框。如果div里某个元素点击时不打开搜索下拉需要对改元素添加js-cmp-ignore

### 如何使用

将打包出来的lib.js放到jquery的下面引入，在页面上添加相应的class钩子，配置对应的数据源即可。

列表服务化h5项目，lib.js每次更新后手动复制到static目录，打包后会自动拷贝到cecs目录下。

*`jquery 1.8.3` 测试正常，在`1.7.2`上面因为使用了`Deferred`早期实现不规范，不能正常使用，建议`jquery 1.8.3`及以上版本*

*目前只适用于h5手机端，pc端暂时没有考虑在内*

### issue

* ios下弹出输入框时候页面可以滑动

* handlebars each渲染list的时候渲染结果和实际不符合， 原因待查明

## contact me

QQ: 534458361
