//main_scrape.js
var newData = {}
var base_url = "http://example.com/ajax_search?page="
var addl_parms = "&_len=100&app_id=206&_sortfld=distance&_sortdir=ASC&_fil%5B0%5D%5Bfield%5D=_location&_fil%5B0%5D%5Boperator%5D=NEAR"
var lat_lon;

function httpGetAsync(theUrl, iteration, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText, iteration);
    }
    console.log("theUrl: " + theUrl)
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

/**
    Each request returns a json file with the data we want. 
    Look for the necessary fields, and following that is the 
    ID for the page we want:
**/
function processResponseText(responseTextObject, iteration){
    var startPoint = iteration * 100;
    for(i=0; i < responseTextObject['data']['data'].length; i++){ 
        startPoint++;
        newData[startPoint] = responseTextObject['data']['data'][i][6]+"/"+responseTextObject['data']['data'][i][7];
    }
}

function dataDumpCallback(responseText, iteration){
    processResponseText(JSON.parse(responseText), iteration);
}

//This will return the first dataset.
function initialGetCallback(responseText, iteration){
    var responseObject = JSON.parse(responseText)
    /**
        The value "recs:" is the number of records based on query. 
        data['recs']
    **/
    recs = responseObject.data['recs']

    //number of results per page:
    x = 100;
    //number of records:
    y = recs;

    /**
        Quick JS ternary tells me I need to request this page 4 more times:
        ##number of results per page:
        x = 100 
        ##number of records:
        y = recs
        ~~(y/x)+(y%x!=0?1:0) = 5
    **/
    var iterations = ~~(y/x)+(y%x!=0?1:0);

    /**
        We created the initial request, so we have 4 requests left, 
        where the "page=" is updated for the following pages:

        http://example.com/ajax_search?_len=100&page=1&app_id=206&_sortfld=distance&_sortdir=ASC&_fil%5B0%5D%5Bfield%5D=_location&_fil%5B0%5D%5Boperator%5D=NEAR&_fil%5B0%5D%5Bvalue%5D%5Blatitude%5D=41.9403795&_fil%5B0%5D%5Bvalue%5D%5Blongitude%5D=-87.65318049999996
    **/
    for (i = 0; i < iterations; i++){
        httpGetAsync(base_url + i + addl_parms + lat_lon, i, dataDumpCallback);
    }
}

function get_data(lat, lon){
    var loc_lat = "&_fil%5B0%5D%5Bvalue%5D%5Blatitude%5D=".concat(lat)
    var loc_lon = "&_fil%5B0%5D%5Bvalue%5D%5Blongitude%5D=".concat(lon)
    lat_lon = loc_lat + loc_lon
    
    var full_url = base_url + 0 + addl_parms + lat_lon
    console.log("full url: " + full_url)
    httpGetAsync(full_url, 0, initialGetCallback);
}

function save_file(file_name){
    dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(newData));
    a = document.createElement('a');
    a.href = 'data:' + dataStr;
    a.innerHTML = 'download JSON';

    container = document.getElementsByClassName('viewport')
    container[0].appendChild(a)
    //dlAnchorElem.setAttribute("href",     dataStr     );
    a.setAttribute("download", file_name.concat(".json"));
    a.click();
}