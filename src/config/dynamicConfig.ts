export interface DynamicItem {
	id?: string;
	author?: string;
	avatar?: string;
	date: string;
	content: string;
	pinned?: boolean;
	link?: string;
	images?: string[];
}

export interface DynamicConfig {
	title: string;
	moreText?: string;
	moreUrl?: string;
	items: DynamicItem[];
}

export const dynamicConfig: DynamicConfig = {
	title: "最新动态",
	moreText: "更多动态",
	moreUrl: "/dynamic",
	items: [
		{
			date: "2026/07/23 15:04",
			content: "这是一条memos的动态",
			pinned: true,
		},
		{
			date: "2026/07/23 15:42",
			content: "飞萤之火自无梦的长夜亮起，绽放在终竞的明天。",
			pinned: false,
		},
	],
};
