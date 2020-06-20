

var icon = document.getElementById("view-image");
function changeView() {

    //change to global view
    if (icon.src.endsWith("images/globe.png")) {
        icon.src = 'images/germany.png';
        document.getElementById("right-col-2").innerHTML = "> compare Countries";

        document.getElementById("confirmedCases").className = "tablinks active";
        document.getElementById("Confirmed Cases").style.display = "block";
        document.getElementById("recovered").className = "tablinks";
        document.getElementById("deaths").className = "tablinks";

        updateCompareGraph("global");
        
    }

    //change to germany view
    else if (icon.src.endsWith('images/germany.png')) {
        icon.src = 'images/globe.png';
        countryName1 = document.getElementById("country1").value = "Germany";
        document.getElementById("right-col-2").innerHTML = "Germany";
        document.getElementById("right-col-3").innerHTML = "Reproduction Rate";


        document.getElementById("death").className = "tablinks";
        document.getElementById("Death").style.display = "block";
        document.getElementById("fallzahl").className = "tablinks active";
        document.getElementById("pro100000").className = "tablinks";

        updateCompareGraph("germany");
        
    }


    $('.germany, .global').toggle();
}

//start in germany, therefore global hidden
$(function () {
    $('.global').hide();
});



