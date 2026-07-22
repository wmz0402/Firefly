import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "公告",

	// 公告内容
	content: `欢迎参观我的博客！

我是 luck007，一名计算机专业的初学者。虽然目前我的技术水平还在积累与起步阶段，但我非常喜欢边听音乐边去探索和学习计算机相关的各种新事物。

我的家产是王橹杰和穆祉丞！他们是两个非常优秀、闪闪发光的小孩，希望他们未来可以多多见面！

建立这个博客，主要是想找一个属于自己的小天地：
- 像朋友圈一样，记录生活里遇到的各种有意思的日常与趣事。
- 作为学习笔记，记录学习过程中踩过的坑、遇到的问题以及一步步积累的经验。

感谢你的到来，祝你今天也有好心情！`,

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "了解更多",
		// 链接 URL
		url: "/about/",
		// 内部链接
		external: false,
	},
};
