function getCredentials(callbackFunction) {
  var data = {
    'grant_type': 'client_credentials',
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET
  };

  var url = 'https://api.clarifai.com/v1/token';
  console.log(url);
  console.log("in getCredentials ");
  return axios.post(url, data, {
    'transformRequest': [
      function() {
        return transformDataToParams(data);
      }
    ]
  }).then(function(r) {
    localStorage.setItem('accessToken', r.data.access_token);
    localStorage.setItem('tokenTimestamp', Math.floor(Date.now() / 1000));
    callbackFunction();
  },
   function(err) {
    console.log(err);
  });
}

function transformDataToParams(data) {
  var str = [];
  for (var p in data) {
    if (data.hasOwnProperty(p) && data[p]) {
      if (typeof data[p] === 'string'){
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p]));
      }
      if (typeof data[p] === 'object'){
        for (var i in data[p]) {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p][i]));
        }
      }
    }
  }
  return str.join('&');
}

function postImage(imgurl) {
  var accessToken = localStorage.getItem('accessToken');
  
  //this (might) have to be the place to differentiate b64 & urls
  //so var data can be initialized with the right key
  
  var data = {image: imgurl};
  if(typeof(imgurl) != 'object'){
    data = {
      'url': imgurl
    };
  }


  var url = 'https://api.clarifai.com/v1/tag';
  console.log("access " + accessToken);
  return axios.post(url, data, {
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    }


  }).then(function(r) {
    parseResponse(r.data, imgurl);
  }, function(err) {
    console.log('Sorry, something is wrong: ' + err);
  });
}

function parseResponse(resp, imgurl) {
  var tags = [];
  console.log("resp " + resp);
  if (resp.status_code === 'OK') {
    var results = resp.results;
    tags = results[0].result.tag.classes;
    tags = tags.slice(0, 4);
  } else {
    console.log('Sorry, something is wrong.');
  }
  document.getElementById('tags').innerHTML = tags.toString().replace(/,/g, ', ');
  document.getElementById('testImage').src = imgurl;
  return tags;
}

function run(imgurl) {
  if (Math.floor(Date.now() / 1000) - localStorage.getItem('tokenTimeStamp') > 86400 || localStorage.getItem('accessToken') === null) {
    getCredentials(function() {
      postImage(imgurl);
    });

  } else {
    postImage(imgurl);
  }
}

function previewFile() {
      var preview = document.querySelector('img');
      var file    = document.querySelector('input[type=file]').files[0];
      var reader  = new FileReader();

      reader.onloadend = function () {
          var base64 = reader.result;
          document.getElementById("testImage").src = base64;

          var imageObj = {base64: base64};
          
          //run() did not work
          run(imageObj);
          //$('<img />',{src: base64, alt:'MyAlt'}).appendTo($('#YourDiv'));
    };

      if (file) {
          reader.readAsDataURL(file);

      } else {
          preview.src = "";
      }
  }