// url to server with flask running 
var SERVER_URL = 'https://v-iashin.ml:5000/';
//var SERVER_URL = 'http://35.228.147.191:5000/';

var MAX_SIDE_LEN = 1280;

console.log('upload handler COPY !!!!');

// adapted from https://codepen.io/nakome/pen/vmKwQg
// vars
preview = document.querySelector('.preview');
detect = document.querySelector('.detect');
upload = document.querySelector('#file-input');

// on change show image
upload.addEventListener('change', function() {
  if (event.target.files.length) {
    // start file reader
    var reader = new FileReader();
    reader.onload = function() {
      if(event.target.result) {
        // create new image element inside the preview div
        let img = document.createElement('img');
        img.id = 'image';
        img.src = event.target.result;
        console.log(img.src.height)
        // resize the image
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        [canvas.width, canvas.height] = reduceSize(img.width, img.height, MAX_SIDE_LEN);
        context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
        preview.src = canvas.toDataURL();
        // clean result before
        preview.innerHTML = '';
        // append new image
        preview.appendChild(img);
        
        // show crop btn
        detect.classList.remove('hide');
      };
    };
    reader.readAsDataURL(event.target.files[0]);
  };
});

// detect on click
detect.addEventListener('click', function() {
  // progress status
  document.getElementById('progress').innerHTML = 'Processing...';
  event.preventDefault();
  
  // get result to data uri
  var blob = dataURItoBlob(preview.firstElementChild.src);
  var form_data = new FormData();
  form_data.append('file', blob);
  $.ajax({
    type: 'POST',
    url: SERVER_URL,
    data: form_data,
    timeout: 1000 * 25, // ms
    contentType: false,
    processData: false,
    dataType: 'json',
  }).done(function(data, textStatus, jqXHR) {
    preview.firstElementChild.src = data['image'];
    // progress status
    document.getElementById('progress').innerHTML = 'Done';
  }).fail(function(data){
    alert('It seems that the detector is not working right now but you tried to upload an image. If you are still interested please contact me.');
  });
});


// https://stackoverflow.com/a/5100158/3671347
function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type:mimeString});
}

function reduceSize(width, height, max_side_len) {
  if (Math.max(width, height) <= max_side_len) {
    return [width, height];
  }
  else if (width >= height) {
    height *= max_side_len / width;
    width = max_side_len;
    return [width, height];
  }
  else if (width < height) {
    width *= max_side_len / height;
    height = max_side_len;
    return [width, height];
  }
}