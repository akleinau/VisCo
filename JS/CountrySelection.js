function updateCountrySelection(input, event) {

    if (!(event.keyCode === 13 || event.keyCode === 9)) {

        d3.csv(urls.coronaWorldConfirmed, d3.autoType, function (dataUnsorted) {

            var data = sumUpStates(dataUnsorted);

            var ul = document.getElementById(input + "List");
            ul.innerHTML = "";
            ul.style.display = "block";


            filter = document.getElementById(input).value.toUpperCase();

            for (i = 0; i < data.length; i++) {
                d = data[i];
                if (d["Country/Region"].toUpperCase().indexOf(filter) == 0) {
                    var li = document.createElement("li");
                    li.appendChild(document.createTextNode(d["Country/Region"]));
                    li.addEventListener("click", function () { fillInput(input, this.innerText) });
                    ul.appendChild(li);
                }
            }

        });
    }
    else {
        hideLists();
        updateCompareGraph();
    }

}

function fillInput(input, value) {
    document.getElementById(input).value = value;
    var ul = document.getElementById(input + "List");
    ul.style.display = "none";
    updateCompareGraph();
    hideLists();
}

function hideLists() {
    document.getElementById("country1List").style.display = "none";
    document.getElementById("country2List").style.display = "none";
    document.getElementById("country3List").style.display = "none";
    document.getElementById("country4List").style.display = "none";
}