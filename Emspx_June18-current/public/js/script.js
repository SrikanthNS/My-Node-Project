$( document ).ready(function() {
    console.log( "ready!" );
	//loadContentPage('main');	
});

// $("#side-menu li").on("click", "a", function() {
    // $("#side-menu li a").removeClass("active");
    // $(this).addClass("active");
// });

$(".nav-list ul li").hide();

$("#side-menu li").on("click", "a", function() {

    if ($(this).hasClass("tree-toggle")) {
        $('#side-menu ul').hide();
        $(this).next().show();
    } else if (!$(this).parents().closest("li").find("a").hasClass("tree-toggle")) {
        $('#side-menu ul').hide();
    }

    $("#side-menu li a").removeClass("active");
    $(this).addClass("active");
    $(this).parents().closest("li").find("a.tree-toggle").addClass("active");
});



function getXMLHTTP() {
    var xmlhttp;

    if(window.XMLHttpRequest){ //For Firefox, Mozilla, Opera, and Safari
        xmlhttp = new XMLHttpRequest();
    }
    else if (window.ActiveXObject){ //For ie
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        if (!xmlhttp){
            xmlhttp=new ActiveXObject("Msxml2.XMLHTTP");
        }
    }
    return xmlhttp;
}

function loadContentPage(filename){
 var req = getXMLHTTP();
    if (req)
    {
        //function to be called when state is changed
        req.onreadystatechange = function()
        {
            //when state is completed i.e 4
            if (req.readyState == 4)
            {
                // only if http status is "OK"
                if (req.status == 200)
                {                   
                    $('#pageContentHTML').html(req.responseText);
                }
                else
                {
                    alert("There was a problem while using XMLHTTP:\n" + req.statusText);
                }
            }
        }
        req.open("GET", filename+".html", true);
        req.send();
    }

}


$('.tree-toggle').click(function () {
	$(this).parent().children('ul.tree').toggle(200);
});
$('.tree-toggle').trigger('click');