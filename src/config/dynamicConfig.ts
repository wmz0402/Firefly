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
	items: [],
};
