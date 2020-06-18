var selectedCountry;

function openTab(evt, Case) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(Case).style.display = "block";
  evt.currentTarget.className += " active";
}

/* ---------------------------------------------------------------------------------------------- */
//table global
function parse(url, tab) {
  Papa.parse(url, {
    download: true,
    complete: function (results) {
      //console.log(results);
      var data = results.data;
      renderDataset(data, tab);
      //console.log(data);
    }
  });
}


function renderDataset(dataset, tab) {

  var data = { country: new Array(), number: new Array() };
  for (i = 0; i < dataset.length - 2; i++) {
    data.country[i] = dataset[i + 1][1];
  }

  for (i = 0; i < dataset.length - 2; i++) {
    data.number[i] = parseInt(dataset[i + 1][dataset[i + 1].length - 1]);
  }

  var gfg = new Array(2);

  for (var j = 0; j < data.country.length; j++) {
    var asdf = [data.country[j], data.number[j]];
    gfg[j] = asdf;
  }

  var data_length = 0;

  data_length = data.country.length;

  gfg.sort(compareSecondColumn);

  deleteMultipleEntries(gfg, data_length, tab);   

  function compareSecondColumn(a, b) {
    if (a[1] === b[1]) {
      return 0;
    }
    else {
      return (a[1] > b[1]) ? -1 : 1;
    }
  }
}


function deleteMultipleEntries(dataUnsorted, length, tab){
    var sorted = dataUnsorted;    
    // console.log(dataUnsorted[1][0]);
    var n = 0;
    var k = 0;
        for (i = 0; i < length - 1; i++){
          sorted[n][0] = dataUnsorted[i][0];
          sorted[n][1] = dataUnsorted[i][1];
          k = 0;
          for (j = i + 1; j < length - 1; j++){
            if (dataUnsorted[i][0] == dataUnsorted[j][0]){
              sorted[n][1] += dataUnsorted[j][1];
              dataUnsorted[j].splice(0,2);
            }             
          }
          n++;
        }
  createTable(sorted, length, tab);
}


function createTable(data, length, tab) {

  var i = 0, rowEl = null,
    tableEl = document.createElement("table");


  tableEl.setAttribute("class", "data-table");
  tableEl.setAttribute("id", "table1");


  // create 10 table rows, each with two cells
  for (i = 0; i <= length - 1; i++) {
    if (data[i][0] != undefined){
      rowEl = tableEl.insertRow();  // DOM method for creating table rows
      rowEl.insertCell().textContent = data[i][0];
      rowEl.insertCell().textContent = data[i][1];
      rowEl.addEventListener("click", function () {

        var input = "country1";
        for (i = 1; i <= 5; i++) {
          if (i == 5) break;
          else if (document.getElementById("country" + i).value == "") {
            input = "country" + i
            break;
          }
        }
        var c = this.innerText.replace(/[0-9]/g, '').replace(/\s+$/, '');
        var jsonCountry = selectCountry(this.innerText.replace(/[0-9]/g, '').replace(/\s+$/, ''));
        transitionGlobe(jsonCountry);
        fillInput(input, this.innerText.replace(/[0-9]/g, ''));
      });
    }
  }
  document.getElementById(tab).appendChild(tableEl);
}

/* ---------------------------------------------------------------------------------------------- */
// table Germany
d3.queue()
    .defer(d3.json, urls.states)
    .defer(d3.json, urls.coronaStates)
    .await(buildTableGermany);

    
    function buildTableGermany(err, collection, coronaData){
    
      console.log(coronaData);
      var ft = coronaData.features;
      var state_id = new Array;
      var state_death = new Array;
      var state_fallzahl = new Array;
      var state_fallzahl_pro_100000 = new Array;
    
      for (var i = 0; i < ft.length; i++) {
    
          state_id[i] = ft[i].attributes.LAN_ew_GEN;        
          state_death[i] = ft[i].attributes.Death;
          state_fallzahl[i] = ft[i].attributes.Fallzahl;
          state_fallzahl_pro_100000[i] = ft[i].attributes.faelle_100000_EW;
      }
    
      var death = new Array(2);
      var fallzahl = new Array(2);
      var fallzahl_pro_100000 = new Array(2);
      
      for (var j = 0; j < state_id.length; j++) {
          var asdf = [state_id[j], state_death[j]];
          death[j] = asdf;
      } 
    
      for (var j = 0; j < state_id.length; j++) {
          var asdf = [state_id[j], state_fallzahl[j]];
          fallzahl[j] = asdf;
      } 
    
      for (var j = 0; j < state_id.length; j++) {
          var asdf = [state_id[j], Math.round(state_fallzahl_pro_100000[j])];
          fallzahl_pro_100000[j] = asdf;
      } 
      dataSort(death, "death");
      dataSort(fallzahl, "fallzahl");
      dataSort(fallzahl_pro_100000, "pro100000");
      
    }
    
    function dataSort(array2D, tab){
    
      var data_length = 0;
    
      data_length = 16;
    
      array2D.sort(compareSecondColumn);
      createTableGermany(array2D, data_length, tab);
    
      function compareSecondColumn(a, b) {
          if (a[1] === b[1]) {
            return 0;
          }
          else {
            return (a[1] > b[1]) ? -1 : 1;
          }
      }  
      console.log(array2D); 
    }
      
    function createTableGermany(data, length, tab) {
    
    var i = 0, rowEl = null,
      tableEl = document.createElement("table");
    
    tableEl.setAttribute("class", "data-table");
    
    for (i = 0; i <= length - 1; i++) {
      rowEl = tableEl.insertRow();  // DOM method for creating table rows
      rowEl.insertCell().textContent = data[i][0];
      rowEl.insertCell().textContent = data[i][1];
    }
    document.getElementById(tab).appendChild(tableEl);
    }
    