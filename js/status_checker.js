// url to server with flask running 
var STATUS_CHECK_URL = 'https://vdyashin.ml:5000/status_check';

$.ajax({
 //your server url
 url: STATUS_CHECK_URL,
 type: 'GET',
 success: function(){
   document.getElementById('status').innerHTML = "<span id='status_ok'> &#9679 </span>";
 },
 error: function(){
   document.getElementById('status').innerHTML = "<span id='status_down'> &#9679 </span>";
 }
});
