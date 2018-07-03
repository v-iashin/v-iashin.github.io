// url to server with flask running 
var SERVER_URL = 'https://vdyashin.ml:5000/'

// adapted from https://codepen.io/nakome/pen/vmKwQg
// vars
let result = document.querySelector('.result'),
img_result = document.querySelector('.img-result'),
//img_w = document.querySelector('.img-w'),
//img_h = document.querySelector('.img-h'),
options = document.querySelector('.options'),
save = document.querySelector('.save'),
cropped = document.querySelector('.cropped'),
detect = document.querySelector('.detect'),
upload = document.querySelector('#file-input'),
cropper = '';

// on change show image with crop options
upload.addEventListener('change', (e) => {
  if (e.target.files.length) {
    // start file reader
    const reader = new FileReader();
    reader.onload = (e) => {
      if(e.target.result){
        // create new image
        let img = document.createElement('img');
        img.id = 'image';
        img.src = e.target.result
        // clean result before
        result.innerHTML = '';
        // append new image
        result.appendChild(img);
        // show save btn and options
        save.classList.remove('hide');
        // init cropper
        cropper = new Cropper(img);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

// save on click
save.addEventListener('click', (e)=>{
  e.preventDefault();
  // get result to data uri
  let imgSrc = cropper.getCroppedCanvas().toDataURL("image/jpeg");
  // remove hide class of img
  cropped.classList.remove('hide');
	img_result.classList.remove('hide');
	// show image cropped
  cropped.src = imgSrc;
  detect.classList.remove('hide');
//  detect.download = 'imagename.png';
//  detect.setAttribute('href', imgSrc);
});

// save on click
detect.addEventListener('click', (e)=>{
  e.preventDefault();
  // get result to data uri
  var blob = dataURItoBlob(cropped.src);
  var form_data = new FormData();
  form_data.append('file', blob);
  $.ajax({
    type: 'POST',
    url: SERVER_URL,
    data: form_data,
    contentType: false,
    processData: false,
    dataType: 'json',
  }).done(function(data, textStatus, jqXHR) {
    console.log(data);
    console.log(textStatus);
    console.log(jqXHR);
    console.log('Success!');
//      $("#resultFilename").text("Filename: " + data['name']);
//      $("#resultFilesize").text("File size: " + data['size']);
//      $('#resultImg').append('<img src="' + data['image'] + '" />');
    cropped.src = data['image'];
  }).fail(function(data){
//    alert('error!');
    console.log("ERRORRRR: ");
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
