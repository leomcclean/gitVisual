<template>
	<div id="graph">
		<svg
		:height="height"
		:width="width"
		>
	</div>
</template>

<script>
	const d3 = require("d3")
	export default
	{
		name:"Graph",
		props: 
		{
			user: String
		},
		data: function()
		{
			return {
				height: 800,
				width: 400
			}
		},
		methods:
		{

		},
		created()
		{
			this.colourScale = d3
				.scaleOrdinal()
				.range(["#FEAFC6","FE9922","93C464","75739F"])
		}
	}
</script>

<style>

</style>



