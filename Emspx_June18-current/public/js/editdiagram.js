 var stage,Node,Segment,NODE_DIMENSIONS;

 var circleArray={};
 var segmentArray={};
 var imagesArray=new Array();


 
(function($, window) {

      
      Node = window.Node;
      Segment = window.Segment;

   NODE_DIMENSIONS = {
    w: 50,
    h: 50
  };



  initialize();

}(jQuery, window));


function initialize() {
	 stage = $('#stage');
	 $.ajax({
	      type: "GET",
	      url: "http://localhost:80/sample",
	      dataType: "json",
	      async:false,
	      success: function (data) {
		  
	    	  var result = JSON.stringify(data);
	    	  console.log(result);
	    	 
	    	  var result1=JSON.parse(result);
	    	 
	    	  console.log("images"+result1[0].images);
	    	 
	    	  
	    	  

	    	  for(var i in result1[0].images)
	    		  {
	    		 
	    		 
	    		  imagesArray.push(result1[0].images[i]);
	    		  var titleName=imagesArray[i];
	    		/*  console.log(titleName);*/
	    		   var node = new Node({
	    			      title: titleName,
	    			      stage: stage,
	    			      w: NODE_DIMENSIONS.w,
	    			      h: NODE_DIMENSIONS.h,
	    			      x: 10*i*10,
	    			      y: 1*i*20,
	    			      events: {
	    			        click: function() {
	    			          //window.console.log(this);
	    			        }
	    			      }
	    			      }).attach();
	    		   
	    		      var title=node.title;
	    		      //Storing object with respect to title
	    		      circleArray[title]=node;
	    		      
	    		     
	    		  }
	    	  
	    	  for(var i in result1[0].segments)
    		  {
	    		/*  console.log('i in segment'+i);
	    		  console.log('Attempt is'+result1[0].segments[i]);*/
	    		  segmentArray[i]=result1[0].segments[i];
	    		  console.log('segments'+result1[0].segments);
	    	
    		  }
	    	  
	    	     for (var prop in segmentArray) {
	    	    	 console.log('prop is'+prop);
	    	    	 console.log('segment Array'+segmentArray[prop].origin);
	    	    	 console.log('segment Array'+segmentArray[prop].destination);
	        	 /* if (circleArray.hasOwnProperty(prop)) { */
	        	  // or if (Object.prototype.hasOwnProperty.call(obj,prop)) for safety...
	        	    //alert("prop: " + prop + " value: " + circleArray[prop]);
	        	 
	        	    new Segment({
	        	        h: 5,
	        	        stage: stage,
	        	        origin: circleArray[segmentArray[prop].origin],
	        	        destination: circleArray[segmentArray[prop].destination]
	        	      }).attach();
	        	  }
	      }//Sucess
	        	
	 }); //Ajax call
}
	
	/* imagesArray.push("PatientIdentifiedOnArrival");
	 imagesArray.push("AutoCheckNotification");
	 imagesArray.push("PersonalizedWelcome");
	 imagesArray.push("PatientSchedulerSystem");
	 
	 relationArray.push("AutoCheckNotification");
	 
	 relationArray.push("PersonalizedWelcome");
	
	
    stage = $('#stage');
    
    for(var i=0;i<imagesArray.length;i++)
   {
      var node = new Node({
      title: imagesArray[i],
      stage: stage,
      w: NODE_DIMENSIONS.w,
      h: NODE_DIMENSIONS.h,
      x: 100+i*10,
      y: 200+i*20,
      events: {
        click: function() {
          window.console.log(this);
        }
      }
      }).attach();
      
      var title=node.title;
      circleArray[title]=node;
    
     // circleArray.push(node);

     
   }
    var relation1=relationArray[0];
    var relation2=relationArray[1];*/
   
  /*   new Segment({
         h: 5,
         stage: stage,
         origin: circleArray[relation1],
         destination: circleArray[relation2]
       }).attach();*/
    // }


/*    for (var prop in circleArray) {
    	  if (circleArray.hasOwnProperty(prop)) { 
    	  // or if (Object.prototype.hasOwnProperty.call(obj,prop)) for safety...
    	    alert("prop: " + prop + " value: " + circleArray[prop]);
    	    
    	    new Segment({
    	        h: 5,
    	        stage: stage,
    	        origin: circleArray[prop],
    	        destination: circleArray[prop]
    	      }).attach();
    	  }
    	}*/
   /* var jsonArray={};
    for (var prop in circleArray) {
  	  if (circleArray.hasOwnProperty(prop)) { 
  		  
  	    var keyname=circleArray[prop].title;
  	    alert(keyname);
    	jsonArray[keyname]=circleArray[prop];
    	
    }
    }
    alert(jsonArray.PatientIdentifiedOnArrival);
    alert(jsonArray.AutoCheckNotification);
    alert(jsonArray.PersonalizedWelcome);*/
     
    
  
