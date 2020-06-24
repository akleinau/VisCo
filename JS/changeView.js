

var icon = document.getElementById("view-image");
function changeView() {

    //change to global view
    if (icon.src.endsWith("images/globe.png")) {
        icon.src = 'images/germany.png';
        document.getElementById("germany-compare").innerHTML = "Compare Countries";

        document.getElementById("reproduction-name-gl").innerHTML = "";
        document.getElementById("reproduction-name-gl").id = "reproduction-name-temp"
        document.getElementById("reproduction-name").id = "reproduction-name-gl"
        document.getElementById("reproduction-name-temp").id = "reproduction-name"
        document.getElementById("reproduction-name-gl").innerHTML = "Reproduction Rate";
        document.getElementById("reproduction-name-gl").classList.add("graph-name")

        if (toggled === false) {
            document.getElementById('reproduction-name-gl').style.backgroundColor = "#e0e0e0";
            document.getElementById('reproduction-name-gl').style.color = "#505050";
            document.getElementById("reproduction-name-gl").style.border = "thin solid #4b4b4b";
        }
        else {
            document.getElementById('germany-compare').style.backgroundColor = "#e0e0e0";
            document.getElementById('germany-compare').style.color = "#505050";
            document.getElementById("germany-compare").style.border = "thin solid #4b4b4b";
        }


        document.getElementById("confirmedCases").className = "tablinks";
        document.getElementById("confirmedCases").click();
        document.getElementById("Confirmed Cases").style.display = "block";
        document.getElementById("recovered").className = "tablinks";
        document.getElementById("deaths").className = "tablinks";

        updateCompareGraph("global");

    }

    //change to germany view
    else if (icon.src.endsWith('images/germany.png')) {
        icon.src = 'images/globe.png';
        countryName1 = document.getElementById("country1").value = "Germany";
        document.getElementById("germany-compare").innerHTML = "Germany";

        document.getElementById("reproduction-name-gl").classList.remove("graph-name")
        document.getElementById("reproduction-name-gl").innerHTML = "";
        document.getElementById("reproduction-name-gl").id = "reproduction-name-temp"
        document.getElementById("reproduction-name").id = "reproduction-name-gl"
        document.getElementById("reproduction-name-temp").id = "reproduction-name"
        document.getElementById("reproduction-name-gl").innerHTML = "Reproduction Rate";

        document.getElementById('germany-compare').style.backgroundColor = "#505050";
        document.getElementById('germany-compare').style.color = "#e0e0e0";
        document.getElementById("germany-compare").style.border = "none";
        document.getElementById("germany-compare").style.borderBottom = "thin solid #e0e0e0";

        document.getElementById('reproduction-name-gl').style.backgroundColor = "#505050";
        document.getElementById('reproduction-name-gl').style.color = "#e0e0e0";
        document.getElementById("reproduction-name-gl").style.border = "none";
        document.getElementById("reproduction-name-gl").style.borderBottom = "thin solid #e0e0e0";


        document.getElementById("death").className = "tablinks";
        document.getElementById("Fallzahl").style.display = "block";
        document.getElementById("fallzahl").className = "tablinks";
        document.getElementById("fallzahl").click();
        document.getElementById("pro100000").className = "tablinks";

        updateCompareGraph("germany");

    }


    $('.germany, .global').toggle();
}

//start in germany, therefore global hidden
$(function () {
    $('.global').hide();
});


