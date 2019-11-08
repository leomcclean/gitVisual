<template>
	<div id="app">
		<div class="navbar">
			<h1>gitVisual</h1>
			<input @submit="search" type="text" class="search" placeholder="find repository">
		</div>
		<div class="user" >
			<p></p>
		</div>
	</div>
</template>
<script>
	const Octokit = require("@octokit/rest")
	const octokit = new Octokit(
		{
			auth: process.env.PERSONAL_AUTH,
			userAgent: "gitVisual 1.0 by leomcclean",
			baseUrl: 'https://api.github.com'
		});
	export default
	{
		name: 'app',
		data: function()
		{
			return
			{
				username: "",
				userdata: null
			}
		},
		methods:
		{
			searchUsers: function()
			{
				if(this.username != "")
				{
					octokit.users.getByUsername({username: this.username})
				}
				
			}
		}
	};
</script>

<style>
	@import './assets/css/base.css';
</style>



