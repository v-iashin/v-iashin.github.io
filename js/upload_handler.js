// url to server with flask running 
var SERVER_URL = 'https://v-iashin.ml:5000/';
//var SERVER_URL = 'http://35.228.147.191:5000/';

var MAX_SIDE_LEN = 1280;

// adapted from https://codepen.io/nakome/pen/vmKwQg
// vars
preview = document.querySelector('.preview'),
cropped_candidate = document.querySelector('.cropped_candidate'),
crop = document.querySelector('.crop'),
cropped = document.querySelector('.cropped'),
detect = document.querySelector('.detect'),
upload = document.querySelector('#file-input'),
cropper = '';

// on change show image
upload.addEventListener('change', function() {
  if (event.target.files.length) {
    // start file reader
    const reader = new FileReader();
    reader.onload = function() {
      if(event.target.result) {
        // create new image
        let img = document.createElement('img');
        img.id = 'image';
        img.src = event.target.result;
        // clean result before
        preview.innerHTML = '';
        // append new image
        preview.appendChild(img);
        // show crop btn
        crop.classList.remove('hide');
        // init cropper
        cropper = new Cropper(img);
      }
    };
    reader.readAsDataURL(event.target.files[0]);
  }
});

// crop on click
crop.addEventListener('click', function() {
  event.preventDefault();
  // get result to data uri
  var cropped_canvas = cropper.getCroppedCanvas()
  let imgSrc = cropped_canvas.toDataURL("image/jpeg");
  cropped.src = imgSrc;
  // client side reduce the photo size https://embed.plnkr.co/oyaVFn/
  var image = new Image();
  image.onload=function(){
    var canvas=document.createElement("canvas");
    var context=canvas.getContext("2d");
    [canvas.width, canvas.height] = reduceSize(cropped_canvas.width, cropped_canvas.height, MAX_SIDE_LEN);
    context.drawImage(image,
      0,
      0,
      image.width,
      image.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    cropped.src = canvas.toDataURL();
  }
  image.src = cropped.src;
  // remove hide class of img
  cropped.classList.remove('hide');
  cropped_candidate.classList.remove('hide');
  detect.classList.remove('hide');
});

// detect on click
detect.addEventListener('click', function() {
  // progress status
  document.getElementById('progress').innerHTML = 'Processing...';
  
  event.preventDefault();
  // get result to data uri
  var blob = dataURItoBlob(cropped.src);
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
    cropped.src = data['image'];
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