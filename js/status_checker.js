// url to server with flask running 
var STATUS_CHECK_URL = 'https://v-iashin.ml:5000/status_check';

// try certified IP (but note the possible ephemeralizm)

// by default it is down
document.getElementById('status').innerHTML = "<span id='status_down' alt='down'> offline </span>";

$.ajax({
 //your server url
 url: STATUS_CHECK_URL,
 type: 'GET',
 success: function() {
   document.getElementById('status').innerHTML = "<span id='status_ok'>online</span>";
 },
 error: function() {
   document.getElementById('status').innerHTML = "<span id='status_down' alt='down'>offline</span>";
 }
});
