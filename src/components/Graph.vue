<template>
	<div id="graph">
		<button v-on:click="makeGraph" class="submit" type="button">make</button>
		<div v-if="ready" class="gDiv">
			<svg id="visual" class="visual" width="600" height="600"></svg>
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
		<div class="gInfoDiv">
			<p class="gInfo">This chart holds either the last 10 weeks, or all weeks since repository creation (if less than 10).</p>
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
				for(var i = 0; i < this.commits; i++)
				{
					var date = new Date(0)
					date.setUTCSeconds(this.result[this.uIndex].weeks[i].w)
					var year = date.getFullYear().toString()
					year = year.slice(-2)
					array.push(date.getDate() + "." + date.getMonth() + "." + year)
				}
				return array
			},
			yMax: function()
			{
				var additions = Math.max(...this.additionArray)
				if(additions < 10 && additions != 0)
					additions += 10
				return Math.ceil(additions / 10) * 10
			},
			additionArray: function()
			{
				var array = []
				var length = this.result[this.uIndex].weeks.length
				var missing = 10 - length
				if(missing > 0)
				{
					for(let i = 0; i < length; i++)
					{
						array.push(this.result[this.uIndex].weeks[i].a)
					}
				}
				else
				{
					for(let i = length - 1; i > length - 11; i--)
						array.push(this.result[this.uIndex].weeks[i].a)
				}
				return array
			},
			commits: function()
			{
				if(this.result[this.uIndex].weeks.length < 10)
					return this.result[this.uIndex].weeks.length
				else
					return 10
			}
		},
		methods:
		{
			forceRender: function()
			{
				this.componentKey += 1
			},
			makeGraph: function()
			{
				var graph = d3.select("#visual_graph")
				if(graph)
					graph.remove()

				var margin = {top: 25, right: 0, bottom: 25, left: 70};
				var width = 580 - margin.left - margin.right;
				var height = 600 - margin.top - margin.bottom;

				var svg = d3.select("#visual")
					.append("svg")
						.attr("width", "1000%")
						.attr("height", "100%")
						.attr("id", "visual_graph")
					.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

				var x = d3
					.scaleBand()
					.domain(this.weekArray)
					.range([0, width])
					.padding(1.0)
				svg.append("g").attr("transform", `translate(0, ${height})`)
					.call(d3.axisBottom(x));

				var yMax = this.yMax
				var y = d3
					.scaleLinear()
					.domain([0, yMax])
					.range([height, 0])
				svg.append("g")
					.call(d3.axisLeft(y))

				var lengthArray = []
				var length = width / (this.commits + 1)
				for(var j = 0; j < this.commits; j++)
				{
					lengthArray.push(j * length)
				}
				var barWidth = (1 / (this.commits * 1.0001) * 100)	

				var data = this.additionArray
				//eslint-disable-next-line
				var barChart = svg.selectAll("rect")  
					.data(data)  
					.enter()  
					.append("rect")
					.style("fill", "#6DACFD")
					.style("opacity", "0.4")
					.attr("y", function(d)
					{
						return height - Math.ceil((d * width) / yMax)
					})
					.attr("height", function(d)
					{
						return Math.ceil((d * width) / yMax)
					})
					.attr("width", barWidth)  
					.attr("transform", function (d, i)
					{
						var translate = [lengthArray[i] + length - (barWidth / 2), 0]
						return "translate("+ translate +")";   
					})

				svg.append("text")
					.attr("x", (width / 2 - 20))	     
					.attr("y", 0 - (margin.top / 2))
					.attr("text-anchor", "middle")  
					.style("font-size", "16px")  
					.text("Weekly Additions by User")
			}
		},
		mounted: function()
		{
			this.uIndex = this.userIndex
			this.ready = true
			this.makeGraph()
		}
	}
</script>

<style>

</style>



