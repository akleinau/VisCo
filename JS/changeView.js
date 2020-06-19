function changeView() {
    Image = document.getElementById("view-image");
    //change to global view
    if (Image.src.endsWith("images/globe.png")) {
        Image.src = 'images/germany.png';
        document.getElementById("right-col-2").innerHTML = "compare Countries";



        document.getElementById("confirmedCases").className = "tablinks active";
        document.getElementById("Confirmed Cases").style.display = "block";
        document.getElementById("recovered").className = "tablinks";
        document.getElementById("deaths").className = "tablinks";

        
       
    }

    //change to germany view
    else if (Image.src.endsWith('images/germany.png')) {
        Image.src = 'images/globe.png';
        countryName1 = document.getElementById("country1").value = "Germany";
        document.getElementById("right-col-2").innerHTML = "Germany";

        document.getElementById("death").className = "tablinks active";
        document.getElementById("Death").style.display = "block";
        document.getElementById("fallzahl").className = "tablinks";
        document.getElementById("Fallzahl").style.display = "hide";
        document.getElementById("pro100000").className = "tablinks";
        document.getElementById("Pro100000").style.display = "hide";

        
    }

    updateCompareGraph();
    $('.germany, .global').toggle();
    document.getElementById("data-type").value = "confirmed";

}


//start in germany, therefore global hidden
$(function () {
    $('.global').hide();
});


