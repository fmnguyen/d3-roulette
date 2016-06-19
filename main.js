/**
 * TODO:
 *     Add ticker + ticker animation
 *     Add guides (10 tick marks)
 *     Window.resize function that redraws on resize 
 */

$('.spin-button').click(function(e) {

	// choose some random number between 1-100 inclusive
    var rand = Math.floor(Math.random() * 100) + 1;

    // select a random number for each between 1 and 100
    // if the number is between 1 and democrat, choose democrat and adjust the rotation accordingly

    console.log(rand)
    var chosen;
    // switch (rand) {
    //     case (rand < democrat_num):
    //         chosen = 'democrat';
    //         //or increment a corresponding num in the obj??
    //         break;
    //     case (rand < democrat_num + republican_num):
    //         chosen = 'republican';
    //         break;
    //     case (rand < democrat_num + republican_num + other_num):
    //         chosen = 'other';
    //         break;
    // } 

    d3.selectAll('.arc')
        .transition()
        .duration(calculateDuration) // randomly calculates a duration for each spinner
        .delay(calculateDelay) // randomly calculates a delay for each spinner
        .ease('cubic-in-out') // maybe change to ease in / out? a bit awkward
        .attrTween('transform', angleTween) // this also handles our x/y translations of the charts



});

var containerWidth = $('.race-category').width();
var margin = {top: 40, right: 10, bottom:20, left: 10 }

// Control Variables for the rotation animation
var randomDelay;
var randomDuration;
var numRotation = 7; // rotations you want each spinner to complete

var width = containerWidth / 2 - margin.right, // or 100 for testing
    height = 100,
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .domain([0, 1, 2])
    .range(["#405d98", "#c40f3a", "#578857"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 35);

var labelArc = d3.svg.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d; });

d3.json('test.json', function(error, data) {
    if(error) throw error;

    var g; 
    var svg;

    // iterate over each state, and make a div + svg for each
    // Adds the state's short-form name and builds a spinner for each state
    for (var i = 0 ; i < data.states.length; i ++) {
        switch (data.states[i].race) {
            case "democratic":
                d3.select('#race-democrat')
                    .append('div').attr('class', data.states[i].state + ' small-spinner')
                    .append('span')
                        .text(data.states[i].state)
                        .attr('class', 'spinner-state-name')
                break;
            case "competetive":
                svg = d3.select('#race-competetive')
                    .append('div').attr('class', data.states[i].state + ' small-spinner')
                    .append('span')
                        .text(data.states[i].state)
                        .attr('class', 'spinner-state-name')
                break;
            case "republican": 
                svg = d3.select('#race-republican')
                    .append('div').attr('class', data.states[i].state + ' small-spinner')
                    .append('span')
                        .text(data.states[i].state)
                        .attr('class', 'spinner-state-name')
                break;
        }

        svg = d3.select('.' + data.states[i].state)
            .append('svg')
            .attr('class', 'spinner-svg')
            .attr({'width': width, 'height': height}) // appends a new svg for each state

        // draws the pie with each states values
        g = svg.selectAll(".arc").data(pie(data.states[i].value))
            .enter().append('g')
            .attr('class', 'arc')
            .attr('data-key', data.states[i].state).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        
        // polyfill for each arc color    
        g.append("path")
            .attr("d", arc)
            .style("fill", function(d, i) { return color(i); });

    }
});

function startSpin() {

}

/**
 * Calculates the randomized delay of animation for each spinner
 * Value will generally be between 25 - 125 ms
 * @param  int d data of specific arc, though we are NOT using this value
 * @param  int i index of the arc that we are currently iterating over
 * @return int   time in ms of how long the delay should last
 */
function calculateDelay(d, i) {
    // if the index % 3 = 0, we know that we're iterating on the next arcs of the next spinner
    // therefore we want to set the delay to a new random number
    if(i % 3 === 0)  // since we start at i = 0, this will intialize our random num
        randomDelay = (Math.floor(Math.random() * 5) + 1) * 25; 
    return randomDelay;
}

/**
 * Calculates the randomized time of spinning for each spinner
 * Value will generally be between 3500 - 5000ms 
 * @param  int d data of specific arc, though we are NOT using this value
 * @param  int i index of the arc that we are currently iterating over
 * @return int   time in ms of how long the spinning animation should last
 */
function calculateDuration(d, i) {
    if(i % 3 === 0)
        randomDuration = (Math.floor(Math.random() * 15) + 1) * 50 + 3500 // we want this to be between 3500-5000
    return randomDuration;
}

/**
 * Computes the keyframes between two points
 * Makes sure that the ending rotational position of the spinner is accurate to the ticker
 * @param  int d  data value of the arc that we are iterating on 
 * @param  int i  index of the arc that is currently iterating over
 * @return tweenFunction   
 */
function angleTween(d, i) {
    // to calculate the end rotation of the spinner: 
    //  take the data of the section that was chosen (democrat: 40)
    //  270 - (data * 1.8) - (other data * 3.6)
    //  muiltiply the data by 3.6, add the starting point, add 270 and subtract half of the distance
    console.log(d)
    var angle = 360 * numRotation //+ caclulatedPoint;
    var i = d3.interpolate(0, angle);
    return function(t) {
        return "translate(" + width / 2 + "," + height / 2 + ")rotate(" + i(t) + ")";
    };
}

// Computes the angle of an arc, converting from radians to degrees
function angle(d) {
    var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
    return a > 90 ? a - 180 : a;
}

function type(d){
    d.democrat = +d.democrat;
    return d;
}