const creatorName = document.getElementById("creatorName");
const newBeer = document.getElementById("newBeer");
const createBeer = document.getElementById("createbeer");
const numberBeer = document.getElementById("whatNumber");
const checkBeerButton = document.getElementById("checkbeer");



let newObject = {};

let checkObject = {};

createBeer.addEventListener("click",updateSend);

checkBeerButton.addEventListener("click",checkBeer);


function checkBeer(){
    checkObject.number = numberBeer.value;
    
    jsonFetch("nummer")
    .then(data => printData(data));
}

function updateSend(){
    newObject.Cname = creatorName.value;
    newObject.Bname = newBeer.value;
    console.log("posting bear :)");
    jsonPost("postReq", newObject);

}

function jsonFetch(url){
    return  fetch(url).then(jsonParse);
}

function jsonPost(url, data){
    const options={
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
          'Content-Type': 'application/json'
        },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
      };
    return fetch(url,options).then(jsonParse);
  }

  function jsonParse(response){
    if(response.ok) 
       if(response.headers.get("Content-Type") === "application/json") 
         return response.json();
       else throw new Error("Wrong Content Type");
   else 
      throw new Error("Non HTTP OK response");
  }

  function jsonFetch(url){
    return  fetch(url).then(jsonParse);
  }

  function printData(data){
    console.log(data);
    data.forEach(element => {
      console.log(element);
    });
  
    



  }