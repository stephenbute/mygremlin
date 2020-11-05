/*
 * MIT License

* Copyright (c) 2018.  Amazon Web Services, Inc. All Rights Reserved.

* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:

* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.

* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
**/


var gremlin = require('gremlin');
var http = require('http');
var url = require('url');


exports.outnodes = [];

exports.handler = function(event, context, callback) {

    var DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
    var Graph = gremlin.structure.Graph;
    //Use wss:// for secure connections. See https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-ssl.html 
    //dc = new DriverRemoteConnection('wss://'+process.env.NEPTUNE_CLUSTER_ENDPOINT+':'+process.env.NEPTUNE_PORT+'/gremlin');
    var dc = new DriverRemoteConnection('wss://database-111-instance-1.cdy6qtcftwut.ap-northeast-1.neptune.amazonaws.com:8182/gremlin');
    var graph = new Graph();
    var g = graph.traversal().withRemote(dc);

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000, // 30 days
        /** add other headers as per requirement */
        'Access-Control-Allow-Headers' : '*',
        "Content-Type": "application/json"
    };

    console.log("Path Parameters => "+ event.pathParameters);
    console.log("event.pathParameters.proxy => "+ event.pathParameters.proxy);
    console.log(event.pathParameters.proxy.match(/proxy/ig));

    // this code is only for populating the search LoV
    if (event.pathParameters.proxy.match(/initialize/ig)) {
        //using another technique as opposed to creating a new callback function

        g.V().hasLabel('Company').limit(1000).valueMap(true).toList().then(
            data => {
            console.log("Response from Neptune for initialize .." + JSON.stringify(data));
        var nodes=[];
        for(var i = 0;    i < data.length;    i++)
        {
            nodes.push({name: data[i].name.toString()});
        }
        var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(nodes)
        };
        console.log("Initialize call response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close(); // look at this carefully!!!
    }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
    });
    }


    if (event.pathParameters.proxy.match(/search/ig)) {
        g.V().has('name', gremlin.process.P.between(event.queryStringParameters.companyname, event.queryStringParameters.tocompany)).limit(20).valueMap(true).toList().then(
            data => {
            console.log(JSON.stringify(data));
            var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("Search call response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close(); // look at this carefully!!!
    }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
    });
    }


    if (event.pathParameters.proxy.match(/getemployees/ig)) {
        g.V().has('Company','~id',event.queryStringParameters.companyid).in_('employ_of').valueMap(true).limit(10).toList().then(
            data => {
            console.log(JSON.stringify(data));
        var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("getemployees response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close();
    }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
    });

    }


    if (event.pathParameters.proxy.match(/getcompanyconcepts/ig)) {
        g.V().has('Company', '~id', event.queryStringParameters.companyid).out('concept_of').limit(3).valueMap(true).toList().then(
            data => {
        console.log("getcompanyconcepts data" + JSON.stringify(data));
        var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("getcompanyconcepts response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close(); // look at this carefully!!!
        }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
        });
    }

    if (event.pathParameters.proxy.match(/getemployers/ig)) {
        g.V().has('Person', '~id', event.queryStringParameters.personid).out('employ_of').limit(3).valueMap(true).toList().then(
            data => {
        console.log("getemployers data" + JSON.stringify(data));
        var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("getemployers response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close(); // look at this carefully!!!
        }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
        });
    }

    if (event.pathParameters.proxy.match(/whichcompaniesbelongtoconcept/ig)) {
        g.V().has('Concept','~id',event.queryStringParameters.conceptid).in_('concept_of').hasLabel('Company').limit(5).valueMap(true).toList().then(
            data => {
            console.log(JSON.stringify(data));
        var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("getcompanyconcepts response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close(); // look at this carefully!!!
    }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
    });
    }
}

mockCallBack = function (request, response){
    JSON.stringify("request" + request);
    JSON.stringify("response" + response);
}

var event = JSON.parse('{"pathParameters": {"proxy": "/initialize/*"}}');
var mainjs = this.handler(event, null, mockCallBack); 

