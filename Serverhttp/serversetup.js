const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer(requestHandler);

let ramStorageArray= [];
let ramIndex = 0;

function PutOrder(thing){
    ramStorageArray[ramIndex] = thing;
    ramIndex++
    console.log("DEN HAR LEVEREDE ORDREN");

}

function jsonResponse(res,obj){
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(obj));
  res.end('\n');
}




function requestHandler(req,res){
let baseURL = 'http://' + req.headers.host + '/';
let url=new URL(req.url,baseURL);
let queryPath=decodeURIComponent(url.pathname); //æøå to string also
let pathElements=queryPath.split("/");
switch (req.method) {
    case "POST": {
        switch (pathElements[1]) {
            case "postReq":
                extractJSON(req)
                    .then(data => {
                        PutOrder(data);
                        jsonResponse(res, { message: "Order received" });
                    })
                    .catch(err => {
                        console.log("There is an error", err);
                        res.statusCode = 400;
                        res.write("Invalid JSON");
                        res.end();
                    });
                break;
            default:
                console.log("Resource doesn't exist");
                res.statusCode = 404;
                res.write("Resource doesn't exist");
                res.end();
        }
        break;
    }
    case "GET": {
        switch (pathElements[1]) {
            case "": // get html page if only write localhost:3000 or ip:3000
                fileResponse(res, "index.html");
                break;
            case "nummer":
               const dataSend = ramStorageArray;
               jsonResponse(res,dataSend);
                break;
            default: // for anything else we assume it is a file to be served
                fileResponse(res, req.url);
                break;
        }
        break;
    }
    default:
        res.statusCode = 405;
        res.write("Method not allowed");
        res.end();
        break;
}
}


function guessMimeType(fileName){
    const fileExtension=fileName.split('.').pop().toLowerCase();
    console.log(fileExtension);
    const ext2Mime ={ //Aught to check with IANA spec
      "txt": "text/txt",
      "html": "text/html",
      "ico": "image/ico", // CHECK x-icon vs image/vnd.microsoft.icon
      "js": "text/javascript",
      "json": "application/json", 
      "css": 'text/css',
      "png": 'image/png',
      "jpg": 'image/jpeg',
      "wav": 'audio/wav',
      "mp3": 'audio/mpeg',
      "svg": 'image/svg+xml',
      "pdf": 'application/pdf',
      "doc": 'application/msword',
      "docx": 'application/msword'
     };
      //incomplete
    return (ext2Mime[fileExtension]||"text/plain");
  }

function fileResponse(res,filename){
    fs.readFile(path.join(__dirname, filename), (err, data) => {
    if(err){
        res.statusCode = 404;
        res.write("Bad request");
        console.log(err);
        res.end();
    }else{
        res.statusCode = 200;
        res.setHeader('Content-Type', guessMimeType(filename));
        res.write(data);
        res.end('\n');
    }
    })
}

const hostname = '127.0.0.1';
const port = 3000;

server.listen(port, hostname, function(){
    console.log("Server running on " + hostname + ":" + port);
});




function extractJSON(req){
    if(isJsonEncoded(req.headers['content-type']))
     return collectPostBody(req).then(body=> {
       let x= JSON.parse(body);
       //console.log(x);
       return x;
    });
    else
      return Promise.reject(new Error(ValidationError)); //create a rejected promise
}

const MessageTooLongError="MsgTooLong";
function collectPostBody(req){
    //the "executor" function
   function collectPostBodyExecutor(resolve,reject){
      let bodyData = [];
      let length=0;
      req.on('data', (chunk) => {
        bodyData.push(chunk);
        length+=chunk.length; 
   
        if(length>10000000) { //10 MB limit!
          req.connection.destroy(); //we would need the response object to send an error code
          reject(new Error(MessageTooLongError));
        }
      }).on('end', () => {
      bodyData = Buffer.concat(bodyData).toString(); //By default, Buffers use UTF8
      console.log(bodyData);
      resolve(bodyData); 
      });
      //Exceptions raised will reject the promise
    }
    return new Promise(collectPostBodyExecutor);
}

function isJsonEncoded(contentType){
    //Format 
    //Content-Type: application/json; encoding
    let ctType=contentType.split(";")[0];
    ctType=ctType.trim();
    return (ctType==="application/json"); 
  //would be more robust to use the content-type module and  contentType.parse(..)
}