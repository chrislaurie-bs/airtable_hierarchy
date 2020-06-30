
export default function logThis(message) {    
    const logNow=false; //set  to false to stop logging like before a release
    if(logNow){
        console.log(message);
    }
}