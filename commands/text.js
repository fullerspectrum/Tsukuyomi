function textFilter(text){
    text = text.replace(/<br>/g,"\n");
    return text;
}

function formatFilter(text){
    text = text.replace("_"," ");
    var textA = text.split(" ");
    if(textA.length > 1){
        text = "";
        textA.forEach(i => {
            text += i.substring(0,1).toUpperCase() + i.substring(1).toLowerCase();
        })
    }
    return text;
}

function lengthLimit(text, limit){
     return text.substring(0,limit) + "...";
}

function secFormat(seconds){
    let minutes = Math.floor(seconds / 60);
    console.log(minutes)
    seconds = seconds - (minutes * 60);
    console.log(seconds)
    let hours = Math.floor(minutes / 60);
    console.log(hours)
    minutes = minutes - (hours * 60);
    let output = (hours != 0) ? hours + ":":"";
    output += (minutes < 9) ? minutes + ":":"0" + minutes + ":";
    output += seconds;

    return output;
}

module.exports = {
    textFilter,
    formatFilter,
    secFormat
}