/**
 * TODO:
 *     ticker animation
 *     Window.resize function that redraws on resize 
 */

var containerWidth = $('.race-category').width();
var margin = {top: 40, right: 10, bottom:20, left: 10 }

// Control Variables for the rotation animation
var randomDelay;
var randomDuration;
var minTime = 6000;    // minimum amount of time you want the animation to spin for 
var numRotation = 10;  // rotations you want each spinner to complete 
var durationStep = 50; // steps are in ms 

// Other initializing variables
var numAnimateCycle = {}
var offsetAngle = {};
var animationDuration = {};
var animationDelay = {};
var raceTotals = {'democrat': 0, 'republican': 0, 'other': 0}

var width = containerWidth / 2 - margin.right, // or 100 for testing
    height = 75, // height is actually what determines the size of our spinner (since it is always smaller than width)
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .domain([0, 1, 2])
    .range(["#405d98", "#c40f3a", "#578857"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 12)  // changes the big radius of each of our pie arcs
    .innerRadius(radius - 26); // changes the smaller radius of the inner of our pie

var pie = d3.layout.pie()
    .value(function(d){ return d.probability })
    .sort(null);

d3.json('/data/data_full_altered.json', function(error, data) {
    if(error) throw error;

    var g; 
    var svg;

    // iterate over each state, and make a div + svg for each
    // Adds the state's short-form name and builds a spinner for each state
    for (var i = 0 ; i < data.states.length; i ++) {
        var abbreviation = data.states[i].abbreviation.replace(/\s+/g, '');
        abbreviation = abbreviation.replace(/[()]/g, '');

        switch (data.states[i]['race-category']) {
            case "democratic":
                d3.select('#race-democrat')
                    .append('div').attr('class', 'small-spinner')
                    .attr('id', abbreviation)
                    .datum(data.states[i])
                    .append('span')
                        .text(abbreviation)
                        .attr('class', 'spinner-state-name')
                break;
            case "competetive":
                d3.select('#race-competetive')
                    .append('div').attr('class', 'small-spinner')
                    .attr('id', abbreviation)
                    .datum(data.states[i])
                    .append('span')
                        .text(abbreviation)
                        .attr('class', 'spinner-state-name')
                break;
            case "republican": 
                d3.select('#race-republican')
                    .append('div').attr('class', 'small-spinner')
                    .attr('id', abbreviation)
                    .datum(data.states[i])
                    .append('span')
                        .text(abbreviation)
                        .attr('class', 'spinner-state-name')
                break;
        }

        // initialize the animation cycle number
        numAnimateCycle[abbreviation] = 0;

        // appends a new div to fill in with color that represents the race result
        d3.select('#' + abbreviation)
            .append('div')
            .attr('class', 'race-result')

        // appends a new svg for each state
        svg = d3.select('#' + abbreviation)
            .append('svg')
            .attr('class', 'spinner-svg spinner-svg-body')
            .attr({'width': width, 'height': height - 8}) 

        // draws the pie with each states values
        g = svg.selectAll(".arc").data(pie(data.states[i].value))
            .enter().append('g')
            .attr('class', 'arc')
            .attr('data-key', abbreviation)
            .attr("transform", "translate(" + (width / 2 + 30)  + "," + (height / 2 - 10) + ")");
        
        // polyfill for each arc color    
        g.append("path")
            .attr("d", arc)
            .style("fill", function(d, i) { return color(i); });

        // appends a new svg container that will hold our ticker/needle
        var svgNeedle = d3.select('#' + abbreviation)
            .append('svg')
            .attr('class', 'spinner-svg spinner-svg-needle')
            .attr('data-key', abbreviation)
            .attr({'width': width / 2, 'height': height / 2})
            .attr('transform', 'rotate('  +  45 +" " + width / 2 + " " + (height / 2 - 10) +')')
            .style('left', (width / 4 - 22.5 + 13))
            .style('top', (height / 2 - 28 ))

        // group element and circle of the needle that we are going to rotate with our animation function
        svgNeedle = svgNeedle.append('g')
            .attr('class', 'needle')
            .attr('transform', 'translate(' + (width / 4 - 3.5) + ',' + (height / 4 - 3.5) + ')')
            .attr('transform-origin', 'left center 0') // this sets where we are rotating our needle from

        // draws the larger needle path
        svgNeedle.append('path')
            .attr('d', 'm24.00,30.1c0,0-17.12-3.85-17.47-3.85c-2.17,0-3.93,1.76-3.93,3.93s1.76,3.93,3.93,3.93C7.97,34.11,25.09,30.1,25.09,30.1z')
            .attr('fill', '#bbb')
            .attr('stroke', 'white')
            .attr('stroke-width', 0.5)
            .attr('transform', "translate(" + (-3) + "," + (-26) + ")");

        svgNeedle.append('circle')
                .attr('r', 2)
                .attr('cx', 4) // this 4 offsets the circle so that it is the 'eye' of the needle
                .attr('cy', 4)
                .attr('fill', '#ddd')

        // draws the 10 marks that divide the circle
        drawGuides(abbreviation);

    }
});

// Choose each party's affiliation / win on button click, then start all the animations
// on animation end, update the winners and final count for each party 
$('.spin-button').click(function(e) {

    // Resets state to original state
    raceTotals.democrat = 0;
    raceTotals.republican = 0;
    raceTotals.other = 0;
    $('.race-total').each(function() {
        $(this).find('.race-total-value').text('??');
    })
    $('.spin-button').text('SPINNING...');
    for (var key in numAnimateCycle) {
        numAnimateCycle[key] = 0
    }

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
        raceTotals[chosen]++;
    }) 

    // start our spinning animation
    d3.selectAll('.arc')
        .transition()
        .duration(calculateDuration) // randomly calculates a duration for each spinner
        .delay(calculateDelay) // randomly calculates a delay for each spinner
        .ease('cubic-in-out') // maybe change to ease in / out? a bit awkward
        .attrTween('transform', angleTween) // this also handles our x/y translations of the charts
        .each('end', function() {
            fillCircle(this)
            $('.spin-button').text('SPIN AGAIN');
        })

    // start our ticker animation
    d3.selectAll('.spinner-svg-needle')
        .each(pulse)
        // number of animation cycles we need to complete is numRotation * 10 + Math.round(offsetAngle[this.getAttribute('data-key') / 10)]

});

/**
 * repeats the needle up/down animation until the wheels stop spinning
 *     recursively calls one cycle of the animation until the counter is overriden
 */
function pulse() {
    (function repeat() {    
        d3.selectAll('.spinner-svg-needle')
            .transition()
            .duration(function(){  // to find duration : avgRotationTime / 10 / 2, 10 for each tick mark, and 2 since the animation is split into up + down
                avgRotationTime = (animationDuration[this.getAttribute('data-key')] / numRotation);
                return avgRotationTime / 10;
            })
            .delay(function() {
                return animationDelay[this.getAttribute('data-key')];
            })
            .ease('cubic-in-out')
            .styleTween('transform', animateNeedleUp)
            .transition()  // after the up animation completes, run the down needle animation
            .duration(function(){  // to find duration : avgRotationTime / 10 / 2, 10 for each tick mark, and 2 since the animation is split into up + down
                avgRotationTime = (animationDuration[this.getAttribute('data-key')] / numRotation);
                return avgRotationTime / 10;
            })  
            .ease('cubic-in-out')
            .styleTween('transform', animateNeedleDown)
            .each('end', function() {
                numAnimateCycle[this.getAttribute('data-key')]++;
                if(numAnimateCycle[this.getAttribute('data-key')] > (numRotation)) {
                    return;
                } else {
                    repeat();
                }
            })
    })();
}

/**
 * draws the 10 even marks for the pie to divide the spinner
 * also draws the center circle in the spinner 
 * @param  string   $id   the state abbreviation that is targeted to draw the guide for
 */
function drawGuides($id) {

    // appends a new svg group that we will use to spin + animate the guides
    var s = d3.select('#' + $id)
        .append('svg')
        .attr('class', 'spinner-svg spinner-svg-guides')
        .attr({'width': width, 'height': height}) 

    // draws group associated with the center path
    var group = s.append('g')
        .attr('class', 'arc guide')
        .attr('data-key', $id)
        .attr("transform", "translate(" + (width / 2 + 30)  + "," + (height / 2 - 10) + ")");

    // appends the corresponding path to creating the internal spinner
    //  data/credit for the path comes from http://www.nytimes.com/newsgraphics/2014/senate-model/
    group.append('path')
        .attr('d', 'M0,-20L0,-12M11.756,-16.18L7.053,-9.708M19.021,-6.18L11.413,-3.708M19.021,6.18L11.413,3.708M11.756,16.18L7.053,9.708M0,20L0,12M-11.756,16.18L-7.053,9.708M-19.021,6.18L-11.413,3.708M-19.021,-6.18L-11.413,-3.708M-11.756,-16.18L-7.053,-9.708')
        .attr('stroke', 'white')
        .style('fill', 'transparent')
        .attr('transform', 'scale(1.0)')

    // appends the circle that is at the center of the spinner (exists only for aesthetics)
    s.append('g')
        .attr('class', 'center')
        .append('circle')
            .attr('r', 3)
            .attr('cx', (width / 2 + 30))
            .attr('cy', (height / 2 - 9.5))
            .attr('fill', '#ddd')
}

/**
 * Iterates for each .race-result div and fills the colors in dependent on the race results
 * Called when the rotation for each arc ends
 */
function fillCircle($el) {
    var $chosen = '#' + $el.getAttribute('data-key');

    switch ($($chosen).attr('data-race-result')) {
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
    $($chosen).find('.race-result').css({
        "background-color": fillColor,
        "border": fillColor
    })

    // updates the race totals for each of the parties
    $('.race-total').each(function() {
        switch ($(this).hasClass('race-total--dem')) {
            case true:
                $(this).find('.race-total-value').text(raceTotals['democrat'])                
                break;
            case false:
                $(this).find('.race-total-value').text(raceTotals['republican'])      
                break;    
        }
    });
}

/**
 * Calculates the randomized delay of animation for each spinner
 * Value will generally be between 25 - 125 ms
 * @param  int  d  data of specific arc, though we are NOT using this value
 * @param  int  i  index of the arc that we are currently iterating over
 * @return int     time in ms of how long the delay should last
 */
function calculateDelay(d, i) {
    // if the index % 13 = 0, we know that we're iterating on the next arcs of the next spinner
    // therefore we want to set the delay to a new random number
    if(i % 4 === 0)  // mod by 4 since we have our 3 sections of the pie and our 1 arc for the guides
        randomDelay = (Math.floor(Math.random() * 10) + 1) * 45; 
    animationDelay[this.getAttribute('data-key')] = randomDelay;
    return randomDelay;
}

/**
 * Calculates the randomized time of spinning for each spinner
 * Value will generally be between 3500 - 5000ms 
 * @param  int  d  data of specific arc, though we are NOT using this value
 * @param  int  i  index of the arc that we are currently iterating over
 * @return int     time in ms of how long the spinning animation should last
 */
function calculateDuration(d, i) {
    if(i % 4 === 0)
        randomDuration = (Math.floor(Math.random() * 15) + 1) * durationStep + minTime // we want this to be between 3500-5000
    animationDuration[this.getAttribute('data-key')] = randomDuration;
    return randomDuration;
}

/**
 * Computes the keyframes between two points
 *     Makes sure that the ending rotational position of the spinner is accurate to the ticker
 * @param  int  d   data value of the arc that we are iterating on 
 * @param  int  i   index of the arc that is currently iterating over
 * @return tweenFunction that interpolates angles between the start/end point
 */
function angleTween(d, i) {
    // to calculate the end rotation of the spinner: 
    //  take the data of the section that was chosen (democrat: 40)
    //  270 - (data * 1.8) - (other data * 3.6)
    //  muiltiply the data by 3.6, add the starting point, add 270 and subtract half of the distance
    var angle = 360 * numRotation + offsetAngle[this.getAttribute('data-key')];
    var i = d3.interpolate(0, angle);
    return function(t) {
        return "translate(" + (width / 2 + 30) + "," + (height / 2 - 10)+ ")rotate(" + i(t) + ")";
    };
}

/**
 * Computes the keyframes between two points of the the needle ticking
 * @param  int  d   data value of the arc that we are iterating on 
 * @param  int  i   index of the arc that is currently iterating over
 * @return tweenFunction that interpolates angles between the start/end point
 */
function animateNeedleUp(d, i) {
    // to calculate the end rotation of the spinner: 0
    // we need to interpolate between two positions....
    // 0 and 90 degrees every 360 / 10 * time seconds 
    var i = d3.interpolate(0, -40); 
    return function(t) {
        return 'rotate(' + i(t) + 'deg)';
    };
}

function animateNeedleDown(d, i) {
    var i = d3.interpolate(-40, 0); 
    return function(t) {
        return 'rotate(' + i(t) + 'deg)';
    };
}

/**
 * Given a random integer, calculates the offset angle to rotate the spinner by
 *     in order for the chosen arc of the pie to be centered on the leftmost side
 * @param  object   d       representative of the entire state object 
 * @param  int      rand    a random integer between 1 and 100
 * @param  str      $id     the id representative of the spinner
 * @return {"party" : string, "angle" : int}      party, the political party; angle, the offset angle
 */
function calculateOffsetAngle(d, rand, $id) {
    var a;
    var party;

      // if democrat
    if (rand <= d.value[0].probability) {
        a = 270 - (d.value[0].probability * 1.8); // we want our slice to be centered at the 270 degree mark, so 270 - (percentage of pie * 360)
        party = "democrat"
    } // if republican
    else if (rand <= d.value[0].probability + d.value[1].probability) {
        a = 270 - (d.value[1].probability * 1.8) - (d.value[0].probability * 3.6)
        party = "republican"
    } // otherwise, if other
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