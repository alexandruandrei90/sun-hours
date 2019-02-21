let util = {
  latSlider: document.getElementById("lat"),
  lonSlider: document.getElementById("lon"),
  latLon: document.getElementById("latLon"),
  lat: document.getElementById("lat").value,
  lon: document.getElementById("lon").value,
  calendarArray: [], // will be an array of Date objects. Used to create plotDataArray
  plotDataArray: [], // will be an array used by MetricsGraphics, contains date object, sunrise and sunset date objects
}

let logic = {};
let display = {};

function displayLatLon () {
  util.latLon.innerHTML = "Lat: " + util.latSlider.value + " Lon: " + util.lonSlider.value;
}

function createDateArray (arrayArg) {
  let currentDate = new Date (2019, 0, 1);
   for (i = 0; i < 365; i++) {
    arrayArg[i] = new Date(currentDate);
    currentDate = new Date (new Date(currentDate).setDate(new Date(currentDate).getDate()+1));
  }
  return arrayArg;
}

devFunctions = {
	makePlotDataArray: function() { //will be used by MetricsGraphics as the data source
		for (i = 0; i < 365; i++) {
      if (luxon.DateTime.fromJSDate(sunFunctions.sunriseArray[i]).toMillis().toString() === "NaN"
        || luxon.DateTime.fromJSDate(sunFunctions.sunsetArray[i]).toMillis().toString() === "NaN") {
          util.plotDataArray[i] = {
            //Specify sunrise and sunset even when dead is set to true!
            date : util.calendarArray[i],
            sunrise : 0,
            sunset : 0,
            missing: true,
          };
      } else {
        util.plotDataArray[i] = {
          date : util.calendarArray[i],
          sunrise : luxon.DateTime.fromJSDate(sunFunctions.sunriseArray[i]).ts,
          sunset : luxon.DateTime.fromJSDate(sunFunctions.sunsetArray[i]).ts,
        };
      }
		}
    makeChart(util.plotDataArray);
	}
}

makeChart = function (a) {
  MG.data_graphic({
	//	title: "Line Chart",
		description: "I am a description",
    data: a,
    width: 400,
		target: document.getElementById('metric-graph'),
		x_accessor: 'date',
    y_accessor: ['sunrise', 'sunset'],
    missing_is_hidden_accessor: 'missing',
    aggregate_rollover: true,
    show_rollover_text: false,
    missing_is_hidden: true,
    animate_on_load: true,
    brush: "x",
    xax_count: 12,
    yax_count: 2,
    xax_format: d3.timeFormat('%b'),
    yax_format: d3.timeFormat("%H:%M"),
    min_y_from_data: true,
    rollover_time_format: "%b %e",
    mouseover: function(d, i) {
      document.getElementById("times").innerHTML = "Sunrise: " + d3.timeFormat("%H:%M")(d.values[0].sunrise)
                                                 + "<br>"
                                                 + "Sunset: " + d3.timeFormat("%H:%M")(d.values[0].sunset);
    },
	});
}

let sunFunctions = {
  sunriseArray: [],
  sunsetArray: [],
  getTimeArrays: function(lat, lon) { //we start here, and continue by calling c
    let endOfYear = new Date(2019, 11, 31);
    currentDay = new Date(2019, 0, 1)
    for (i = 0; currentDay <= endOfYear; i++) {
      let sunrise = window.SunCalc.getTimes(currentDay, lat, lon).sunrise;
      let sunset = window.SunCalc.getTimes(currentDay, lat, lon).sunset;
      
      currentDay = luxon.DateTime.fromMillis(currentDay.setDate(currentDay.getDate() + 1)).toJSDate();
      
      this.sunriseArray[i] = new Date(sunrise - currentDay); // results in timestamp of difference between sunrise time and currentDay
      this.sunsetArray[i] = new Date(sunset - currentDay);
    }
    devFunctions.makePlotDataArray();
  }
}

util.calendarArray = createDateArray(util.calendarArray);


function createGraphic () {
  util.lat = +document.getElementById("lat").value,
  util.lon = +document.getElementById("lon").value,
  sunFunctions.getTimeArrays(util.lat, util.lon);
}

createGraphic();