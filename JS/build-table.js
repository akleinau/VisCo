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
  createTable(gfg, data_length, tab);

  function compareSecondColumn(a, b) {
    if (a[1] === b[1]) {
      return 0;
    }
    else {
      return (a[1] > b[1]) ? -1 : 1;
    }
  }
}

function createTable(data, length, tab) {

  var i = 0, rowEl = null,
    tableEl = document.createElement("table");


  tableEl.setAttribute("class", "data-table");
  
  // create 10 table rows, each with two cells
  for (i = 0; i <= length - 1; i++) {
    rowEl = tableEl.insertRow();  // DOM method for creating table rows
    rowEl.insertCell().textContent = data[i][0];
    rowEl.insertCell().textContent = data[i][1];
  }
  document.getElementById(tab).appendChild(tableEl);
}