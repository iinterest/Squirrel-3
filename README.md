# Squirrle 3

## 一、简介

Squirrle 是一款移动 Web 前端开发框架，提供简单、快速的 Web 开发体验。

## 二、特性

* 基于 HTML5，应用了 HTML5 的多种特性，如 CSS3、离线应用、本地存储等。
* 多操作系统支持，支持 Android、iOS 系统，可扩展支持 Windows Phone、Firefox OS 等系统。
* 专为手持移动设备打造，能适应不同屏幕尺寸，针对不同尺寸屏幕做了排版优化。
* 提供定制工具，可以根据实际需要灵活的定制内容，按需最小化加载组件及插件。
* 遵循 CMD 规范，借助 Sea.js 可以按需最小化加载组件及插件。
* 基于 LESS 开发，能够方便的创建结构良好、高扩展性、高可维护性的代码。
* 框架遵循 MIT 协议，无论公司还是个人，都可以免费自由使用。

## 三、使用指南

### 1、安装

Squirrel 支持两种安装方式：

1. 直接下载 Squirrle 3 代码包  
	代码包分为『开发版』和『压缩版』；『开发版』包含完整的项目结构与源码；而『压缩版』则是更适合用于实际生产的代码，下面是『压缩版』目录结构：

		Squirrel/
  			├── css/
  			│   ├── squirrel.css
  			│   ├── squirrel.min.css
  			├── js/
  			│   ├── squirrel.js
  			│   ├── squirrel.min.js
  			├── fonts/
    		│   ├── sq-fontello.ttf
    		│   ├── sq-fontello.woff
    		└── index.html

2. 使用 NPM 安装 Squirrle 3 工程套件  
	Squirrle 3 工程套件是一套完整移动 Web 开发方案，它集成了 Squirrel 框架代码并提供自动化构建工具，按照约定的目录进行开发，需要自行配置，套件目录结构：


		Squirrel-pt/
  			├── dist/
  			│   ├── css/
  			│   │	├── squirrel.min.css
  			│   │	├── project-name.min.css
  			│   ├── js/
  			│   │	├── squirrel.min.js
  			│   │	├── project-name.min.js
			│   ├── images/	
			│   ├── fonts/
			│   │	├── sq-fontello.ttf
  			│   │	├── sq-fontello.woff
  			├── src/  (源码)
  			│   ├── sq-less/ (框架源码)
  			│   ├── sq-js/   (框架源码)
  			│   ├── less/    (项目源码)
  			│   ├── js/      (项目源码)
  			├── libs/ (依赖库)
  			│   ├── zepto.min.js
  			├── .jshintrc
  			├── Gruntfile.js
  			├── package.json
    		└── index.html

	
	NPM 安装命令：
	
		npm install squirrel-pt
	
	进入 squirrel-pt 目录，下载完成后需要对 package.json 进行配置。

### 2、使用

Squirrel 集成了许多常用的组件及插件，只需要简单的几步就可以快速的使用集成的组件及插件构建一个应用：

1. 打开并编辑安装目录中 index.html 文件；
2. 在框架文档中拷贝所需组件代码片段或者插件的实例化方法；
3. 加入自定义样式和 Javascript 脚本。

## 三、贡献力量

Squirrel 3 是遵循 MIT 协议的开源项目，代码寄托于 [GitHub](https://github.com/iinterest/Squirrel-3)，如果感兴趣请加入我们贡献您的力量，您可以：

1. 希望您能反馈任何有关体验方面的意见和建议至 [Github issues](https://github.com/iinterest/Squirrel-3/issues)「体验」，您可以提出问题或改进建议，甚至提出新的功能需求。
2. 如果使用中发现 BUG，请提交至 [Github issues](https://github.com/iinterest/Squirrel-3/issues)「BUG」，同时也请报告您的使用版本、环境，我们会尽快确认、修复。
3. 欢迎您为 Squirrel 贡献高实用性的功能插件，以方便其他使用者。开始之前请先阅读插件开发流程。
4. 如果您制作了一款基于 Squirrel 的主题并且符合主题的开发规范，我们非常欢迎您将它提交至主题库。
5. DPL 组件与业务结合紧密，具备高质量且完整的交互体验，如果您为您的项目开发了类似的组件，欢迎提交至设计模式库。

