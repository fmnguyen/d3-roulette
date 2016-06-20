/**
 * TODO:
 *     Add ticker + ticker animation
 *     Add guides (10 tick marks)
 *     Window.resize function that redraws on resize 
 */

var containerWidth = $('.race-category').width();
var margin = {top: 40, right: 10, bottom:20, left: 10 }

// Control Variables for the rotation animation
var randomDelay;
var randomDuration;
var numRotation = 7;  // rotations you want each spinner to complete 
var durationStep = 50; // steps are in ms 
var offsetAngle = {};

var width = containerWidth / 2 - margin.right, // or 100 for testing
    height = 85, // height is actually what determines the size of our spinner (since it is always smaller than width)
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .domain([0, 1, 2])
    .range(["#405d98", "#c40f3a", "#578857"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 35);

var pie = d3.layout.pie()
    //.padAngle(-.01)
    .value(function(d){ return d.probability })
    .sort(null);

d3.json('/data/test.json', function(error, data) {
    if(error) throw error;

    var g; 
    var svg;

    // iterate over each state, and make a div + svg for each
    // Adds the state's short-form name and builds a spinner for each state
    for (var i = 0 ; i < data.states.length; i ++) {
        switch (data.states[i]['race-category']) {
            case "democrat":
                d3.select('#race-democrat')
                    .append('div').attr('class', 'small-spinner')
                    .attr('id', data.states[i].abbreviation)
                    .datum(data.states[i])
                    .append('span')
                        .text(data.states[i].abbreviation)
                        .attr('class', 'spinner-state-name')
                break;
            case "competetive":
                d3.select('#race-competetive')
                    .append('div').attr('class', 'small-spinner')
                    .attr('id', data.states[i].abbreviation)
                    .datum(data.states[i])
                    .append('span')
                        .text(data.states[i].abbreviation)
                        .attr('class', 'spinner-state-name')
                break;
            case "republican": 
                d3.select('#race-republican')
                    .append('div').attr('class', 'small-spinner')
                    .attr('id', data.states[i].abbreviation)
                    .datum(data.states[i])
                    .append('span')
                        .text(data.states[i].abbreviation)
                        .attr('class', 'spinner-state-name')
                break;
        }

        // appends a new div to fill in with color that represents the race result
        d3.select('#' + data.states[i].abbreviation)
            .append('div')
            .attr('class', 'race-result')

        // appends a new svg for each state
        svg = d3.select('#' + data.states[i].abbreviation)
            .append('svg')
            .attr('class', 'spinner-svg')
            .attr({'width': width, 'height': height}) 

        // draws the pie with each states values
        g = svg.selectAll(".arc").data(pie(data.states[i].value))
            .enter().append('g')
            .attr('class', 'arc')
            .attr('data-key', data.states[i].abbreviation).attr("transform", "translate(" + (width / 2 + 30)  + "," + height / 2 + ")");
        
        // polyfill for each arc color    
        g.append("path")
            .attr("d", arc)
            .style("fill", function(d, i) { return color(i); });

        var svgNeedle = d3.select('#' + data.states[i].abbreviation)
            .append('svg')
            .attr('class', 'spinner-svg spinner-svg-needle')
            .attr({'width': width, 'height': height});

        svgNeedle.append('g')
            .attr('class', 'needle')
            .append('circle')
                .attr('r', 2)
                .attr('cx', 30)
                .attr('cy', 7)
                .attr('fill', '#ddd')

    }
});

// Choose each party's affiliation / win on button click, then start all the animations
// on animation end, update the winners and final count for each party 
$('.spin-button').click(function(e) {

    $('.small-spinner').each(function() {

        // reset our chosen race-result back to transparent + otherwise
        $(this).find('.race-result').css({
            "background-color": 'transparent',
            "border": "#5c5c5c 1px solid"
        });

        // choose some random number between 1-100 inclusive, calculate end point of spinner
        var rand = Math.floor(Math.random() * 100) + 1;
        var chosen;
        var fillColor; 
        d3.select(this)
            .attr('data-race-result', function(d){ 
                var temp = calculateOffsetAngle(d, rand, this.getAttribute('id'));
                chosen = temp.party;
                return temp.party; 
            });
        console.log(this.getAttribute('id') + ": " + chosen);
    }) 

    // start our ticker animation

    // start our spinning animation
    d3.selectAll('.arc')
        .transition()
        .duration(calculateDuration) // randomly calculates a duration for each spinner
        .delay(calculateDelay) // randomly calculates a delay for each spinner
        .ease('cubic-in-out') // maybe change to ease in / out? a bit awkward
        .attrTween('transform', angleTween) // this also handles our x/y translations of the charts
        .each("end", fillCircle)

});

function fillCircle() {
    $('.small-spinner').each(function() {
        switch (this.getAttribute('data-race-result')) {
            case "democrat":
                fillColor = '#405d98';
                break;
            case "republican":
                fillColor = "#c40f3a";
                break;
            case "other":
                fillColor = "#578857";
                break;
        }
        $(this).find('.race-result').css({
            "background-color": fillColor,
            "border": fillColor
        })
    })
}

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
        randomDuration = (Math.floor(Math.random() * 15) + 1) * durationStep + 3500 // we want this to be between 3500-5000
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
    var angle = 360 * numRotation + offsetAngle[this.getAttribute('data-key')];
    var i = d3.interpolate(0, angle);
    return function(t) {
        return "translate(" + (width / 2 + 30) + "," + height / 2 + ")rotate(" + i(t) + ")";
    };
}

/**
 * Given a random integer, calculates the offset angle to rotate the spinner by
 *     in order for the chosen arc of the pie to be centered on the leftmost side
 * @param  object d    representative of the entire state object 
 * @param  int rand    a random integer between 1 and 100
 * @param  str $id     the id representative of the spinner
 * @return {"party" : string, "angle" : int}      party, the political party; angle, the offset angle
 */
function calculateOffsetAngle(d, rand, $id) {
    var a;
    var party;

    if (rand < d.value[0].probability) {
        a = 270 - (d.value[0].probability * 1.8); // we want our slice to be centered at the 270 degree mark, so 270 - (percentage of pie * 360)
        party = "democrat"
    }
    else if (rand < d.value[0].probability + d.value[1].probability) {
        a = 270 - (d.value[1].probability * 1.8) - (d.value[0].probability * 3.6)
        party = "republican"
    }

    else if(rand <= d.value[0].probability + d.value[1].probability + d.value[0].probability + d.value[2].probability) {
        a = 270 - (d.value[2].probability * 1.8) - (d.value[0].probability * 3.6 + d.value[1].probability * 3.6)
        party = "other"
    } 

    offsetAngle[$id] = a; //set the id of this into the offsetAngle array. We will use this later in angleTween
    return {"party": party, "angle": a};
}

// Coerces numeric types
function type(d) {
    for (var i = 0; i < d.states.length; i++) {
        for(var j = 0; j < d.states[i].value.length; j++) {
            d.states[i].value[j].probability = +d.states[i].value[j].probability;
        }   
    }
    return d;
}