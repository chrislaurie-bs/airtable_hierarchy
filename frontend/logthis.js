
export default function logThis(message) {    
    const logNow=''; //make null to stop logging like before a release
    if(logNow != null){
        console.log(message);
    }
}