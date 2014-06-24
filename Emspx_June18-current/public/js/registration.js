$(window).load(function() {    
    $('#companyname, #noofemp, #lineofbusiness, #address, #city, #country, #countrycode, #telephone').change(function() {
      /* if ($(this).val().length === 0)
          $('.next').hide();
       else
          $('.next').show();*/
		  if ($('#companyname').val() != "" && $('#noofemp').val() != "" && $('#lineofbusiness').val() != ""  && $('#address').val() != "" && $('#city').val() != "" && $('#country').val() != "-1" && $('#countrycode').val() != "" && $('#telephone').val() != "") {
			$('.next').show();
		  } else {
			$('.next').hide();
		  }
    });
	
	
   
$('#fname, #lname, #email, #username, #password1, #password2').change(function() {
      /* if ($(this).val().length === 0)
          $('.next').hide();
       else
          $('.next').show();*/
		  if ($('#fname').val() != "" && $('#lname').val() != "" && $('#email').val() != ""  && $('#username').val() != "" && $('#password1').val() != "" && $('#password2').val() != "") {
			$('#step1Next').show();
		  } else {
			$('#step1Next').hide();
		  }
    });
	});
	
	
function disableSubmit() {
  document.getElementById("register").disabled = true;
 }

  function activateButton(element) {

      if(element.checked) {
        document.getElementById("register").disabled = false;
       }
       else  {
        document.getElementById("register").disabled = true;
      }

  }