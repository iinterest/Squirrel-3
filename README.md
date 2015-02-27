# Squirrle 3

## 一、简介

Squirrle 是一款轻量级的移动 Web 前端开发框架，提供简单、快速的 Web 开发体验。

## 二、特性

* 专为移动终端设计，支持 Android、iOS、WP 操作系统。
* 适应各种屏幕尺寸、分辨率的移动终端，针对触摸操作体验进行了优化。
* 遵循 MIT 协议，无论公司还是个人，都可以免费、自由使用。
* 提供丰富的样式及交互组件，能帮助您轻松构建 Web 应用。
* 采用 LESS 技术、CMD 规范、jQuery 插件开发模式，扩展方便。
* 提供定制工具，可以根据实际需要灵活的定制框架。

## 三、使用指南

### 1、安装

Squirrel 支持两种安装方式：

1. 直接下载 Squirrle 3 [代码包](https://github.com/iinterest/Squirrel-3/releases)
2. 或者使用 npm 安装：

		npm install squirrel-pt

安装完成或压缩下载的安装包之后，可看到以下目录结构：

		squirrel/
			|
			├── css/
			│ ├── squirrel.min.css
			│ └── app.css
			├── fonts/
			│ ├── fontawesome-webfont.ttf
			│ └── fontawesome-webfont.woff
			├── images/
			├── js/
			│ ├── jquery.min.js
			│ ├── jquery.min.map
			│ ├── squirrel.min.js
			│ └── app.js
			├── maps/
			│ ├── squirrel.min.css.map
			│ └── squirrel.min.js.map
			└── index.html

### 2、使用

Squirrel 安装包内包含编译并压缩好的 squirrel.min.css、squirrel.min.js 文件，以及最新的 jQuery 库和 Awesome 的图标字体，同时还提供 Javascript 和 CSS 的源码映射表（.map 文件）；除此之外还提供简单的模板样式文件（Boilerplate）您可以：

* 以index.html为样板编写 HTML；
* 在app.css中编写 CSS；
* 在app.js中编写 JavaScript；
* 将图片资源放在images目录下。

## 三、贡献力量

Squirrel 3 是遵循 MIT 协议的开源项目，代码寄托于 [GitHub](https://github.com/iinterest/Squirrel-3)，如果感兴趣请加入我们贡献您的力量，您可以：

1. 希望您能反馈任何有关体验方面的意见和建议至 [Github issues](https://github.com/iinterest/Squirrel-3/issues)「体验」，您可以提出问题或改进建议，甚至提出新的功能需求。
2. 如果使用中发现 BUG，请提交至 [Github issues](https://github.com/iinterest/Squirrel-3/issues)「BUG」，同时也请报告您的使用版本、环境，我们会尽快确认、修复。
3. 欢迎您为 Squirrel 贡献高实用性的功能插件，以方便其他使用者。开始之前请先阅读插件开发流程。
4. 如果您制作了一款基于 Squirrel 的主题并且符合主题的开发规范，我们非常欢迎您将它提交至主题库。
5. DPL 组件与业务结合紧密，具备高质量且完整的交互体验，如果您为您的项目开发了类似的组件，欢迎提交至设计模式库。

