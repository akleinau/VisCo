function changeView() {
    Image = document.getElementById("view-image");
    //change to global view
    if (Image.src.endsWith("images/globe.png")) {
        Image.src = 'images/germany.png';
        document.getElementById("right-col-2").innerHTML = "compare Countries";
    }

    //change to germany view
    else if (Image.src.endsWith('images/germany.png')) {
        Image.src = 'images/globe.png';
        countryName1 = document.getElementById("country1").value = "Germany";
        document.getElementById("right-col-2").innerHTML = "Germany";
    }

    updateCompareGraph();
    $('.germany, .global').toggle();
    document.getElementById("data-type").value = "confirmed";
}


//start in germany, therefore global hidden
$(function () {
    $('.global').hide();
});