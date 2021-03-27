// url to server with flask running
var SERVER_URL = 'https://iashin.ml:5000/';

// set max side length for an uploaded image
var MAX_SIDE_LEN = 1280;

upload = document.querySelector('#file-input');
examples_text = document.querySelector('#examples_text');
example_street = document.querySelector('#example_street');
example_wedding = document.querySelector('#example_wedding');
example_ngc1499 = document.querySelector('#example_ngc1499');
example_dog = document.querySelector('#example_dog');
preview = document.querySelector('.preview');
rld = document.querySelector('.reload');
canvas = document.createElement('canvas');
context = canvas.getContext('2d');
img = new Image();
resized_img = new Image();
var orientation;

function onload_func() {
  // extracting the orientation info from EXIF which will be sent to server
  EXIF.getData(img, function () {
    orientation = EXIF.getTag(this, 'Orientation');
  });
  // resize the sides of the canvas and draw the resized image
  [canvas.width, canvas.height] = reduceSize(img.width, img.height, MAX_SIDE_LEN);
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  // adds the image that the canvas holds to the source
  resized_img.src = canvas.toDataURL('image/jpeg');
  // clean result before doing anything
  preview.innerHTML = '';
  // append new image
  preview.appendChild(resized_img);
  // hide examples text
  examples_text.classList.remove('examples_text');
  examples_text.classList.add('hide');
  // send the user image on server and wait for response, and, then, shows the result
  send_detect_show();
}

// example on click
example_dog.addEventListener('click', function () {
  event.preventDefault();
  // clean result before
  preview.innerHTML = '';
  // resize the image
  img.onload = onload_func;
  img.src = "../images/detector_examples/dog.jpg";
});
example_street.addEventListener('click', function () {
  event.preventDefault();
  // clean result before
  preview.innerHTML = '';
  // resize the image
  img.onload = onload_func;
  img.src = "../images/detector_examples/street.jpg";
});
example_wedding.addEventListener('click', function () {
  event.preventDefault();
  // clean result before
  preview.innerHTML = '';
  // resize the image
  img.onload = onload_func;
  img.src = "../images/detector_examples/wedding.jpg";
});
example_ngc1499.addEventListener('click', function () {
  event.preventDefault();
  // clean result before
  preview.innerHTML = '';
  // resize the image
  img.onload = onload_func;
  img.src = "../images/detector_examples/NGC1499.jpg";
});


upload.addEventListener('change', function() {
  event.preventDefault();
  // clean result before
  preview.innerHTML = '';

  // start file reader
  var reader = new FileReader();

  reader.onload = function(event) {
    if(event.target.result) {
      // resize the image
      img.onload = onload_func;
      // evokes the function above ('onload to src attr')
      img.src = event.target.result;
    };
  };
  reader.readAsDataURL(event.target.files[0]);
});

// send the user image on server and wait for response
function send_detect_show() {
  // remove upload button
  var element = document.getElementById('upload');
  element.parentNode.removeChild(element);
  // show detect (progress) button
  detect.classList.remove('hide');
  // make the btn unresponsive
  detect.classList.add('progress');
  // progress status
  detect.innerHTML = 'Processing...';
  // get result to data uri
  var blob = dataURItoBlob(preview.firstElementChild.src);
  // form POST request to the server
  var form_data = new FormData();
  form_data.append('file', blob);
  form_data.append('orientation', orientation);
  console.log(orientation);
  $.ajax({
    type: 'POST',
    url: SERVER_URL,
    data: form_data,
    timeout: 1000 * 25, // ms, to wait until call .fail function
    contentType: false,
    processData: false,
    dataType: 'json',
  }).done(function (data, textStatus, jqXHR) {
    // replace the current image with an image with detected objects
    preview.firstElementChild.src = data['image'];
    // remove detect button
    detect.parentNode.removeChild(detect);
    // and show the reload button
    rld.classList.remove('hide');
  }).fail(function (data) {
    alert("Wow! That's weird. It seems it didn't work for you, but it had to. Please let me know about this odd situation on vdyashin@gmail.com or in Issues on GitHub. Or reaload the page and try again.");
    // remove detect button
    detect.parentNode.removeChild(detect);
    // and show the reload button
    rld.classList.remove('hide');
  });
}

// reload page (reset) on click
function reload() {
  location.reload();
}

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

// reduces the size of the uploaded image such that max(width, hight) = max_side_len
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
