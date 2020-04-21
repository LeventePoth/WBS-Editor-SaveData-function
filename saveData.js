var data1 = [{
    "_internalId": 5101076,
    "_parent": "http://clarityppm.capture.eu/ppm/rest/v1/projects/5057011",
    "code": "T0204",
    "name": "módosítva természetesen",
    "_self": "http://clarityppm.capture.eu/ppm/rest/v1/projects/5057011/tasks/5101074",
    "parentTask": "prj_5057011",
    "isTask": false,
    "taskOwner": null,
    "isMilestone": false,
    "isKey": true,
    "isSubProject": false,
    "hasSubtasks": true,
    "percentComplete": 0,
    "baselineStartDate": null,
    "hasAssignments": false,
    "finishDate": "2020-03-12T17:00:00",
    "wbsSort": 9,
    "startDate": "2020-03-10T08:00:00",
    "baselineFinishDate": null,
    "status": {
        "displayValue": "Not Started",
        "_type": "lookup",
        "id": "0"
    },
    "id": 2,
    "active": 1,
    "saved": 1,
    "_children": null,
    "hcode": "1.1",
    "parent": "null",
    "depth": 1,
    "x": -540,
    "y": 90,
    "maxdepth": 1,
    "x0": -540,
    "y0": 90,
    "children": null
  },{
    "_internalId": 5099235,
    "_parent": "http://clarityppm.capture.eu/ppm/rest/v1/projects/5057011",
    "code": "LM.002.010",
    "name": "Requirements Definition módosítva",
    "_self": "http://clarityppm.capture.eu/ppm/rest/v1/projects/5057011/tasks/5099235",
    "parentTask": 5099238,
    "isTask": true,
    "taskOwner": null,
    "isMilestone": false,
    "isKey": false,
    "isSubProject": false,
    "hasSubtasks": false,
    "percentComplete": 0,
    "baselineStartDate": null,
    "hasAssignments": true,
    "finishDate": "2020-04-13T17:00:00",
    "wbsSort": 11,
    "startDate": "2020-04-07T08:00:00",
    "baselineFinishDate": null,
    "status": {
        "displayValue": "Not Started",
        "_type": "lookup",
        "id": "0"
    },
    "id": 12,
    "active": 1,
    "saved": 1,
    "hcode": "1.3.1",
    "parent": "null",
    "depth": 2,
    "x": -90,
    "y": 180,
    "x0": -90,
    "y0": 180,
    "children": null,
    "_children": null
}];
  
  var token = 'Basic YWRtaW46Q2xhcml0eTE1NiE=';
  
  function callbackReadTask(task, _internalId){
          console.log("callbackReadTask invoked",task);
      }
  function callbackSuccess(){
          console.log("callback success");
      }
  function callbackError(error){
          console.log("callbackError",error);
      }
  
  function saveDataToServer(token, array, callbackReadTask, callbackSuccess, callbackError){
      //TODO
          for (var i = 0; i < array.length; i++) {
              var projectNumberMod = array[0]._parent;
              var mainURL = projectNumberMod.slice(0, 50);
              var projectNumberModSlice = projectNumberMod.slice(50, 57);
              var ProjectTask = array[i]._internalId;
              var url1 = mainURL + projectNumberModSlice + '/tasks/' + ProjectTask;
              var url2 = mainURL + projectNumberModSlice + '/tasks/';
              var code = array[i].code;
              var name = array[i].name;
              var parentTaskID = array[i].parentTask;
              var String = parentTaskID.toString();
              var parentTaskIDToString = (String.startsWith("prj"));
              console.log(parentTaskIDToString);
              var wbsSort = array[i].wbsSort;
              var startDate = array[i].startDate;
              var finishDate = array[i].finishDate;
              if (array[i].saved === 1 && array[i].active === 1) {
                if (parentTaskIDToString === true) {
                var counter1 = 0;
                var settings = {
                  "url": url1,
                  "method": "PATCH",
                  "timeout": 0,
                  "headers": {
                    "Authorization": token,
                    "ContentType": "application/json",
                    "Content-Type": "application/json"
                  },
                  "data": JSON.stringify({"name":name,"_internalId":ProjectTask,"parentTask":null,
                  "wbsSort":wbsSort,"code":code}),
                };
                function requestPatch (callback1) {
                counter1++;
                $.ajax(settings)
                .fail(function (response, textStatus) { 
                  console.log(response),
                  console.log(textStatus),
                  callbackError(textStatus);
                })
                .done(function (response, textStatus) {
                  console.log(response, textStatus),
                  callbackReadTask(array[i],response._internalId),
                  callback1();
                });
              };
              function removeFromCounter1 () {
                counter1--;
                console.log(counter1);
                if (counter1 === 0) {
                  callbackSuccess();
                };
              };
            requestPatch (removeFromCounter1);
            };
            if (parentTaskIDToString === false) {
              var counter2 = 0;
                var settings = {
                  "url": url1,
                  "method": "PATCH",
                  "timeout": 0,
                  "headers": {
                    "Authorization": token,
                    "ContentType": "application/json",
                    "Content-Type": "application/json"
                  },
                  "data": JSON.stringify({"name":name,"_internalId":ProjectTask,"parentTask":parentTaskID,
                  "wbsSort":wbsSort,"code":code}),
                };
                function requestPatch (callback1) {
                counter2++;
                $.ajax(settings)
                .fail(function (response, textStatus) { 
                  console.log(response),
                  console.log(textStatus),
                  callbackError(textStatus);
                })
                .done(function (response, textStatus) {
                  console.log(response, textStatus),
                  callbackReadTask(array[i],response._internalId),
                  callback1();
                });
              };
              function removeFromCounter1 () {
                counter2--;
                console.log(counter1);
                if (counter2 === 0) {
                  callbackSuccess();
                };
              };
            requestPatch (removeFromCounter1);
            };
          };
          if (array[i].saved === 0 && array[i].active === 1) {
            if (parentTaskIDToString === true) {
            var counter3 = 0;
            var settings = {
              "url": url2,
              "method": "POST",
              "timeout": 0,
              "headers": {
                "Authorization": token,
                "ContentType": "application/json",
                "Content-Type": "application/json"
              },
              "data": JSON.stringify({"name":name,"parentTask":null,"wbsSort":wbsSort,
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
              counter3--;
              console.log(counter2);
              if (counter3 === 0) {
                callbackSuccess();
              };
            };
            requestPost (removeFromCounter2);
          };
          if (parentTaskIDToString === false) {
            var counter4 = 0;
            var settings = {
              "url": url2,
              "method": "POST",
              "timeout": 0,
              "headers": {
                "Authorization": token,
                "ContentType": "application/json",
                "Content-Type": "application/json"
              },
              "data": JSON.stringify({"name":name,"parentTask":parentTaskID,"wbsSort":wbsSort,
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
              counter4--;
              console.log(counter3);
              if (counter4 === 0) {
                callbackSuccess();
              };
            };
            requestPost (removeFromCounter2);
        };
      };
      if (array[i].saved === 1 && array[i].active === 0) {
        var counter5 = 0;
        var settings = {
          "url": url1,
          "method": "DELETE",
          "timeout": 0,
          "headers": {
            "Authorization": token,
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
          array.splice(array[i], 1);
          counter5--;
          console.log(counter4);
          if (counter5 === 0) {
            callbackSuccess();
        };
      };
    requestDelete (removeFromArray);
    };
  };
};             
          
      /*testing:*/
      //var token="19279060__0DD39E30-EECA-4A33-92FA-6E427AF8855F";
      
      saveDataToServer(token,data1,callbackReadTask,callbackSuccess,callbackError); 