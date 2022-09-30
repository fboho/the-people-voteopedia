//GLOBAL VARIABLES
//TODO: Clean this up

//Pull in external data
let data = JSON.parse(statedata)
var weights = JSON.parse(initialweights)
var weights_translate = JSON.parse(weightstranslate)
let stateList = JSON.parse(statetoinitial)
let initialList = JSON.parse(initialtostate)
let reportCard = JSON.parse(reportcard)

//Define map and map variables
var polygonSeries;
let reportCardShow = JSON.parse(JSON.stringify(reportCard));
let grades = {}

//Helper functions
function calculateGrades(){
   let state_grades = []
   Object.entries(stateList).forEach(([k,v]) => {
      let stateInfo = data[k]
      let aggregate = 0
      Object.entries(stateInfo).forEach(([k2,v2]) => { 
          aggregate += (parseInt(v2) * parseInt(weights[k2]))
      })
      state_grades.push([k, aggregate])
  })
  state_grades.sort(function(a,b){return a[1]-b[1]});
  console.log(state_grades)
  for (let index = 0; index < state_grades.length; index++) {
      const state = state_grades[index];
      if(index<16){
        grades[state[0]] = 'C'
      }
      else if (index<33){
        grades[state[0]] = 'B'
      }
      else if (index<50){
        grades[state[0]] = 'A'
      }
  }
}

//Convert from json to Amcharts friendly input
function createMapData(){
    let res = []
    calculateGrades()
    Object.entries(stateList).forEach(([k,v]) => {
        let obj = {}
        let stateInfo = data[k]
        let aggregate = 0
        console.log(k)
        Object.entries(stateInfo).forEach(([k2,v2]) => { 
            // console.log(parseInt(weights[k2])) 
            // console.log(parseInt(v2)) 
            aggregate += (parseInt(v2) * parseInt(weights[k2]))
            // console.log(aggregate)
        })
        obj['id'] = 'US-' + v
        obj['value'] = aggregate
        console.log(v)
        obj['grade'] = grades[k]
        // console.log(obj)
        res.push(obj)
    })
    polygonSeries.data = res
    return
}

//Update chart data when weights change
function updateChart(){
    Object.entries(weights).forEach(([k,v]) => { 
        console.log(k)
        id = weights_translate[k]
        console.log(id)
        console.log(document.getElementById(id))
        console.log(document.getElementById(id).value)
        if(document.getElementById(id).value){
            weights[k] = parseInt(document.getElementById(id).value)
        }
        else{
            weights[k] = 0
        }
    })
    createMapData()
    return
}

//Reset chart weights
function resetChart(){
    Object.entries(weights).forEach(([k,v]) => { 
        weights[k] = 5
    })
    createMapData()
    return
}

//Create HTML for the side bar / settings section
function createWeightsHTML(){
    let html = '<h2>Voting Rights Map: ' + 'Settings' + '</h2>'
    html += '<hr>'
    html += '<form class="needs-validation" novalidate>'
    html += '<input type="checkbox" id="equal" name="equal" value="equal" checked=true><label for="equal" style="margin-left:0.5rem">Set all weights equal </label><br></br>'
    let showJSON = reportCard['FL']
    console.log(showJSON)
    Object.entries(showJSON).forEach(([k,v]) => { 
      if(k!="Grade") {
         html += '<div class="form-category" id="' + k + '"><h3><b>' + k + '</b></h3>'  
         Object.entries(v).forEach(([k2,v2]) => { 
            if (k2!='Total Score'){
                  html += '<div class="form-group">'
                  html += '<label for="uname">'+ k2 +'</label>'
                  html += '<input type="text" class="form-control" id="' + k2 + '"' + 'placeholder="Enter weight" name="uname" required>'
                  html += '<div class="valid-feedback">Valid.</div>'
                  html += '<div class="invalid-feedback">Please fill out this field.</div>'
                  html += '</div>'
            }
         })
         html += '<br></div>'
      }
    })

    html += '<button type="button" onclick="updateChart()" class="btn btn-primary" style="margin: 15px;">Submit</button>'
    html += '<button type="button" onclick="resetChart()" class="btn btn-primary" style="margin: 15px;">Reset</button>'
    html += '</form>'
    document.getElementById('weights-html').innerHTML = html;
}

//Updates the side bar whenever a state is clicked
function updateStateHTML(data){
    let state = data.id.split('-')[1];
    let showJSON = reportCard[state]
    let statename = initialList[state]
    let html = '<h2>Voting Rights Map: ' + statename + '</h2>'
    html += '<br>'
    html += '<p> <b>Grade</b>: ' + grades[statename] + ' (for selected aspects) </p>'
    html+= '<br>'
    html += '<hr size="2" width="90%" color="white"> '
    html += '<br>'
    let counter = 0
    Object.entries(showJSON).forEach(([k,v]) => { 
      if(k!="Grade") {
         html += '<h3><b>' + k + '</b></h3>'  
         Object.entries(v).forEach(([k2,v2]) => {  
            if (k2!='Total Score'){
                  html += '<p><b>' + k2 + '</b> ' + v2 + '</p>'
            }
            counter += 1
         })
         html += '<br>'
      }
    })
   html+= '<br>'
   html += '<hr size="2" width="90%" color="white"> '
   html += '<br>'
   html += '<h3><b>' + 'Take Action!' + '</b></h3>' 
   html += '<a href="http://www.votewell.net/state.htm" style="color: white; text-decoration: underline;">'
   html += '<p>' + 'Get connected with organizations making a difference!' + '<p></a>' 
   html += '<br>'
   document.getElementById('state-body').innerHTML = html;
   $('#info-form').modal();

}

//Create chart function
am4core.ready(function() {

    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create map instance
    chart = am4core.create("chartdiv", am4maps.MapChart);

    // Set map definition
    chart.geodata = am4geodata_usaLow;

    // Set projection
    chart.projection = new am4maps.projections.AlbersUsa();

    // Create map polygon series
    polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

    polygonSeries.imagesSettings = {
        "selectable": true
    }
    polygonSeries.listeners = [{
        "event": "clickMapObject",
        "method": function(ev) {
          alert('clicked on ' + ev.mapObject.title)
        }
    }
    ]

    //Set min/max fill color for each area
    polygonSeries.heatRules.push({
        property: "fill",
        target: polygonSeries.mapPolygons.template,
        max: am4core.color('#F5E7B5'),
        min: am4core.color('#432A2B')
    });

    // Make map load polygon data (state shapes and names) from GeoJSON
    polygonSeries.useGeodata = true;

    //Create map data
    createMapData()
    
    // Set up heat legend
    let heatLegend = chart.createChild(am4maps.HeatLegend);
    heatLegend.series = polygonSeries;
    heatLegend.align = "right";
    heatLegend.valign = "bottom";
    heatLegend.width = am4core.percent(20);
    heatLegend.marginRight = am4core.percent(4);
    heatLegend.minValue = 0;
    heatLegend.maxValue = 40000000;

    // Set up custom heat map legend labels using axis ranges
    var minRange = heatLegend.valueAxis.axisRanges.create();
    minRange.value = heatLegend.minValue;
    minRange.label.text = "less fair";
    var maxRange = heatLegend.valueAxis.axisRanges.create();
    maxRange.value = heatLegend.maxValue;
    maxRange.label.text = "more fair";

    // Blank out internal heat legend value axis labels
    heatLegend.valueAxis.renderer.labels.template.adapter.add("text", function(labelText) {
        return "";
    });

    // Configure series tooltip
    var polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}: {grade}";
    polygonTemplate.nonScalingStroke = true;
    polygonTemplate.strokeWidth = 0.5;
    polygonTemplate.clickable = true;
    polygonTemplate.events.on("hit", function(ev) {
        var data = ev.target.dataItem.dataContext;
        console.log(data)
        updateStateHTML(data)
    });
    // Create hover state and set alternative fill color
    var hs = polygonTemplate.states.create("hover");
    hs.properties.fill = am4core.color("#3100F9");

}); // end am4core.ready()

//Initialize the weights
createWeightsHTML()
