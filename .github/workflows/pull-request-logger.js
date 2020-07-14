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

		if (!this.teamMembers) {
			this.teamMembers = this.fetchTeamMembers();
			console.log(this.teamMembers)
		}
	}

	set fetchTeamMembers() {
		return fetch(`https://api.github.com/organizations/${this.githubOrgId}/teams/${this.githubTeamName}/members`, {
			headers: {
				'Authorization': `token ${this.githubAccessToken}`
			}
		})
		.then(response => response.json())
		.then(teamMembers => teamMembers);
	}

	pullRequestOpen(actionPayload) {
		const isOpenedPullRequest = actionPayload.pull_request && actionPayload.action === 'opened';

		if (!isOpenedPullRequest) {
			console.log('pullRequestOpen: Tracking skipped as action payload is unrelated');

			return;
		}

		const pullRequestAuthor = actionPayload.pull_request.user.id;

		const openedByTeamMember = this.teamMembers.some(member => member.id = pullRequestAuthor);

		if (openedByTeamMember) {
			console.log('pullRequestOpen: Tracked as being opened by a team members')
		} else {
			console.log('pullRequestOpen: Tracked as being opened by someone outside of the team')
		}
	}

	pullRequestMerge(actionPayload) {
		const isMergedPullRequest = actionPayload.pull_request && actionPayload.action === 'merged';

		if (!isMergedPullRequest) {
			console.log('pullRequestMerged: Tracking skipped as action payload is unrelated');

			return;
		}

		const pullRequestAuthor = actionPayload.pull_request.user.id;
		const pullRequestMerger = actionPayload.pull_request.merged_by.id;

		const openedByTeamMember = this.teamMembers.some(member => member.id = pullRequestAuthor);
		const mergedByTeamMember = this.teamMembers.some(member => member.id = pullRequestMerger);

		if (openedByTeamMember) {
			if (mergedByTeamMember) {
				console.log('pullRequestMerge: Tracked as being opened and marged by a team member');
			} else {
				console.log('pullRequestMerge: Tracked as being opened by a team member and marged by a non-team member');
			}
		} else {
			if (mergedByTeamMember) {
				console.log('pullRequestMerge: Tracked as being opened by a non-team member and marged by a team member');
			} else {
				console.log('pullRequestMerge: Tracked as being opened and merged by a non-team member');
			}
		}

	}
};

const orgId = process.env.ORG_ID_GITHUB;
const teamName = process.env.TEAM_NAME_GITHUB;
const githubToken = process.env.PERSONAL_ACCESS_TOKEN;

try {
	const payload = JSON.stringify(github.context.payload, undefined, 2)

	const tracker = new ContributionTracker({
		githubOrgId: orgId,
		githubTeamName: teamName,
		githubAccessToken: githubToken
	});

	tracker.pullRequestOpen(github.context.payload);

} catch (error) {
	core.setFailed(error.message);
}
