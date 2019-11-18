<template>
	<div id="graph">
		<div class="gDiv" id="yeet">
			<div v-show="!fork" class="graph">
				<svg id="visual" class="visual" width="600" height="600"></svg>
			</div>
			<div v-show="fork" class="badGraph">
				<p class="fork">Unfortunately the selected user is not a contributer to this repository. This is common with forks, but could also be because of an </p>
			</div>
			<div v-show="!fork" class="gInfoDiv">
				<p class="gInfo">This chart shows up to the 10 most recent consecutive weeks with additions, and is relevantly truncated if the repository is new, or hasn't been modified in a significant time.</p>
			</div>
			<div v-show="!fork && average" class="gInfoDiv">
				<p class="gInfo">The orange bar represents the average additions in any given week by all contributors that aren't the selected user, and the blue bar represents the selected users' additions.</p>
			</div>
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
			repo: String
		},
		data: function()
		{
			return {
				uIndex: 0,
				commits: 0,
				fork: false,
				average: false
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
					array.push(this.getWeek(this.result[this.uIndex].weeks[i].w))
					i++
				}
				return array
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
			getWeek: function(timestamp)
			{
				var date = new Date(0)
				date.setUTCSeconds(timestamp)
				var year = date.getFullYear().toString()
				year = year.slice(-2)
				return date.getDate() + "." + (1 + date.getMonth()) + "." + year
			},
			truncateArray: function(array, x)
			{
				var i = 0
				if(x == 0)
					i = array.length
				else
					i = x

				while(i > 0)
				{
					if(array[i - 1] == 0)
						i--
					else
						break
				}
				return array.slice(0,i)
			},
			averageAdditions: function()
			{
				var array = []
				for(var i = 0; i < this.result.length; i++)
				{
					if(i != this.uIndex)
					{
						var j = this.startPoint
						var average = 0
						while(j <= this.mostRecentCommit)
						{
							average += this.result[i].weeks[j].a
							j++
						}
						average /= (this.mostRecentCommit - this.startPoint)
						array.push(Math.ceil(average))
					}
				}
				return array
			},
			yMax: function(x, y)
			{
				var maxUserAdditions = Math.max(...x)
				var maxAverageAdditions = Math.max(...y)
				var max = Math.max(maxUserAdditions, maxAverageAdditions)
				var round = Math.pow(10, Number(String(max).length) - 1)
				return Math.ceil(max/round)*round
			},
			makeGraph: function()
			{
				var data = this.truncateArray(this.additionArray, 0)
				var average = this.averageAdditions()
				if(average == undefined || average.length == 0)
					average = [0]
				this.commits = data.length
				var domain = this.truncateArray(this.weekArray, this.commits)
				var yMax = this.yMax(data, average)

				var graph = d3.select("#visual_graph")
				if(graph)
					graph.remove()

				var margin = {top: 25, right: 0, bottom: 25, left: 70};
				var width = 580 - margin.left - margin.right;
				var height = 600 - margin.top - margin.bottom;

				var svg = d3.select("#visual")
					.append("svg")
						.attr("width", "100%")
						.attr("height", "100%")
						.attr("id", "visual_graph")
					.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

				var x = d3
					.scaleBand()
					.domain(domain)
					.range([0, width])
					.padding(1.0)
				svg.append("g").attr("transform", `translate(0, ${height})`)
					.call(d3.axisBottom(x));

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
				for(var j = 0; j < bars * 2; j++)
				{
					lengthArray.push(j * length)
				}
				var barWidth = (1 / (bars * 1.0001) * 200)
				var subtract = barWidth / 4
				if(Math.max(...average) != 0)
					subtract = barWidth /2
				subtract = Math.ceil(subtract)

				var tooltip = d3.select("#yeet")
					.append("div")	
					.attr("class", "tooltip")

				//eslint-disable-next-line
				var mouseover = function(d)
				{
					tooltip
						.style("visibility", "visible")
					d3.select(this)
						.style("stroke", "black")
						.style("opacity", .6)
				}
				//eslint-disable-next-line
				var mousemove = function(d)
				{
					tooltip
						.html(`<p class='y'>${d}</p>`)
						.attr("width", "2px")
						.style("left", (event.pageX - 80) + "px")
						.style("top", (event.pageY - 15) + "px")
						.style("z-index", "99 !important")
				}
				//eslint-disable-next-line			
				var mouseout = function(d)
				{		
					tooltip	
						.style("visibility", "hidden")
					d3.select(this)
						.style("stroke", "none")
						.style("opacity", .4)
				}

				//eslint-disable-next-line
				var barChart = svg.selectAll("rect")  
					.data(data)  
					.enter()  
					.append("rect")
						.style("fill", "#6DACFD")
						.style("opacity", "0.4")
						.attr("id", "barchart")
						.attr("y", function(d)
						{
							return height - Math.ceil((d * height) / yMax)
						})
						.attr("height", function(d)
						{
							return Math.ceil((d * height) / yMax)
						})
						.attr("width", barWidth / 2)  
						.attr("transform", function (d, i)
						{
							var translate = [lengthArray[i] + length - subtract, 0]
							return "translate("+ translate +")";   
						})
					.on("mouseover", mouseover)
					.on("mousemove", mousemove)
					.on("mouseout", mouseout)

				if(Math.max(...average) != 0)
				{
					this.average = true
					data = data.concat(average)
					//eslint-disable-next-line
					var barChart2 = svg.selectAll("rect") 
						.data(data)
						.enter()  
						.append("rect")
							.style("fill", "#F8B878")
							.style("opacity", ".4")
							.attr("id", "barchart")
							.attr("y", function(d)
							{	
								return height - Math.ceil((d * height) / yMax)
							})
							.attr("height", function(d)
							{
								return Math.ceil((d * height) / yMax)
							})
							.attr("width", barWidth / 2)  
							.attr("transform", function (d, i)
							{
								var translate = [lengthArray[i - average.length] + length, 0]
								return "translate("+ translate +")";   
							})
						.on("mouseover", mouseover)
						.on("mousemove", mousemove)
						.on("mouseout", mouseout)
				}else
				{
					this.average = false
				}

				svg.append("text")
					.attr("x", (width / 2 - 20))	     
					.attr("y", 0 - (margin.top / 2))
					.attr("text-anchor", "middle")  
					.style("font-size", "16px")  
					.text(`Number of additions by ${this.owner} per week in ${this.repo}`)
			}
		},
		mounted: function()
		{
			this.uIndex = this.userIndex
			this.fork = false
			if(this.uIndex == -1)
				this.fork = true
			else
			{
				this.commits = this.result[this.uIndex].weeks.length
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
				this.fork = false
				if(this.uIndex == -1)
					this.fork = true
				else
				{
					this.commits = this.result[this.uIndex].weeks.length
					this.makeGraph()
				}
				return (x, y)
			}
		}
	}
</script>



