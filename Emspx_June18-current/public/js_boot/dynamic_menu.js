var i;
var id = "content";
var configcomponents = new Array();
configcomponents[0] = {"name":"Configuration",
						"url": "configuration"};
configcomponents[1] = {"name":"Device Registration",
						"url": "device_registration"};
configcomponents[2] = {"name":"Messaging",
						"url": "messaging"};
configcomponents[3] = {"name":"Object Storage",
						"url": "object_storage"};
configcomponents[4] = {"name":"Logging",
						"url": "logging"};
configcomponents[5] = {"name":"Add banner",
						"url": "add_banner"};
configcomponents[6] = {"name":"Content Flash",
						"url": "content_flash"};
configcomponents[7] ={"name":"Authentication",
						"url": "authentication"}; 
configcomponents[8] = {"name":"Scheduler",
						"url": "scheduler"};
configcomponents[9] = {"name":"Image Gallery",
						"url": "image_gallery"};
configcomponents[10] ={"name":"Add Promotions",
						"url": "add_promotions"}; 
configcomponents[11] = {"name":"Wayfinder",
						"url": "wayfinder"};
configcomponents[12] = {"name":"SFDC",
						"url": "sfdc"};
var configpage = configcomponents[0];

var column = "rightcolumn";


for (i=0;i<configcomponents.length;i++)
{
var url = "configcomponents/"+configcomponents[i]['url']+".html";
var link = "javascript:ajaxpage('"+url+"','rightcolumn') ";
//alert(link)
document.write("<li style='background:#574c4c;'><a id="+id+" style='color:#fff' href="+link+">"+configcomponents[i]['name']+"</a></li>");
}