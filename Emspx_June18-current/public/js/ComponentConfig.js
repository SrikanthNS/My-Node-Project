$(document).ready(function() {

	var sdnApplicationInfoVal;
	var sdnPriorityVal;
	var emailSMTPVal;
	var smsNotificationCountryVal;
	var smsNotificationGateWayVal;
	var imageGalleryInfoVal;
	var imageGalleryTypeInfoVal;
	var imageGalleryAutoplayInfoVal;

	var videoGallerysourceInfoVal;
	var videoGalleryTypeInfoVal;
	var videoGalleryAutoplayInfoVal;
	var videoPlayerSourceInfoVal;
	var contentFlashInfoVal;
	var contentFlashGalleryAutoInfoVal;
	var sfdcAccountInfoVal;
	var adBannervideoInfoVal;
	var settingWizardThemeInfoVal;
	var scheduleDBInfoVal;
	

	
	
	$(".formConfig").submit(function(e){
	    alert("inside submit");
		e.preventDefault(); 
		var componentId=$(".formConfig").attr('id');
		alert(componentId);
		var configJson=getFormDataJson(componentId);
		saveConfiguration(configJson);
	
	
	
	});
	
							
	$('.modalUpdateButton').on('click', function(e){
		var updateArray = {};
		$('.modalUpdateForm').find('input').each(function(e){
			updateArray[$(this).attr('id').replace('id_', '')] = $(this).val();
		});
		updateConfiguration($('.modalUpdateForm').attr('componentid'), updateArray);
		var componentData=$(".viewTable").attr('id').split('_');
		getConfiguration(componentData[1],componentData[0]);		
		$('.configurationUpdateModal').modal('hide'); 
	});
	
	$('.modalDeleteButton').on('click', function(e){

	
		var deleteConfigData=$(".deleteBtn").attr('id').split("|");;
		deleteConfiguration(deleteConfigData[1]);
		var componentData=$(".viewTable").attr('id').split('_');
		getConfiguration(componentData[1],componentData[0]);
		$('.configurationDeleteModal').modal('hide'); 		
	});	
	
	
	$(".table").on('click','.updateBtn',function(e){
		var updateid=e.target.id.split("|");
		//alert(updateid);
		createUpdateConfigurationModal(updateid[1], this);
	});
	
	$(".table").on('click','.deleteBtn',function(e){
		$('.configurationDeleteModal').modal(); 
	});
	
	/*
	$(".saveBtn").click(function(e){

		var componentId=e.target.id;
			alert(componentId);
		var configJson=getFormDataJson(componentId);
		saveConfiguration(configJson);
	});
	*/
	$(".submitBtn").click(function(e){
		
		submitConfiguration();
	});	

	$(".viewTable").on('click',function(e){
		var componentId=e.target.id.split('_');
		var componentName=componentId[0];
		var componentDataTable=componentId[1];
		getConfiguration(componentDataTable,componentName);
		clearFormData();
		clearAlertMessage();
	});

	$(".cancelBtn").click(function(e){
		clearFormData();
		clearAlertMessage();
	});		
	
	$('select#sdnApplicationInfoSelection').change(function(e) {
		sdnApplicationInfoVal=$(this).val();
	});
	$('select#sdnPrioritySelection').change(function(e) {
		sdnPriorityVal=$(this).val();
	});
	$('select#emailSMTPSelection').change(function(e) {
		emailSMTPVal=$(this).val();
	});	
	$('select#smsNotificationCountrySelection').change(function(e) {
		smsNotificationCountryVal=$(this).val();
	});	
	$('select#smsNotificationGatewaySelection').change(function(e) {
		smsNotificationGateWayVal=$(this).val();
	});	
	$('select#imageSourceSelection').change(function(e) {
		imageGalleryInfoVal=$(this).val();
	});
	$('select#imageGalleryType').change(function(e) {
		imageGalleryTypeInfoVal=$(this).val();
	});
	$('select#galleryAutoplaySelection').change(function(e) {
		imageGalleryAutoplayInfoVal=$(this).val();
	});
	$('select#videoSourceSelection').change(function(e) {
		videoGallerysourceInfoVal=$(this).val();
	});
	$('select#videoGalleryTypeSelection').change(function(e) {
		videoGalleryTypeInfoVal=$(this).val();
	});
	$('select#videoAutoplaySelection').change(function(e) {
		videoGalleryAutoplayInfoVal=$(this).val();
	});
	$('select#videoPlayerSourceSelection').change(function(e) {
		videoPlayerSourceInfoVal=$(this).val();
	});
	$('select#contentFlashInfoSelection').change(function(e) {
		contentFlashInfoVal=$(this).val();
	});
	$('select#contentFlashGalleryAutoselection').change(function(e) {
		contentFlashGalleryAutoInfoVal=$(this).val();
	});
	$('select#sfdcAccountInfoSelection').change(function(e) {
		sfdcAccountInfoVal=$(this).val();
	});
	$('select#adBannervideoSelection').change(function(e) {
		adBannervideoInfoVal=$(this).val();
	});
	$('select#settingWizardThemeSelection').change(function(e) {
		settingWizardThemeInfoVal=$(this).val();
	});
	$('select#scheduleDBSelection').change(function(e) {
		scheduleDBInfoVal=$(this).val();
	});	
	
	function clearFormData(){
		$(".componentConfigForm").find('input').each(function(e){
			$(this).val('');
		});

		$(".componentConfigForm").find('select').each(function(e){
			this.selectedIndex=0;
		});

	}	
	
	function saveConfiguration(configJson){
		$.ajax({
			type : "POST",
			url : "http://10.76.205.208:6002/addComponentConfiguration",
			async : true,
			dataType :"json",
			data :configJson,
			success : function(data) {
				//alert(JSON.stringify(data));
				showAlertMessage("success","Document Inserted Successfully!!!");
				clearFormData();
			},
			error :function(data) {
			
				alert("error");
			}

		});		
	}
	
	function getConfiguration(tableId,componentName){
		$.ajax({
			type : "GET",
			url : "http://10.76.205.208:6002/getComponentConfiguration"+"?componentName="+componentName,
			async : true,
			dataType :"json",
			success : function(data) {
				//alert(JSON.stringify(data.APIStatusCode));
				createConfigurationTable(tableId,data.jsonContent,JSON.stringify(data.APIStatusCode));
			},
			error :function(data) {
			
				alert("error");
			}

		});
	
	}	
	
	function updateConfiguration(componentId, jsonString){
		$.ajax({
			type : "POST",
			url : "http://10.76.205.208:6002/updateComponentConfiguration",
			async : true,
			data:{
			"componentConfigId":componentId,
			"componetConfig":jsonString
			},
			dataType :"json",
			success : function(data) {
				//alert(JSON.stringify(data));
			},
			error :function(data) {
			
				alert("error");
			}

		});		
	}

	function submitConfiguration(){
		$.ajax({
			type : "POST",
			url : "http://10.76.205.208:6002/submitComponentConfiguration",
			async : true,
			dataType :"json",
			success : function(data) {
				//alert(JSON.stringify(data));
			},
			error :function(data) {
			
				alert("error");
			}

		});		
	}

	
	
	function showAlertMessage(messageType,message){
		var alertHTML="";
	
		if(messageType=="success"){
			alertHTML+='<div class="alert alert-success"><a href="#" class="alert-link" >'+message+'</a></div>';
		}
		else if(messageType=="failure"){
		
		}
		else if(messageType=="error"){
		
		}
		$(".alertMessage").html(alertHTML);
	
	}
	
	function clearAlertMessage(){
		$(".alertMessage").html('');
	
	}
	
	function createUpdateConfigurationModal(componentId, context){
		var updateArray = {};
		var HTMLstring = '<center><div componentid="'+componentId+'" class="modalUpdateForm">';
		$(context).closest('tr').find('td').each(function(){
		if($(this).attr('name')){
			HTMLstring += '<div class="input-group col-lg-8 center"><span class="input-group-addon">'+$(this).attr('name')+'</span><input type="text" class="form-control" placeholder="Host Name" value="'+$(this).text()+'" id="id_'+$(this).attr('name')+'"></div>';
		
			}
		});
		$('.configurationUpdateModalContent').html(HTMLstring+'</div></center>');
		$('.configurationUpdateModal').modal();  
	}
	
	function deleteConfiguration(componentId){
		$.ajax({
			type : "POST",
			url : "http://10.76.205.208:6002/deleteComponentConfiguration",
			async : true,
			data:{
			"componentConfigId":componentId
			},
			dataType :"json",
			success : function(data) {
				//alert(JSON.stringify(data));
			},
			error :function(data) {
				alert("error");
			}
		});		
	}
	
	
	function createConfigurationTable(tableId,componetConfig,apiStatus){
	//alert(tableId);
	
		//var dataTable="#"+tableId;
		//alert(dataTable);
		//$(dataTable).dataTable();
		var htmlString="";
		var tableName="#"+tableId+" tbody";
		if(apiStatus==200){
			htmlString='<tr class="odd gradeX">';
			var componentConfigId;
			for(var i=0;i<componetConfig.length;i++){
				componentConfigId=componetConfig[i].componentConfigId;
				for(var key in componetConfig[i].componetConfig){
					if(componetConfig[i].componetConfig.hasOwnProperty(key)){
						htmlString+='<td class="center" name="'+key+'">'+componetConfig[i].componetConfig[key]+'</td>';
					}	
				}
				var updateId="update|"+componentConfigId;
				var deleteId="delete|"+componentConfigId;
				htmlString+='<td class="center"><button type="button" class="btn btn-primary add-tab updateBtn" id="'+updateId+'">update</button></td><td class="center"><button type="button" class="btn btn-primary add-tab deleteBtn" id="'+deleteId+'">delete</button></td></tr>';
				htmlString+='<tr class="odd gradeX">';
			}
		
			$(tableName).html(htmlString);			
			
		}
		else if(apiStatus==505){
			$(tableName).html(htmlString);
		}
			


	}
	
	
	function getFormDataJson(componentId){
		var configJson="";
		switch(componentId){
			case "saveMSEServerConfig":
			configJson=getMSEComponentConfig();
			return configJson;
			break;
			case "saveISEServerConfig":
			configJson=getISEComponentConfig();
			return configJson;
			break;
			case "saveSDNPolicyConfig":
			configJson=getSDNPolicyConfig();
			return configJson;			
			break;
			case "saveSDNServerConfig":
			configJson=getSDNServerConfig();
			return configJson;			
			break;
			case "saveEmailNotificationConfig":
			configJson=getEmailNotificationConfig();
			return configJson;			
			break;
			case "saveSMSNotificationConfig":
			configJson=getSMSNotificationConfig();
			return configJson;				
			break;
			case "saveAndroidPushNotificationConfig":
			configJson=getAndroidPushNotificationConfig();
			return configJson;			
			break;	
            case "saveImageGalleryConfig":
			configJson=getImageGalleryConfig();
			return configJson;			
			break;	
            case "saveVideoGalleryConfig":
			configJson=getVideoGalleryConfig();
			return configJson;			
			break;
            case "saveVideoPlayerConfig":
			configJson=getVideoPlayerConfig();
			return configJson;			
			break;
            case "saveContentFlashConfig":
			configJson=getContentFlashConfig();
			return configJson;			
			break;	
            case "saveSFDCConfig":
			configJson=getSFDCConfig();
			return configJson;			
			break;			
            case "saveAdBannerConfig":
			configJson=getAdBannerConfig();
			return configJson;			
			break;
			case "saveSettingWizardConfig":
			configJson=getSettingWizardConfig();
			return configJson;			
			break;
			case "saveAdPromotionConfig":
			configJson=getAdPromotionComponentConfig();
			return configJson;
			break;
			case "saveMapViewConfig":
			configJson=getMapViewComponentConfig();
			return configJson;
			break;
			case "saveScheduleConfig":
			configJson=getsaveScheduleComponentConfig();
			return configJson;
			break;			
		}
	}

	function getMSEComponentConfig(){
		var configJson={};
		var componentConfigJson={};
		var mseHostName=$("#mseHostName").val();
		var mseIpAddress=$("#mseIpAddress").val();
		var mseUserName=$("#mseUserName").val();
		var msePassword=$("#msePassword").val();
		var componentName="MSE";
		var componentId="MSE_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.mseHostName=mseHostName;
		configJson.mseIpAddress=mseIpAddress;
		configJson.mseUserName=mseUserName;
		configJson.msePassword=msePassword;
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;
	}


	function getISEComponentConfig(){
		var configJson={};
		var componentConfigJson={};
		var iseHostName=$("#iseHostName").val();
		var iseIpAddress=$("#iseIpAddress").val();
		var iseUserName=$("#iseUserName").val();
		var isePassword=$("#isePassword").val();
		var componentName="ISE";
		var componentId="ISE_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.iseHostName=iseHostName;
		configJson.iseIpAddress=iseIpAddress;
		configJson.iseUserName=iseUserName;
		configJson.isePassword=isePassword;
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;
	}


	function getSDNPolicyConfig(){
		var configJson={};
		var componentConfigJson={};
		var sdnUserId=$("#sdnUserId").val();
		var componentName="SDN";
		var componentId="SDN_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.sdnUserId=sdnUserId;
		configJson.sdnApplicationInfoVal=sdnApplicationInfoVal;
		configJson.sdnPriorityVal=sdnPriorityVal;
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;
	}


	function getSDNServerConfig(){
		var configJson={};
		var componentConfigJson={};
		var sdnIpAddress=$("#sdnIpAddress").val();
		var sdnPortNo=$("#sdnPortNo").val();
		var sdnLoginId=$("#sdnLoginId").val();
		var sdnPassword=$("#sdnPassword").val();
		var componentName="SDN";
		var componentId="SDN_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.sdnIpAddress=sdnIpAddress;
		configJson.sdnPortNo=sdnPortNo;
		configJson.sdnLoginId=sdnLoginId;
		configJson.sdnPassword=sdnPassword;
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;
	}	
	
	
	function getEmailNotificationConfig(){
		var configJson={};
		var componentConfigJson={};
		var componentConfigAPI=$(".componentConfigForm").attr('id');
		var emailAddress=$("#emailAddress").val();
		var emailPassword=$("#emailPassword").val();
		var emailCategory=$("#emailCategory").val();
		var emailSubCategory=$("#emailSubCategory").val();
		var componentName="emailNotification";
		var componentId="emailNotification_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		componentConfigJson.componentConfigAPI=componentConfigAPI;
		configJson.emailSMTPVal=emailSMTPVal;
		configJson.emailSMTPURL="";
		configJson.emailAddress=emailAddress;
		configJson.emailPassword=emailPassword;
		configJson.emailCategory=emailCategory;
		configJson.emailSubCategory=emailSubCategory;
		configJson.status="";
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;
	}
	
	
	function getSMSNotificationConfig(){
		var configJson={};
		var componentConfigJson={};
		var componentConfigAPI=$(".componentConfigForm").attr('id');
		var mobileNo=$("#smsNotificationMobileNumber").val();
		var smsCategory=$("#smsNotificationCategory").val();
		var smsSubCategory=$("#smsNotificationSubCategory").val();
		var componentName="SMSNotification";
		var componentId="SMSNotification_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		componentConfigJson.componentConfigAPI=componentConfigAPI;
		configJson.smsNotificationCountry=smsNotificationCountryVal;
		configJson.smsNotificationGateWay=smsNotificationGateWayVal
		configJson.mobileNo=mobileNo;
		configJson.smsCategory=smsCategory;
		configJson.smsSubCategory=smsSubCategory;
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;
	}	
	
	
	function getAndroidPushNotificationConfig(){
		var configJson={};
		var componentConfigJson={};
		var androidPushNotificationProjectNumber=$("#androidPushNotificationProjectNumber").val();
		var androidPushNotificationAPIKey=$("#androidPushNotificationAPIKey").val();
		var androidPushNotificationCategory=$("#androidPushNotificationCategory").val();
		var androidPushNotificationSubCategory=$("#androidPushNotificationSubCategory").val();
		var componentName="SMSNotification";
		var componentId="SMSNotification_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.androidPushNotificationProjectNumber=androidPushNotificationProjectNumber;
		configJson.androidPushNotificationAPIKey=androidPushNotificationAPIKey;
		configJson.androidPushNotificationCategory=androidPushNotificationCategory;
		configJson.androidPushNotificationSubCategory=androidPushNotificationSubCategory;
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;	
	}
	
	
	function getImageGalleryConfig(){
		var configJson={};
		var componentConfigJson={};
		var componentConfigAPI=$(".componentConfigForm").attr('id');
		var serverpath=$("#serverpath").val();
		var imageUniqueId=$("#imageUniqueId").val();
		var imageCount=$("#imageCount").val();
		var galleryWidth=$("#galleryWidth").val();
		var galleryHeight=$("#galleryHeight").val();
		var componentName="imageGallery";
		var componentId="imageGallery_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		componentConfigJson.componentConfigAPI=componentConfigAPI;
		configJson.imageGalleryInfoVal=imageGalleryInfoVal;
		configJson.serverpath=serverpath;
		configJson.imageUniqueId=imageUniqueId;
		configJson.imageCount=imageCount;
		configJson.imageGalleryTypeInfoVal=imageGalleryTypeInfoVal;
		configJson.galleryWidth=galleryWidth;
		configJson.galleryHeight=galleryHeight;
		configJson.imageGalleryAutoplayInfoVal=imageGalleryAutoplayInfoVal;
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;	
	
	}
	
	function getVideoGalleryConfig(){
		var configJson={};
		var componentConfigJson={};
		var videoUrl=$("#videoUrl").val();
		var uniqueVideoId=$("#uniqueVideoId").val();
		var videoCount=$("#videoCount").val();
		var videoGalleryWidth=$("#videoGalleryWidth").val();
		var videoGalleryHeight=$("#videoGalleryHeight").val();
		var componentName="videoGallery";
		var componentId="videoGallery_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.videoGallerysourceInfoVal=videoGallerysourceInfoVal;
		configJson.videoUrl=videoUrl;
		configJson.uniqueVideoId=uniqueVideoId;
		configJson.videoGalleryTypeInfoVal=videoGalleryTypeInfoVal;
		configJson.videoCount=videoCount;
		configJson.videoGalleryWidth=videoGalleryWidth;
		configJson.videoGalleryHeight=videoGalleryHeight;
		configJson.videoGalleryAutoplayInfoVal=videoGalleryAutoplayInfoVal;
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;	
	}
	
	function getVideoPlayerConfig(){
		var configJson={};
		var componentConfigJson={};
		var videoPlayUrl=$("#videoPlayUrl").val();
		var uniqueVideoPlayId=$("#uniqueVideoPlayId").val();
		var startDate=$("#startDate").val();
		var startTime=$("#startTime").val();
		var endTime=$("#endTime").val();
		var componentName="videoPlayer";
		var componentId="videoPlayer_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.videoPlayerSourceInfoVal=videoPlayerSourceInfoVal;
		configJson.videoPlayUrl=videoPlayUrl;
		configJson.uniqueVideoPlayId=uniqueVideoPlayId;
		configJson.startDate=startDate;
		configJson.startTime=startTime;
		configJson.endTime=endTime;
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;	
	}
	
	function getContentFlashConfig(){
		var configJson={};
		var componentConfigJson={};
		var contentFlashURL=$("#contentFlashURL").val();
		var contentFlashHeight=$("#contentFlashHeight").val();
		var contentFlashWidth=$("#contentFlashWidth").val();
		var componentName="contentFlash";
		var componentId="contentFlash_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.contentFlashInfoVal=contentFlashInfoVal;
		configJson.contentFlashURL=contentFlashURL;
		configJson.contentFlashHeight=contentFlashHeight;
		configJson.contentFlashWidth=contentFlashWidth;
		configJson.contentFlashGalleryAutoInfoVal=contentFlashGalleryAutoInfoVal;
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;	
	}
	
	
	function getSFDCConfig(){
		var configJson={};
		var componentConfigJson={};
		var sfdcurlConfig=$("#sfdcurlConfig").val();
		var sfduserConfig=$("#sfduserConfig").val();
		var sfdcpasswordConfig=$("#sfdcpasswordConfig").val();
		var componentName="SFDC";
		var componentId="SFDC_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.sfdcurlConfig=sfdcurlConfig;
		configJson.sfduserConfig=sfduserConfig;
		configJson.sfdcpasswordConfig=sfdcpasswordConfig;
		configJson.sfdcAccountInfoVal=sfdcAccountInfoVal;	
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;	
	}
	function getAdBannerConfig(){
		var configJson={};
		var componentConfigJson={};
		var adBannervideoUrl=$("#adBannervideoUrl").val();
		var adBanneruniqueVideoId=$("#adBanneruniqueVideoId").val();
		var adBannerstartDate=$("#adBannerstartDate").val();
		var adBannerstartTime=$("#adBannerstartTime").val();
		var adBannerendTime=$("#adBannerendTime").val();
		var componentName="AdBanner";
		var componentId="AdBanner_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.adBannervideoInfoVal=adBannervideoInfoVal;
		configJson.adBannervideoUrl=adBannervideoUrl;
		configJson.adBanneruniqueVideoId=adBanneruniqueVideoId;
		configJson.adBannerstartDate=adBannerstartDate;	
		configJson.adBannerstartTime=adBannerstartTime;	
		configJson.adBannerendTime=adBannerendTime;	
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;	
	}
    function getAdPromotionConfig(){
		var configJson={};
		var componentConfigJson={};
		var adBannervideoUrl=$("#adBannervideoUrl").val();
		var adBanneruniqueVideoId=$("#adBanneruniqueVideoId").val();
		var adBannerstartDate=$("#adBannerstartDate").val();
		var adBannerstartTime=$("#adBannerstartTime").val();
		var adBannerendTime=$("#adBannerendTime").val();
		var componentName="AdPromotion";
		var componentId="AdPromotion_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.adBannervideoInfoVal=adBannervideoInfoVal;
		configJson.adBannervideoUrl=adBannervideoUrl;
		configJson.adBanneruniqueVideoId=adBanneruniqueVideoId;
		configJson.adBannerstartDate=adBannerstartDate;	
		configJson.adBannerstartTime=adBannerstartTime;	
		configJson.adBannerendTime=adBannerendTime;	
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;	
	}

    function getSettingWizardConfig(){
		var configJson={};
		var componentConfigJson={};
		var settingWizardHeight=$("#settingWizardHeight").val();
		var settingWizardWidth=$("#settingWizardWidth").val();
		var componentName="settingWizard";
		var componentId="settingWizard_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.settingWizardWidth=settingWizardWidth;
		configJson.settingWizardHeight=settingWizardHeight;
		
		configJson.settingWizardTheme=settingWizardThemeInfoVal;	
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;	
	}


	function getMapViewComponentConfig(){
		var configJson={};
		var componentConfigJson={};
		var MSEURL=$("#MSEURL").val();
		var floornameName=$("#floorname—Name").val();
		var buildingnameName=$("#buildingname—Name").val();
		var campusnameName=$("#campusname—Name").val();

		var componentName="mapView";
		var componentId="mapView_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.MSEURL=MSEURL;
		configJson.floornameName=floornameName;
		configJson.buildingnameName=buildingnameName;
		configJson.campusnameName=campusnameName;		
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;	
	}

function getsaveScheduleComponentConfig(){
		var configJson={};
		var componentConfigJson={};
		var scheduleDBURL=$("#scheduleDBURL").val();
		var scheduleDBName=$("#scheduleDBName").val();
		var scheduleCollectionName=$("#scheduleCollectionName").val();

		var componentName="schedule";
		var componentId="schedule_"+Date.now();
		componentConfigJson.componentConfigId=componentId;
		componentConfigJson.componentName=componentName;
		configJson.scheduleDBInfoVal=scheduleDBInfoVal;
		configJson.scheduleDBURL=scheduleDBURL;
		configJson.scheduleDBName=scheduleDBName;
		configJson.scheduleCollectionName=scheduleCollectionName;		
		componentConfigJson.componetConfig=configJson;
		return componentConfigJson;	

}

		function createWizard(){
			$('#rootwizard').bootstrapWizard({onTabShow: function(tab, navigation, index) {
			var $total = navigation.find('li').length;
			var $current = index+1;
			var $percent = ($current/$total) * 100;
			$('#rootwizard').find('.bar').css({width:$percent+'%'});
			
			// If it's the last tab then hide the last button and show the finish instead
			if($current >= $total) {
				$('#rootwizard').find('.pager .next').hide();
				$('#rootwizard').find('.pager .finish').show();
				$('#rootwizard').find('.pager .finish').removeClass('disabled');
			} else {
				$('#rootwizard').find('.pager .next').show();
				$('#rootwizard').find('.pager .finish').hide();
			}
			
		}});
		$('#rootwizard .finish').click(function() {
			alert('Finished!, Starting over!');
			$('#rootwizard').find("a[href*='tab1']").trigger('click');
		});	
		window.prettyPrint && prettyPrint()
		
		}

});