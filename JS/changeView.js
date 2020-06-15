function changeView() {
    Image = document.getElementById("view-image");
    if (Image.src.endsWith("images/globe.png")) {
        Image.src = 'images/germany.png';

       /*  globalObjects = document.getElementsByClassName("global");

        for (var i = 0; i < globalObjects.length; i ++) {
            globalObjects[i].style.visibility = 'visible';
        }

        germanyObjects = document.getElementsByClassName("germany");

        for (var i = 0; i < germanyObjects.length; i ++) {
            germanyObjects[i].style.visibility = 'hidden';
        } */

    }
    else if (Image.src.endsWith('images/germany.png')) {
        Image.src = 'images/globe.png';
        
                    /* globalObjects = document.getElementsByClassName("global");
        
                    for (var i = 0; i < globalObjects.length; i ++) {
                        globalObjects[i].style.visibility = 'hidden';
                    }
        
                    germanyObjects = document.getElementsByClassName("germany");
        
                    for (var i = 0; i < germanyObjects.length; i ++) {
                        germanyObjects[i].style.visibility = 'visible';
                    } */}

    }

    $(function(){
        $('.global').hide();
            $('#change-view-button').click(function(){
                $('.germany, .global').toggle();
            });
        
        });