import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import type { GetPostsResponseBody } from '$lib/types/response';
import { formatter } from '$lib/utils/formatter';
import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	console.log('LOAD / (page)');
	if (!locals.user) {
		console.log('Not authenticated');
		redirect(301, '/login');
	}
	const fetchurl = new URL('http://localhost:4000/posts');
	url.searchParams.forEach((value: string, key: string) => {
		console.log(key, value);
		fetchurl.searchParams.append(key, value);
	});
	console.log(fetchurl.toString());
	const response = await fetch(fetchurl, {
		headers: {
			authorization: `bearer ${locals.user.access_token}`
		}
	});
	const result = (await response.json()) as GetPostsResponseBody;
	return {
		posts: {
			total_count: result.total_count,
			count: result.count,
			page: result.page,
			posts: result.posts.map(formatter)
		}
	};
};

export const actions = {
	pull: async ({ locals }) => {
		console.log('Pull action');
		if (!locals.user) {
			console.log('Not authenticated');
			redirect(301, '/login');
		}
		const response = await fetch('http://localhost:4000/posts', {
			method: 'POST',
			body: JSON.stringify({
				username: locals.user?.username
			}),
			headers: {
				'Content-Type': 'application/json',
				authorization: `bearer ${locals.user?.access_token}`
			}
		});
		console.log(response.status);
		console.log('Form done');
		redirect(301, '/');
	},
	pin: async ({ locals, request }) => {
		console.log('Pin action');
		if (!locals.user) {
			console.log('Not authenticated');
			redirect(301, '/login');
		}
		const form = await request.formData();
		await fetch(`http://localhost:4000/posts/${form.get('_id')}`, {
			method: 'PATCH',
			headers: {
				authorization: `bearer ${locals.user?.access_token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				pinned: form.get('pinned') === 'on'
			})
		});
	},
	save: async ({ locals, request }) => {
		console.log('Save action');
		if (!locals.user) {
			console.log('Not authenticated');
			redirect(301, '/login');
		}
		const form = await request.formData();
		await fetch(`http://localhost:4000/posts/${form.get('_id')}`, {
			method: form.get('saved') === 'on' ? 'PUT' : 'DELETE',
			headers: {
				authorization: `bearer ${locals.user?.access_token}`,
				'Content-Type': 'application/json'
			}
		});
	},
	logout: async ({ locals, cookies }) => {
		console.log('Logout action');
		const response = await fetch('https://www.reddit.com/api/v1/revoke_token', {
			method: 'POST',
			body: `token=${locals.user?.refresh_token}&token_type_hint=refresh_token`,
			headers: {
				Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		// const json = await response.json();
		console.log(response.status);
		cookies.delete('jwt', { path: '/' });
		redirect(301, '/login');
	}
} satisfies Actions;
