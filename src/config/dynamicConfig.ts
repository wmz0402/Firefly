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
			date: "2026/07/24 12:22",
			content: "今天是李婷婷的生日，祝李婷婷十九岁生日快乐",
			pinned: false,
		},
		{
			date: "2026/07/24 10:11",
			content: "今天好开心因为明天就是周末了",
			pinned: false,
		},
	],
};
