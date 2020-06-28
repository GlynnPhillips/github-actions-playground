const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

try {
	const payload = JSON.stringify(github.context.payload, undefined, 2)
	console.log(`The event payload: ${payload}`);

	fetch('https://api.github.com/organizations/3502508/teams/content-innovation/members', {
		headers: {
			'Authorization': `token ${process.env.PERSONAL_ACCESS_TOKEN}`
		}
	})
	.then(response => {
		return response.json();
	})
	.then(payload => {
		console.log(payload);
	});

} catch (error) {
	core.setFailed(error.message);
}
