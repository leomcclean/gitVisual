<template>
	<div id="graph">
		<div v-if="ready && !fork" class="gDiv">
			<svg id="visual" class="visual" width="600" height="600"></svg>
		</div>
		<div v-if="fork" class="badGraph">
			<p v-if="fork" class="fork">Unfortunately the selected user is not a contributer to this repository. This is common with forks.</p>
		</div>
		<div v-if="loading" class="gDiv">
			<div class="spinner2">
				<div class="rect1"></div>
				<div class="rect2"></div>
				<div class="rect3"></div>
				<div class="rect4"></div>
				<div class="rect5"></div>
			</div>
			<p class="loading2">Loading...</p>
		</div>
		<div v-if="!fork" class="gInfoDiv">
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
			owner: String,
		},
		data: function()
		{
			return {
				uIndex: 0,
				commits: 0,
				ready: false,
				fork: false,
				loading: false
			}
		},
		computed:
		{
			userIndex: function()
			{
				for(var i = 0; i < this.result.length; i++)
				{
					if(this.result[i].author.login.toLowerCase() == this.owner.toLowerCase())
					{
						return i
					}
				}
				return -1
			},
			mostRecentCommit: function()
			{
				var index = this.commits
				index--
				while(index > 9)
				{
					if(this.result[this.uIndex].weeks[index].a != 0)
						return index
					index--
				}
				return index
			},
			startPoint: function()
			{
				var index = this.mostRecentCommit
				if(index <= 9)
				{
					return 0
				}
				else
				{
					return index - 9
				}
			},	
			weekArray: function()
			{
				var array = []
				var i = this.startPoint
				while(i <= this.mostRecentCommit)
				{
					var date = new Date(0)
					date.setUTCSeconds(this.result[this.uIndex].weeks[i].w)
					var year = date.getFullYear().toString()
					year = year.slice(-2)
					array.push(date.getDate() + "." + (1 + date.getMonth()) + "." + year)
					i++
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
				var i = this.startPoint
				while(i <= this.mostRecentCommit)
				{
					array.push(this.result[this.uIndex].weeks[i].a)
					i++
				}
				return array
			}
		},
		methods:
		{
			makeGraph: function()
			{
				this.loading = true
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

				var bars = 0
				if(this.commits > 10)
					bars = 10
				else
					bars = this.commits
				var lengthArray = []
				var length = width / (bars + 1)
				for(var j = 0; j < bars; j++)
				{
					lengthArray.push(j * length)
				}
				var barWidth = (1 / (bars * 1.0001) * 200)

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

				this.loading = false
			}
		},
		mounted: function()
		{
			this.uIndex = this.userIndex
			this.ready = true
			if(this.uIndex == -1)
				this.fork = true
			else
			{
				this.commits = this.result[this.uIndex].weeks.length
				this.fork = false
				this.$nextTick(() => {
					this.makeGraph()
				})
			}
		},
		watch:
		{
			result: function(x, y)
			{
				this.uIndex = this.userIndex
				if(this.uIndex == -1)
					this.fork = true
				else
				{
					this.commits = this.result[this.uIndex].weeks.length
					this.fork = false
					this.makeGraph()
					this.makeGraph()
				}
				return (x, y)
			}
		}
	}
</script>



