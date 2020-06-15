function changeView() {
        Image = document.getElementById("ViewImage");
        if (Image.src.endsWith("images/globe.png")) {Image.src = 'images/germany.png';}
        else if (Image.src.endsWith('images/germany.png')){ Image.src = 'images/globe.png';}
    
}