<template>
	<div id="app">
		<div class="navbar">
			<h1>gitVisual</h1>
			<input v-model= "username" type="text" class="search" placeholder="find user">
			<button v-on:click="find" class="submit" type="button">search</button>
		</div>
		<div v-if="results" class="picture">
			<img class="image" v-bind:src="user.avatar_url" alt="Profile Picture">
		</div>
		<div v-if="results" class="user" >
			<h2 class="realname">{{ user.name}}</h2>
			<h2 class="username">{{ user.login }}</h2>
			<p class="bio">{{user.bio }}</p>
		</div>
		<div v-if="results" class="repoDiv">
			<h2 class="rTitle">Repositories</h2>
			<p class="repoCount">{{ "Number of Public Repositories: " + user.public_repos}}</p>
			<ol v-if="showRepos" class="repolist">
				<li class="repos" v-for="repo in repos" v-bind:key="repo.name">
					<a class="repolink" v-bind:href="repo.html_url">{{ repo.name }}</a>
				</li>
			</ol>
			<button v-on:click="revealRepos" class="repoToggle" type="button">{{ repoString }}</button>
		</div>
	</div>
</template>

<script>
	//eslint-disable-next-line
	import Graph from "./components/Graph.vue"
	export default
	{
		data: function()
		{
			return {
				username: "",
				user: "",
				results: false,
				repos: "",
				showRepos: false,
				repoString: "show repositories",
				stats: ""
			}
		},
		methods:
		{
			find: function()
			{
				this.$query.users.getByUsername({username: this.username}).then(result => {
					this.user = result.data
				})
				this.$query.repos.listForUser({
					username: this.username,
					type:"owner",
					sort: "created",
					direction: "desc"
				}).then(result => {
					this.repos = result.data
					let nameList = result.data.map(e => e.name)
					let promises = []
					nameList.forEach(e => {
						promises.push(
							this.$query.repos.getContributorsStats({
								owner: this.username,
								repo: e
							}))
					})
					Promise.all(promises).then(stats => {
						this.stats = stats.map(e => e.data)
						//eslint-disable-next-line
						console.log(this.stats)
					})
				})
				this.results = true;
				this.showRepos = false
				this.repoString = "show repositories"
			},
			revealRepos: function()
			{
				if(this.showRepos == false)
				{
					this.showRepos = true
					this.repoString = "hide repositories"
				}else
				{
					this.showRepos = false
					this.repoString = "show repositories"
				}
			}
		}
	}

</script>

<style>
	@import "./assets/css/base.css";
</style>



