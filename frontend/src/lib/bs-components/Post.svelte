<script lang="ts">
	import { enhance } from '$app/forms';
	import type { RedditCard } from '$lib/types/reddit';
	import { timeSince, dateString } from '$lib/utils/date';
	import { toast } from '$lib/toast/toast';
	import { promiseWithResolvers } from '$lib/utils/promise';
	interface Props {
		post: RedditCard;
	}

	let { post }: Props = $props();

	const BASE_URL = 'https://www.reddit.com';
	let saved = $state(true);
	let pinned = $state(post.pinned);
</script>

<div class="col">
	<div class="card">
		<div class="card-header">
			<div class="row justify-content-between">
				<div class="small col-auto">
					<div>
						<a
							href="{BASE_URL}/r/{post.subreddit}"
							target="_blank"
							class="link-body-emphasis link-underline-opacity-0 link-underline-opacity-75-hover"
							>r/{post.subreddit}</a
						>
						<span>•</span>
						<span title={dateString(post.created)}>{timeSince(post.created)}</span>
					</div>
					<div>
						<a
							href="{BASE_URL}/u/{post.author}"
							target="_blank"
							class="link-body-emphasis link-underline-opacity-0 link-underline-opacity-75-hover"
							>u/{post.author}</a
						>
						{#if post.link_author}
							<span>replied to</span>
							<a
								href="{BASE_URL}/u/{post.link_author}"
								target="_blank"
								class="link-body-emphasis link-underline-opacity-0 link-underline-opacity-75-hover"
								>u/{post.link_author}</a
							>
						{/if}
					</div>
				</div>
				<div class="d-flex align-items-center col-auto">
					<form
						method="post"
						action="/?/pin"
						use:enhance={() => {
							const { promise, resolve, reject } = promiseWithResolvers();
							toast.promise(promise, {
								pending: 'Loading...',
								fulfilled: pinned ? 'Pinned!' : 'Unpinned!',
								rejected: `Failed to ${pinned ? 'pin' : 'unpin'} post ${post._id}. Please try again later.`
							});
							return async ({ result, update }) => {
								await update({ reset: true, invalidateAll: false });
								if (result.type === 'success') {
									resolve();
								} else {
									reject();
									pinned = !pinned;
								}
							};
						}}
					>
						<input type="hidden" name="_id" value={post._id} />
						<input hidden type="checkbox" name="pinned" checked={pinned} />
						<button
							class="btn btn-lg btn-outline-secondary border-0 px-1 py-0"
							type="submit"
							title={pinned ? 'Unpin' : 'Pin'}
							onclick={() => (pinned = !pinned)}
						>
							{#if pinned}
								<i class="bi bi-pin-angle-fill" style="color: lime"></i>
							{:else}
								<i class="bi bi-pin-angle"></i>
							{/if}
						</button>
					</form>
					<form
						method="post"
						action="/?/save"
						use:enhance={() => {
							const { promise, resolve, reject } = promiseWithResolvers();
							toast.promise(promise, {
								pending: 'Loading...',
								fulfilled: saved ? 'Saved!' : 'Unsaved!',
								rejected: `Failed to ${saved ? 'save' : 'unsave'} post ${post._id}. Please try again later.`
							});
							return async ({ result, update }) => {
								await update({ reset: true, invalidateAll: false });
								if (result.type === 'success') {
									resolve();
								} else {
									reject();
									saved = !saved;
								}
							};
						}}
					>
						<input type="hidden" name="_id" value={post._id} />
						<input hidden type="checkbox" name="saved" checked={saved} />
						<button
							class="btn btn-lg btn-outline-secondary border-0 px-1 py-0"
							type="submit"
							title={saved ? 'Unsave' : 'Save'}
							onclick={() => ((saved = !saved), (pinned = false))}
						>
							{#if saved}
								<i class="bi bi-bookmark-fill" style="color: white"></i>
							{:else}
								<i class="bi bi-bookmark"></i>
							{/if}
						</button>
					</form>
				</div>
			</div>
		</div>
		{#if post.media}
			<img
				loading="lazy"
				width={post.media.width}
				height={post.media.height}
				src={post.media.link}
				class="card-img-top img-fluid"
				alt="..."
			/>
		{/if}
		<div class="card-body">
			<h5 class="card-title">{post.title}</h5>
			<p class="card-text text-body-secondary">
				{#if post.selftext && post.selftext.length > 500}
					{post.selftext.slice(0, 500)}...
				{:else}
					{post.selftext}
				{/if}
			</p>
		</div>
		<div class="card-footer">
			<span class="badge fw-normal border-secondary-subtle rounded-pill border p-2">
				<i class="bi bi-arrow-up"></i>
				{post.score} <i class="bi bi-arrow-down"></i>
			</span>

			<a href="{BASE_URL}{post.permalink}" target="_blank">
				<span
					class="btn btn-outline-secondary badge fw-normal border-secondary-subtle rounded-pill border p-2"
				>
					<i class="bi bi-chat-left"></i>
					{post.num_comments}
				</span>
			</a>
		</div>
	</div>
</div>

<style>
	.card {
		transition: all 0.1s ease-in-out;
	}
	.card:hover {
		scale: 1.05;
		background-color: hsl(from var(--bs-dark) h s calc(l + 5));
		z-index: 10;
	}
</style>
