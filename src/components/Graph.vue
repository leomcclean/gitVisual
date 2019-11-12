<template>
	<div id="graph">
		<div v-if="ready" class="gDiv">
			<svg id="visual" class="visual"></svg>
		</div>
		<div v-else class="gDiv">
			<img class="githubGraph" :src="require('../assets/githubDark.png')"/>
			<p class="loading2">Loading...</p>
		</div>
		<button v-on:click="makeGraph" class="test" type="button">test</button>
	</div>
</template>

<script>
	//eslint-disable-next-line
	const d3 = require("d3")
	export default
	{
		name:"Graph",
		props: 
		{
			result: Array,
			owner: String
		},
		data: function()
		{
			return {
				uIndex: 0,
				ready: false
			}
		},
		computed:
		{
			userIndex: function()
			{
				for(var i = 0; i < this.results; i++)
				{
					if(this.results[i].author.login == this.owner)
						return i
				}
				return null
			},
			weekArray: function()
			{
				var array = []
				for(var i = 0; i < 52; i++)
				{
					array.push("Week " + (i + 1))
				}
				return array
			},
			currentWeek: function()
			{
				var array = []
				for(var i = 0; i < this.result[this.uIndex].weeks; i++)
					array.push(this.weekArray[i])
				return array
			},
			yMax: function()
			{
				var additions = 0
				for(var i = 0; i < this.result[this.uIndex].weeks; i++)
					if(additions < this.result[this.uIndex].weeks[i].a)
						additions = this.result[this.uIndex].weeks[i].a
				if(additions < 10)
					additions += 10
				return Math.ceil(additions / 10) * 10
			},
			additionArray: function()
			{
				var array = []
				for(var i = 0; i < this.result[this.uIndex].weeks; i++)
					array.push(this.result[this.uIndex].weeks[i].a)
				return array
			}
		},
		methods:
		{
			makeGraph: function()
			{
				this.uIndex = this.userIndex

				var graph = d3.select("#visual_graph")
				if(graph)
					graph.remove()

				var margin = {top: 25, right: 0, bottom: 25, left: 25};
				var width = 250 - margin.left - margin.right;
				var height = 400 - margin.top - margin.bottom;

				var svg = d3.select("#visual")
					.append("svg")
						.attr("width", "100%")
						.attr("height", "100%")
						.attr("id", "visual_graph")
					.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

				var x = d3
					.scaleBand()
					.domain(this.currentWeek)
					.range([0, width])
					.padding(1.0)
				svg.append("g").attr("transform", `translate(0, ${height})`)
					.call(d3.axisBottom(x));

				//var histogram = d3.histogram().value(function(d) { return + d.value; }).domain(x.domain());

				//var bar = histogram(this.additionArray);

				var y = d3
					.scaleLinear()
					.domain([0, this.yMax])
					.range([height, 0])
				svg.append("g")
					.call(d3.axisLeft(y));

				svg.selectAll()
					.data(this.additionArray)
					.enter()
					.append("rect")
					.attr("x", x("") )
					.attr("y",100)
					.attr("height", 150)
					.attr("width", x.bandwidth() )
					.style("fill", "#5B6170")
					.style("opacity", 0.5)
			}
		}
	}
</script>

<style>

</style>



