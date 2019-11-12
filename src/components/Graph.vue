<template>
	<div id="graph">
		<div class="gDiv">
			<svg v-if="ready" id="visual" class="visual"></svg>
		</div>
		<button v-on:click="test(); makeGraph();" class="test" type="button">test</button>
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
			result: Array
		},
		data: function()
		{
			return {
				ready: false
			}
		},
		computed:
		{
			weekArray: function()
			{
				var weekArray = Array[53]
				weekArray[0] = ""
				for(var i = 1; i < 52 + 1; i++)
				{
					weekArray[i] = "Week " + i
				}
				return weekArray
			},
			mostAdditions: function()
			{
				var additions = 0
				for(var i = 0; i < this.result[0].weeks; i++)
					if(additions < this.result[0].weeks[i].a)
						additions = this.result[0].weeks[i].a
				return additions
			},
			additionArray: function()
			{
				var array = []
				for(var i = 0; i < this.result[0].weeks.length; i++)
					array.push(this.result[0].weeks[i].a)
				return array
			}
		},
		methods:
		{
			test: function()
			{
				//eslint-disable-next-line
				console.log(this.result[0])
				//eslint-disable-next-line
				console.log(this.result[0].weeks.length)
				//eslint-disable-next-line
				//console.log(this.result[0])
				//eslint-disable-next-line
				//console.log(this.result[0])
				this.ready = true
			},
			makeGraph: function()
			{
				var graph = d3.select("#visual_graph")
				if(graph)
					graph.remove()
				//var colour = d3.scaleOrdinal().domain(data).range(d3.schemeSet2);

				var margin = {top: 30, right: 30, bottom: 30, left: 30};
				var width = 400 - margin.left - margin.right;
				var height = 400 - margin.top - margin.bottom;

				var svg = d3.select("#visual")
					.append("svg")
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
						.attr("id", "visual_graph")
					.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				var x = d3
					.scaleLinear()
					.rangeRound([0,width])
				svg.append("g")
					.attr("transform", "translate(0," + height + ")")
					.call(d3.axisBottom(x)
						.ticks(this.result[0].total)
						.tickValues([0, 1, 2]));

				var histogram = d3.histogram().value(function(d) { return + d.value; }).domain(x.domain());

				var bar = histogram(this.additionArray);

				var y = d3
					.scaleLinear()
					.rangeRound([height, 0])
					.domain([0, this.mostAdditions]);
				svg.append("g").call(d3.axisLeft(y));

				svg.selectAll("rect")
					.data(bar)
					.enter()
					.append("rect")
					.attr("x", 1)
					.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
					.attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
					.attr("height", function(d) { return height - y(d.length); })
					.style("fill", "#69b3a2")
					.style("opacity", 0.6);
			}
		}
	}
</script>

<style>

</style>



