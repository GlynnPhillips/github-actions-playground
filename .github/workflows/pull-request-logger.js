const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

class ContributionTracker {

	constructor({ githubOrgId, githubTeamName, githubAccessToken }) {

		if (!githubOrgId) {
			core.setFailed('Contribution tracker: Missing the required "githubOrgId" property');
		}

		if (!githubTeamName) {
			core.setFailed('Contribution tracker: Missing the required "githubTeamName" property');
		}

		if (!githubAccessToken) {
			core.setFailed('Contribution tracker: Missing the required "githubAccessToken" property');
		}

		this.githubOrgId = githubOrgId;
		this.githubTeamName = githubTeamName;
		this.githubAccessToken = githubAccessToken;
	}

	openedPullRequest(actionPayload) {
		fetch(`https://api.github.com/organizations/${orgId}/teams/${teamName}/members`, {
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
	}
};



const orgId = process.env.ORG_ID_GITHUB;
const teamName = process.env.TEAM_NAME_GITHUB;
const githubToken = process.env.PERSONAL_ACCESS_TOKEN;

try {
	const payload = JSON.stringify(github.context.payload, undefined, 2)
	console.log(`The event payload: ${payload}`);

	const tracker = new ContributionTracker({
		githubOrgId: orgId,
		githubTeamName: teamName,
		githubAccessToken: githubToken
	});

	tracker.openedPullRequest(github.context.payload);

} catch (error) {
	core.setFailed(error.message);
}
