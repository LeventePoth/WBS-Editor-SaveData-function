
var test_url="http://clarityppm.capture.eu/ppm/rest/v1"

function saveDataToServer(token, array, callbackReadTask, deletedNodes, postNodes, callbackSuccess, callbackError){
//TODO
	console.log("saveDataToServer");
	//console.log(array);
	//console.log(token);
	//console.log(postNodes);
	var postUrl;
	var deleteUrl;
	//console.log(postUrl);
	
	if (deletedNodes[0]) {
		for (var i = 0; i < deletedNodes.length; i++) {
		console.log(deletedNodes[i]);
		var testUrl2 = deletedNodes[i];
		var testUrl3 = deletedNodes[i]._internalId;
		var deleteUrl = getUrl (testUrl2);
		console.log(deleteUrl);
		var testUrl4 = deleteUrl.toString() + testUrl3;
		console.log(testUrl4);
		 //var deletedNumberMod = deletedNodes[i].parent._self;
		 var counter5 = 0; 
		 var settings = {
		   "url": testUrl4,
		   "method": "DELETE",
		   "timeout": 0,
		   "headers": {
			 "Authorization": "Basic YWRtaW46Q2xhcml0eTE1NiE=",
			 "ContentType": "application/json"
		   },
		 };
		 function requestDelete (callback4) {
		 counter5++;
		 $.ajax(settings)
	   .fail(function (response, textStatus) {
		 console.log(response);
		if (response.status == 200) {
		  callback4();
		 };
		if (response.status !== 200) {
		  callbackError(textStatus);
		 };
	   });
	 }; 
		   function removeFromArray () {
		   deletedNodes.splice(deletedNodes[i], 1);
		   counter5--;
		   console.log(counter5);
		   if (counter5 === 0) {
			 callbackSuccess();
		 };
	   };
	 requestDelete (removeFromArray);
	   }
	 }
   
	   if (postNodes[0]) {
		 for (var i = 0; i < postNodes.length; i++) {
			 function loop1 () {
		   //var postNumberMod = postNodes[i].parent._parent+'/tasks/';
		   var testUrl = postNodes[i];
		   console.log(postNodes[i].depth);
		   console.log(postNodes[i].name);
		   console.log(postNodes[i].parent);
		   console.log(postNodes[i]._parent);
		   var postUrl = getUrl (testUrl);
		   console.log(postUrl);
		   var name = postNodes[i].name;
		   var startDate = postNodes[i].startDate;
		   var finishDate = postNodes[i].finishDate;
		   var parentTaskID = postNodes[i].parentTask;
		   var String = parentTaskID.toString();
		   var parentTaskIDToString = (String.startsWith("prj"));
		   //console.log(parentTaskIDToString);
		   if (parentTaskIDToString === true && postUrl) {
			 var counter3 = 0;
			 var settings = {
			   "url": postUrl,
			   "method": "POST",
			   "timeout": 0,
			   "headers": {
				 "Authorization": "Basic YWRtaW46Q2xhcml0eTE1NiE=",
				 "ContentType": "application/json",
				 "Content-Type": "application/json"
			   },
			   "data": JSON.stringify({"name":name,"parentTask":null,
			   "startDate":startDate,"finishDate":finishDate}),
			 };
			 function requestPost (callback2) {
			   counter3++;
			   $.ajax(settings)
			   .fail(function (response, textStatus) {
				 console.log(response),
				 console.log(textStatus),
				 callbackError(textStatus);
			   })
			   .done(function (response, textStatus) {
				 console.log(response, textStatus),
				 callbackReadTask(array[i],response._internalId), // itt gáz van
				 callback2();
			   });
			 };
			 function removeFromCounter2 () {
			   //postNodes.splice(postNodes[i], 1);
			   postNodes.splice(i, 1); // i has to be 0 here !!
			   counter3--;
			   console.log(counter3);
			   if (counter3 === 0) {
				callbackSuccess();
				loop1();
			   };
			 };
			 requestPost (removeFromCounter2);
		   };
		   
		   if (parentTaskIDToString === false && postUrl) {
			 var counter4 = 0;
			 var settings = {
			   "url": postUrl,
			   "method": "POST",
			   "timeout": 0,
			   "headers": {
				 "Authorization": "Basic YWRtaW46Q2xhcml0eTE1NiE=",
				 "ContentType": "application/json",
				 "Content-Type": "application/json"
			   },
			   "data": JSON.stringify({"name":name,"parentTask":parentTaskID,
			   "startDate":startDate,"finishDate":finishDate}),
			 };
			 function requestPost (callback3) {
			   counter4++;
			   $.ajax(settings)
			   .fail(function (response, textStatus) {
				 console.log(response),
				 console.log(textStatus),
				 callbackError(textStatus);
			   })
			   .done(function (response, textStatus) {
				 console.log(response, textStatus),
				 callbackReadTask(array[i],response._internalId),
				 callback3();
			   });
			 };
			 function removeFromCounter2 () {
			   //postNodes.splice(postNodes[i], 1);
			   postNodes.splice(i, 1); // i has to be 0 here !!
			   counter4--;
			   console.log(counter4);
			   if (counter4 === 0) {
				callbackSuccess();
				loop1();
			   };
			 };
			 requestPost (removeFromCounter2);
		 };
		 //return;
	   };
	   return loop1 ();
	   //return;
	};
	 };
   };

   getUrl = function (testUrl) {
	   var returnUrl = [];
	   var insideUrl;
	   function inside (testUrl) {
	if (testUrl.depth == 0) {
		insideUrl = testUrl._self.slice(0, 57)+'/tasks/'
		//returnUrl = insideUrl.toString();
		returnUrl.push(insideUrl);
		console.log(returnUrl);
		//console.log(testUrl._self.slice(0, 57)+'/tasks/');
		//return testUrl._self.slice(0, 57)+'/tasks/';
		//return returnUrl;
	}
	else {
			inside(testUrl.parent);
		}		
	}
	inside (testUrl)

	console.log(returnUrl);
		return returnUrl;
}