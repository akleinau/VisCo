function changeView() {
    Image = document.getElementById("view-image");
    //change to germany view
    if (Image.src.endsWith("images/globe.png")) {
        Image.src = 'images/germany.png';

    }

    //change to global view
    else if (Image.src.endsWith('images/germany.png')) {
        Image.src = 'images/globe.png';
        
    }

     $('.germany, .global').toggle();

    }


    //start in germany, therefore global hidden
    $(function(){
        $('.global').hide();
        });