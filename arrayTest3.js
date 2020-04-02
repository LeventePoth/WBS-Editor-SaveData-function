var data1 = [{
    "_internalId": 5101004,
    "_parent": "http://clarityppm.capture.eu/ppm/rest/v1/projects/5057011",
    "code": "LM.000.000",
    "name": "valami ismét megint 9",
    "_self": "http://clarityppm.capture.eu/ppm/rest/v1/projects/5057011/tasks/5099225",
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
    "finishDate": "2020-03-10T17:00:00",
    "wbsSort": 9,
    "startDate": "2020-03-10T08:00:00",
    "baselineFinishDate": null,
    "status": {
        "displayValue": "Not Started",
        "_type": "lookup",
        "id": "0"
    },
    "id": 2,
    "active": 0,
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
  }, {
    "_internalId": 5101004,
    "_parent": "http://clarityppm.capture.eu/ppm/rest/v1/projects/5057011",
    "code": "LM.000.000",
    "name": "valami ismét megint 11",
    "_self": "http://clarityppm.capture.eu/ppm/rest/v1/projects/5057011/tasks/5099225",
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
    "finishDate": "2020-03-10T17:00:00",
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
    "saved": 0,
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
              var projectNumberModSlice = projectNumberMod.slice(50, 57);
              var ProjectTask = array[i]._internalId;
              var url1 = 'http://clarityppm.capture.eu/ppm/rest/v1/projects/' + projectNumberModSlice + '/tasks/' + ProjectTask;
              var url2 = 'http://clarityppm.capture.eu/ppm/rest/v1/projects/' + projectNumberModSlice + '/tasks/';
              var code = array[i].code;
              var name = array[i].name;
              var parentTaskID = array[i].parentTask;
              var wbsSort = array[i].wbsSort;
              var startDate = array[i].startDate;
              var finishDate = array[i].finishDate;
                  if (array[i].saved === 1 && array[i].active === 1) {
                      var counter1 = 0;
                      var request = require('request');
                      var options = {
                      'method': 'PATCH',
                      'url': url1,
                      'headers': {
                              'Authorization': token,
                              'ContentType': 'application/json',
                              'Content-Type': 'application/json'
                          },
                      body: JSON.stringify({"name":name,"_internalId":ProjectTask,"parentTask":parentTaskID,
                      "wbsSort":wbsSort,"code":code})
                           };
                        function requestPatch (callback1) {
                          request(options, function (error, response) { 
                            if (response.statusCode !== 200) {
                                console.log(response.body);
                                callbackError(error);
                              };
                              counter1++;
                            if (!error && response.statusCode == 200) {
                            callbackReadTask(array[i],response._internalId);
                            callback1();
                            };
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
                  if (array[i].saved === 0 && array[i].active === 1) {
                      if (parentTaskID.startsWith("prj") === true) {
                      var counter2 = 0;
                      var request = require('request');
                      var options = {
                      'method': 'POST',
                      'url': url2,
                      'headers': {
                              'Authorization': token,
                              'ContentType': 'application/json',
                              'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({"name":name,"parentTask":null,"wbsSort":wbsSort,
                      "startDate":startDate,"finishDate":finishDate})
                      };
                        function requestPost (callback2) {
                          request(options, function (error, response) { 
                            if (response.statusCode !== 200) {
                              console.log(error);
                              console.log(response.body);
                              callbackError(error);
                            };
                            counter2++;
                            if (!error && response.statusCode == 200) {
                            //callbackReadTask(array[i],response._internalId);  
                            callback2();
                            };
                            callbackReadTask(array[i],response._internalId);
                          });
                        };
                        function removeFromCounter2 () {
                          counter2--;
                          console.log(counter2);
                          if (counter2 === 0) {
                            callbackSuccess();
                          };
                        };
                        requestPost (removeFromCounter2);
                      };
                      if (parentTaskID.startsWith("prj") === false) {
                        var counter3 = 0;
                        var request = require('request');
                        var options = {
                        'method': 'POST',
                        'url': url2,
                        'headers': {
                                'Authorization': token,
                                'ContentType': 'application/json',
                                'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({"name":name,"parentTask":parentTaskID,"wbsSort":wbsSort,
                        "startDate":startDate,"finishDate":finishDate})
                        };
                          function requestPost (callback3) {
                            request(options, function (error, response) { 
                              if (response.statusCode !== 200) {
                                console.log(error);
                                console.log(response.body);
                                callbackError(error);
                              };
                              counter3++;
                              if (!error && response.statusCode == 200) {
                              callbackReadTask(array[i],response._internalId);  
                              callback3();
                              };
                            });
                          };
                          function removeFromCounter2 () {
                            counter3--;
                            console.log(counter3);
                            if (counter3 === 0) {
                              callbackSuccess();
                            };
                          };
                          requestPost (removeFromCounter2);
                      };
                    };
                  if (array[i].saved === 1 && array[i].active === 0) {
                      var counter4 = 0;
                      var request = require('request');
                      var options = {
                      'method': 'DELETE',
                      'url': url1,
                      'headers': {
                          'Authorization': token,
                          'ContentType': 'application/json'
                      }
                      };
                        function requestDelete (callback4) {
                          request(options, function (error, response) { 
                            if (response.statusCode !== 200) {
                              console.log(response.body);
                              callbackError(error);
                            };
                            counter4++;
                            if (!error && response.statusCode == 200) {
                            callback4();
                            };
                          });
                        };
                          function removeFromArray () {
                            array.splice(array[i], 1);
                            counter4--;
                            console.log(counter4);
                            if (counter4 === 0) {
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