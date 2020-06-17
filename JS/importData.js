var urls = {
    states: "data/germany.geo.json",
    countries:"data/globe.geo.json",
    coronaStates: "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronafälle_in_den_Bundesländern/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json",
    coronaWorldConfirmed: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv",
    coronaWorldRecovered: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv",
    coronaWorldDeaths: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
};

function sameCountry(c1, c2) {
    return (c1["Country/Region"] == c2["Country/Region"]);
}

function sumUpStates(dataUnsorted) {
    var sorted = [];
    sorted.push(dataUnsorted[0]);
    for (var i = 1; i < dataUnsorted.length; i++) {
        if (!sameCountry(sorted[sorted.length - 1], dataUnsorted[i])) {
            sorted.push(dataUnsorted[i]);
            var s = sorted[sorted.length - 1];
            s["Province/State"] = null;
        }
        else {
            for (var x in dataUnsorted[i]) {
                if (x != "Province/State" && x != "Country/Region" && x != "Lat" && x != "Long") {
                    var old = sorted[sorted.length - 1];
                    var added = dataUnsorted[i];
                    old[x] = parseInt(old[x]) + parseInt(added[x]);
                }
            }
        }
    }
    return sorted;

}