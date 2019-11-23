# gitVisual

![alt-text](https://i.imgur.com/iK6IBQO.png)

An online visualisation of an individual's paticipation within their Github repos, made using Vue.js, d3.js, and Octokit's rest.js, a tool for querying the gitHub API.

gitVisual uses d3.js to graph the most recent user additions to their repositories, and displays a comparison to the average additions by other contributers in the same time-frame.

This was created as an assignment for module CSU33012 in Trinity College Dublin.

## Basic search functionality

![alt-text](https://i.imgur.com/xZXftIm.png)

We query for certain user information after the `search` button is clicked. We display the users' profile picture, name, username, and biography (if it exists). A repository count is also shown, with an optional dropdown.

## Selecting a Repository

![alt-text](https://i.imgur.com/63JFDvt.png)

Expanding the respository list allows us access to the main functionality of the project. Clicking into a repository draws a bar chart of up-to the 10 most recent weeks the user has made additions to the repository, or any number of weeks less than 10.

Hovering over a bar allows us to see the exact count, and the chart is scaled along the y-axis to fit the space.

## Repositories with Multiple Contributors

![alt-text](https://i.imgur.com/XQKozLt.png)

If there are multiple contributors that have made additions to the repository in the same weeks as our selected user, these additions are averaged against every contributor and displayed alongside our selected users' additions. This allows a comparison view for say, a team contributing to a repository.

We use additions rather than commits as it is arguably the purer measure of work.

## Limitations

![alt-text](https://i.imgur.com/6T1rOv5.png)

* The graph will only ever display up to the 10 most recent commits.
* We only ever draw the graph if the selected user has committed to the selected repository.

![alt-text](https://i.imgur.com/F2T5FsJ.png)

* If one week has a massive number of additions compared to other weeks, the scaling (being linear) can make certain weeks hard to see (as they are so small in comparison).

## Bugs

* Sometimes, for no discernible reason, the Octokit query returns an Object instead of an Array, and this creates some errors in the console. A graph will also fail to draw in this case. This bug is not consistent.

(I attempted to recreate this bug to get a screenshot and was unable to)

## Installation

Clone the repository into a directory, and cd into the root of the project. Do the following:

* `npm install` will install all relevant modules.

* `touch .env` will create a .env file. Here we only have one environment variable `VUE_APP_PERSONAL_AUTH`. Although the GitHub API can be queried anonymously up to 60 times an hour, see a guide on how to create a Personal Auth Token if you wish to use the nicer limit of 5,000 queries per hour.

* Once you've done so, `npm run serve` will launch the website locally and allow you to test it.
