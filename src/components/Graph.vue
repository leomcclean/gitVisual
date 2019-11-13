<template>
	<div id="graph">
		<div v-if="ready" class="gDiv">
			<svg id="visual" class="visual" width="400" height="400"></svg>
		</div>
		<div v-else class="gDiv">
			<div class="spinner2">
				<div class="rect1"></div>
				<div class="rect2"></div>
				<div class="rect3"></div>
				<div class="rect4"></div>
				<div class="rect5"></div>
			</div>
			<p class="loading2">Loading...</p>
		</div>
	</div>
</template>

<script>
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
				for(var i = 0; i < this.result.length; i++)
				{
					if(this.result[i].author.login.toLowerCase() == this.owner.toLowerCase())
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
				for(var i = 0; i < this.result[this.uIndex].weeks.length; i++)
					array.push(this.weekArray[i])
				return array
			},
			yMax: function()
			{
				var additions = 0
				for(var i = 0; i < this.result[this.uIndex].weeks.length; i++)
					if(additions < this.result[this.uIndex].weeks[i].a)
						additions = this.result[this.uIndex].weeks[i].a
				if(additions < 10)
					additions += 10
				return Math.ceil(additions / 10) * 10
			},
			additionArray: function()
			{
				var array = []
				for(var i = 0; i < this.result[this.uIndex].weeks.length; i++)
					array.push(this.result[this.uIndex].weeks[i].a)
				return array
			}
		},
		methods:
		{
			makeGraph: function()
			{
				// set the dimensions and margins of the graph
				var margin = {top: 10, right: 30, bottom: 30, left: 40}
				var width = 460 - margin.left - margin.right
				var height = 400 - margin.top - margin.bottom

				// append the svg object to the body of the page
				var svg = d3.select("#visual")
					.append("svg")
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
					.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

				// get the data
				d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv", function(data)
				{
					// X axis: scale and draw:
					var x = d3.scaleLinear()
							.domain([0, 1000])		 // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
							.range([0, width]);
					svg.append("g")
							.attr("transform", "translate(0," + height + ")")
							.call(d3.axisBottom(x));

					// set the parameters for the histogram
					var histogram = d3.histogram()
							.value(function(d) { return d.price; })	 // I need to give the vector of value
							.domain(x.domain())	// then the domain of the graphic
							.thresholds(x.ticks(70)); // then the numbers of bins

					// And apply this function to data to get the bins
					var bins = histogram(data);

					// Y axis: scale and draw:
					var y = d3.scaleLinear()
							.range([height, 0]);
							y.domain([0, d3.max(bins, function(d) { return d.length; })]);	 // d3.hist has to be called before the Y axis obviously
					svg.append("g")
							.call(d3.axisLeft(y));

					// append the bar rectangles to the svg element
					svg.selectAll("rect")
							.data(bins)
							.enter()
							.append("rect")
								.attr("x", 1)
								.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
								.attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
								.attr("height", function(d) { return height - y(d.length); })
								.style("fill", "#69b3a2")
				});

				/*
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

				var y = d3
					.scaleLinear()
					.domain([0, this.yMax])
					.range([height, 0])
				svg.append("g")
					.call(d3.axisLeft(y));
				/*
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
				*/
			}
		},
		mounted: function()
		{
			//this.uIndex = this.userIndex
			this.makeGraph();
			this.ready = true
		}
	}
</script>

<style>

</style>



