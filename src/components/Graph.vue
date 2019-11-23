<template>
	<div class="gDiv" id="graph">
		<div v-show="!fork" class="graph">
			<svg id="visual" class="visual" width="600" height="600"></svg>
		</div>
		<div v-show="fork" class="badGraph">
			<p class="fork">Unfortunately it seems the selected user has not committed to this repository. This repository could be a fork, or it may not have any committs yet, or the repository has too many contributors to handle.</p>
		</div>
		<div v-show="!fork" class="gInfoDiv">
			<p class="gInfo">This chart shows up to the 10 most recent weeks with additions, limited by how many weeks the selected user has made additions. The scale is limited to just over the maximum additions in a given week in the set. Please note this can make large disrepancies difficult to see.</p>
		</div>
		<div v-show="!fork && average" class="gInfoDiv" id="average">
			<p class="gInfo">The orange bar represents the average additions in any given week by all contributors that aren't the selected user, and the blue bar represents the selected users' additions. Again, the weeks shown are only weeks where the selected user has made additions.</p>
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
			// the three important variables passed through from App.vue on clicking a repo
			result: Array,
			owner: String,
			repo: String
		},
		data: function()
		{
			return {
				// uIndex stores the userIndex computed, so we don't have to continuously compute
				uIndex: 0,
				commits: 0,
				// fork defines if a user has forked but not committed to a repository, average defines if there are other contributors
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
					// we compare with the lower case options because while gitHub stores usernames as case-sensitive, they are not in fact case-sensitive in regards to our queries
					if(this.result[i].author.login.toLowerCase() == this.owner.toLowerCase())
					{
						return i
					}
				}
				// this tells us the repo is empty of commits by our selected user
				return -1
			},
			weeks: function()
			{
				var array = []
				var length = this.result[this.uIndex].weeks.length
				// compute the 10 most recent weeks of additions, if there have been 10
				// we only look for weeks where the selected user has committed
				for(var i = length - 1; i > -1; i--)
					if(this.result[this.uIndex].weeks[i].a > 0)
					{
						array.push(i)
						// once we have found 10 such weeks, we return those
						// this is to ensure our graph is well-spaced and visually pleasing
						if(array.length == 10)
							return array.reverse()
					}
				return array.reverse()
			}
		},
		methods:
		{
			getWeek: function(timestamp)
			{
				// a simple convert from unix timestamp to a nicely formatted dd.mm.yy String
				var date = new Date(0)
				date.setUTCSeconds(timestamp)
				var year = date.getFullYear().toString()
				year = year.slice(-2)
				return date.getDate() + "." + (1 + date.getMonth()) + "." + year
			},
			makeArray: function(weeks, input)
			{
				// uses eval(), so this is probably a terrible way to do this
				// however we control the method calls, and it allows us to remove an essentially duplicate method
				var array = []
				for(var i = 0; i < weeks.length; i++)
					array.push(eval(input))
				return array
			},
			averageAdditions: function(weeks)
			{
				// iterating through all other contributors (if any) and finding the average additions per week that the selected user has committed
				var array = []
				for(var i = 0; i < weeks.length; i++)
				{
					var average = 0
					for(var j = 0; j < this.result.length; j++)
					{
						if(j != this.uIndex)
						{
							average += this.result[j].weeks[weeks[i]].a
						}
					}
					average = average / this.result.length
					// avoid pushing a number with a decimal place, that accuracy is not necessary
					array.push(Math.ceil(average))
				}
				return array
			},
			yMax: function(x, y)
			{
				// finding the largest possible y Value so we correctly set our axis height
				// first we compare our average and user additions, finding the max of all additions
				var maxUserAdditions = Math.max(...x)
				var maxAverageAdditions = Math.max(...y)
				var max = Math.max(maxUserAdditions, maxAverageAdditions)
				// ensure that our max Y is generally (except for max < 10) bigger than our actual max additions value
				// this allows us to have a visually pleasing graph, where no bars reach the top
				var round = Math.pow(10, Number(String(max).length) - 1)
				return Math.ceil(max / round) * round
			},
			makeGraph: function()
			{
				// get relevant weeks
				var weeks = this.weeks
				// an array of all the user additions we will display
				var data = this.makeArray(weeks, "this.result[this.uIndex].weeks[weeks[i]].a")
				// get the domains, ie the X-axis values our bars will be placed over
				var formattedWeeks = this.makeArray(weeks, "this.getWeek(this.result[this.uIndex].weeks[weeks[i]].w)")
				// get our average array (if there are other contributors that have made additions in the same weeks)
				var average = this.averageAdditions(weeks)
				if(average == undefined || average.length == 0)
					average = [0]
				this.commits = data.length
				// finally find our Y-axis height
				var yMax = this.yMax(data, average)

				// after gathering all relevant data we know use d3.js to graph our bar chart
				// if we already have a graph drawn, remove it
				var graph = d3.select("#visual_graph")
				if(graph)
					graph.remove()

				// size of the graph is fixed to fit our div element
				var margin = {top: 25, right: 0, bottom: 25, left: 70};
				var width = 580 - margin.left - margin.right;
				var height = 600 - margin.top - margin.bottom;

				// relevant attributes for the element the graph will occupy
				var svg = d3.select("#visual")
					.append("svg")
						.attr("width", "100%")
						.attr("height", "100%")
						.attr("id", "visual_graph")
					.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

				// setting our X-axis, the ticks being the weeks
				var x = d3
					.scaleBand()
					.domain(formattedWeeks)
					.range([0, width])
					.padding(1.0)
				svg.append("g").attr("transform", `translate(0, ${height})`)
					.call(d3.axisBottom(x));

				// setting our Y-axis, the ticks being a lienar scale from 0 to our maximum Y from earlier
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

				var tooltip = d3.select("#Graph")
					.append("div")	
					.attr("class", "tooltip")

				//eslint-disable-next-line
				var mouseover = function(d)
				{
					tooltip
						.style("visibility", "visible")
					d3.select(this)
						.style("stroke", "black")
						.style("opacity", 1)
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
						.style("opacity", .8)
				}

				//eslint-disable-next-line
				var barChart = svg.selectAll("rect")  
					.data(data)  
					.enter()  
					.append("rect")
						.style("fill", "#6DACFD")
						.style("opacity", "0.8")
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
							.style("opacity", ".8")
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



