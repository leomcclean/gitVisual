<template>
	<div id="app">
		<div class="navbar">
			<h1>gitVisual</h1>
			<input v-model= "username" type="text" class="search" placeholder="find user">
			<button v-on:click="find" class="submit" type="button">search</button>
		</div>
		<div v-if="error" class="error">
			<P class="errorMsg">User not found</p>
		</div>
		<div v-if="results" class="bdiv">
			<div class="result_body">
				<div class="pdiv">
					<img class="image" v-bind:src="user.avatar_url" alt="Profile Picture">
				</div>
				<div class="user" >
					<h2 class="realname">{{ user.name}}</h2>
					<h2 class="username">{{ user.login }}</h2>
					<p class="bio">{{ bio }}</p>
				</div>
				<div class="rDiv">
					<h2 class="rTitle">Repositories</h2>
					<p class="rCount">{{ "Number of Public Repositories: " + user.public_repos }}</p>
					<ol v-if="showRepos" class="rList">
						<li class="repos" v-for="repo in repos" v-bind:key="repo.name">
							<a class="rLink" v-on:click="setRepo(repo.name);">{{ repo.name }}</a>
						</li>
					</ol>
					<button v-on:click="revealRepos" class="rToggle" type="button">{{ repoString }}</button>
				</div>
			</div>
			<div v-if="gClick" class="graph_body">
				<Graph :result="repoInfo"  :owner="username" :repo="relevantRepoName"></Graph>
			</div>
		</div>
		<div v-else-if="loading" class="lDiv">
			<div class="spinner">
				<div class="rect1"></div>
				<div class="rect2"></div>
				<div class="rect3"></div>
				<div class="rect4"></div>
				<div class="rect5"></div>
			</div>
			<p class="loading1">Loading...</p>
		</div>
	</div>
</template>

<script>
	import Graph from "./components/Graph.vue"
	export default
	{
		name: "app",
		components:
		{
			Graph,
		},
		data: function()
		{
			return {
				username: "",
				user: "",
				repos: "",
				relevantRepo: "",
				relevantRepoName: "",
				results: false,
				loading: false,
				gClick: false,
				error: false,
				showRepos: false,
				repoString: "show repositories",
				stats: ""
			}
		},
		computed:
		{
			bio: function()
			{
				// handling an empty bio
				if(this.user.bio == undefined)
					return "no bio listed"
				else
					return this.user.bio
			},
			repoFind: function()
			{
				// linking our user query to our repository query
				for(var i = 0; i < this.repos.length; i++)
				{
					if(this.repos[i].name == this.relevantRepoName)
					{
						return i
					}
				}
				return null
			},
			repoInfo: function()
			{
				//eslint-disable-next-line
				//console.log(this.stats[this.repoFind])
				return this.stats[this.repoFind]
			}
		},
		methods:
		{
			default: function()
			{
				// a basic reset function to clean up the find() function a little
				this.error = false
				this.loading = true
				this.results = false
				this.gClick = false
				this.relevantRepo = ""
				this.relevantRepoName = ""
			},
			find: function()
			{
				// checking the user has typed something
				if(this.username == "")
					return false
				this.default()
				// querying using octokit/rest.js
				this.$query.users.getByUsername({username: this.username}).then(result => {
					this.user = result.data
				}).catch(error => {
					this.error = true
					this.loading = false
					//eslint-disable-next-line
					console.log(error)
				})
				if(this.error)
					return
				// a second query to find repository information for the user
				this.$query.repos.listForUser({
					// we're looking for repos that are owned by the user, listed in the order they've were created
					username: this.username,
					type:"owner",
					sort: "created",
					direction: "desc"
				}).then(result => {
					// we use promises to retrieve all of our queries (1 per repo) at the same time
					this.repos = result.data
					let nameList = result.data.map(e => e.name)
					let promises = []
					nameList.forEach(e => {
						promises.push(
							this.$query.repos.getContributorsStats(
								{
								owner: this.username,
								repo: e
							}))
					})
					// setting loose our queries together
					Promise.all(promises).then(stats => {
						this.stats = stats.map(e => e.data)
						this.loading = false
						this.results = true
					})
				}).then(
					// changing the page to show we've retrieved repositories
					this.showRepos = false,
					this.repoString = "show repositories"
				).catch(error => {
					//eslint-disable-next-line
					console.log(error)
				})
			},
			revealRepos: function()
			{
				// if the user wishes to see the list of repositories, do so
				if(this.showRepos == false)
				{
					this.showRepos = true
					this.repoString = "hide repositories"
				}else
				{
					this.showRepos = false
					this.repoString = "show repositories"
				}
			},
			setRepo: function(name)
			{
				// occurs on clicking a repository, and starts the process to display a graph
				this.relevantRepoName = name
				this.gClick = true
			}
		}
	}
</script>

<style>
	@import "./assets/css/base.css";
	@import "./assets/css/profile.css";
	@import "./assets/css/graph.css";
	@import "./assets/css/animations.css";
	@import "./assets/css/loading.css";
</style>



