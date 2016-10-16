(function () {
    "use strict";

    var token = null;


    window.onload = function() {
        var readButton = document.getElementById("read");
        readButton.onclick = requestTextToSpeech;
        document.getElementById("txtBtn").onclick = requestText; 

        

        
        $.ajax({
            url: 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
            type: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': 'c6ef727453624d9780e3dfab9db895d0',
            }
        }).done(function(result) {
            console.log(result);
            token = result;
        });
        
        
    };

    function requestText(){
        var params = {
            // Request parameters
            "language": "unk",
            "&detectOrientation": "true",
        };
        $.ajax({
            url: "https://api.projectoxford.ai/vision/v1.0/ocr?" + $.param(params),
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","6192ab012a514ea2b8a7c57b22c08d64");
            },
            type: "POST",
            contentType: "application/json",
            // Request body
            data: JSON.stringify({url:document.getElementById("imgurl").value}),
        })
        .done(function(data) {
            document.getElementById("imgTxt").innerHTML= ""; 
            var lang = document.getElementById("lang"); 
            var display = document.getElementById("imgTxt"); 
            lang.innerHTML += data.language; 
            console.log(data); 
            for(var i =0; i < data.regions.length;i++){
                for(var j =0; j < data.regions[i].lines.length;j++){
                    for(var m =0;m < data.regions[i].lines[j].words.length;m++){
                        var word = data.regions[i].lines[j].words[m].text; 
                        display.innerHTML += word + " "; 
                }
                }
            }
        })
        .fail(function() {
            alert("error");
         
        });

    }

    function requestTextToSpeech() {
        //Set variables here to the language and text to be read, 
        //then put those variables in the data string
        console.log('button clicked');

        $.ajax({
            url: 'https://speech.platform.bing.com/synthesize',
            type: 'post',
            data: '<speak version=\'1.0\' xml:lang=\'en-US\'><voice xml:lang=\'en-US\' xml:gender=\'Female\' name=\'Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)\'>Microsoft Bing Voice Output API</voice></speak>',
            headers: {
                'Content-Type': 'audio/wav; samplerate=8000',
                'X-Microsoft-OutputFormat': 'riff-8khz-8bit-mono-mulaw',
                'Authorization': 'Bearer ' + token
            }
        }).done(function(result) {
            //var audio = document.getElementById("player");
            //audio.src = "data:audio/x-wav;base64,"+result;
            //audio.src = window.URL.createObjectURL(result);

            try{
                // Initialize web audio stuff
            window.AudioContext = window.AudioContext||window.webkitAudioContext||window.mozAudioContext;
            var context = new AudioContext();
            var source = context.createBufferSource();
            // Start token request
            var tokenXhr = new XMLHttpRequest();

            tokenXhr.open("POST", "https://api.cognitive.microsoft.com/sts/v1.0/issueToken");
            
            tokenXhr.setRequestHeader("Ocp-Apim-Subscription-Key", "c6ef727453624d9780e3dfab9db895d0");
            tokenXhr.addEventListener("load", function () {
                var token = this.responseText;
                // After we have our token, request the audio
                var speechXhr = new XMLHttpRequest();
                
                speechXhr.open("POST", "https://speech.platform.bing.com/synthesize");


                
                speechXhr.responseType = "arraybuffer";
                speechXhr.setRequestHeader("Content-Type", "application/ssml+xml");
                speechXhr.setRequestHeader("X-Microsoft-OutputFormat", "riff-8khz-8bit-mono-mulaw");
                speechXhr.setRequestHeader("Authorization", "Bearer " + token);
                speechXhr.addEventListener("load", function() {
                    // Decode the audio
                    context.decodeAudioData(this.response, function(buffer) {
                        source.buffer = buffer;
                    }, null);
                });
                //console.log(document.getElementById("imgTxt").innerHTML);
                speechXhr.send("<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)'>"+ document.getElementById("imgTxt").innerHTML+ "</voice></speak>");
                // Play the audio (when it's decoded)
                source.connect(context.destination);
                source.start(0);
            });
 
            // Lez do it
            tokenXhr.send();
            }
            catch(e){
                alert("Web Audio API not supported");

            }

            //console.log(result);
            //TODO: figure out how to play this sound
            //idea 1: way to play this sound raw?
            //idea 2: find way to write it to a file. then play that file 
            //question that would help: what form is this returned in exactly and how do I 
            //work with that in js?
           
    });
    }
})();