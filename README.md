QQPhoto
=========

<blockquote>
	<p>更新说明：==== v1.1.0 ==== 2014-06-29</p>
	<ol>
		<li>增加键盘左右方向键的支持，增强用户体验</li>
		<li>增加缩略小图图片的异步加载，默认使用1px.gif替代</li>
		<li>留言发送数据格式换POST发送</li>
		<li>PS:纯属练手，相册性能有问题！！！(功底太差)</li>
	</ol>
</blockquote>

<p>QQPhoto 是一个仿QQ空间相册显示功能插件, 依赖jQuery库</p>
<p><strong>Demo 预览：</strong>http://demo.webjyh.com/QQPhoto/</p>

只是测试页面，所有数据全都重复的。留言数据也是如此，只保留当前发送的内容，关闭则全部重置。如在项目开发中，里面许多接口需要和服务端配合。
请使用PHP环境来测试，本页面采用PHP环境测试

1.图片相册功能
2.预加载上一张，下一张图片
3.留言提交。
4.兼容了 万恶的 IE6, 不过不建议使用

如何不兼容 IE6 可以找到 QQPhoto.js 文件中 以下代码<br />
<code>
	this.IE6 = !-[1,]&&!window.XMLHttpRequest;
</code>
<p>修改成如下：</p>
<code>
	this.IE6 = false;
</code>

如有错误或Bug请在我博客留言说明。地址：http://webjyh.com
