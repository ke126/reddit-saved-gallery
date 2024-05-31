import type { RedditPost, RedditThing } from '$lib/types/reddit';

const FORMATS = ['png', 'jpg', 'jpeg', 'gif'].map((format) => new RegExp(`\\.${format}`, 'i'));
function isImageLink(input: string): boolean {
	return FORMATS.some((format) => format.test(input));
}

export function formatter(post: RedditThing): RedditPost {
	// check based on post kind first
	if (post.kind === 't1') {
		const obj: RedditPost = {
			_id: post._id,
			pinned: post.pinned,
			subreddit: post.data.subreddit,
			title: post.data.link_title,
			selftext: post.data.body,
			permalink: post.data.permalink,
			media_url: undefined,
			author: post.data.author,
			link_author: post.data.link_author,
			num_comments: post.data.num_comments,
			score: post.data.score,
			created: post.data.created
		};
		return obj;
	}
	const obj: RedditPost = {
		_id: post._id,
		pinned: post.pinned,
		subreddit: post.data.subreddit,
		title: post.data.title,
		selftext: post.data.selftext,
		permalink: post.data.permalink,
		media_url: undefined,
		author: post.data.author,
		link_author: undefined,
		num_comments: post.data.num_comments,
		score: post.data.score,
		created: post.data.created
	};
	// links only
	// url is already an image
	if (post.data.domain === 'i.redd.it' || isImageLink(post.data.url)) {
		obj.media_url = post.data.url;
		return obj;
	}
	// check for an existing preview generated by reddit
	if (post.data.preview && post.data.preview.images.length > 0) {
		obj.media_url = post.data.preview.images[0].source.url;
		return obj;
	}
	// try media_metadata
	if (post.data.media_metadata) {
		if (post.data.gallery_data && post.data.gallery_data.items.length > 0) {
			const firstPage = post.data.gallery_data.items[0].media_id;
			obj.media_url = post.data.media_metadata[firstPage].s.u;
		} else {
			const firstPage = Object.keys(post.data.media_metadata)[0];
			obj.media_url = post.data.media_metadata[firstPage].s.u;
		}
		return obj;
	}
	// use low-res thumbnail
	if (isImageLink(post.data.thumbnail)) {
		obj.media_url = post.data.thumbnail;
		return obj;
	}
	return obj;
}
