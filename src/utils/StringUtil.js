
var StringUtil = {
    convertNumberToStringWithCommas:function(number){
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    convertTimeToString:function(seconds){
        var timeString = "";
        var date = Math.trunc(seconds/86400);
        if (date>0){
            timeString=date+"d";
        }
        seconds -= date*86400;
        var hour = Math.trunc(seconds/3600);
        if (hour>0){
            timeString+=hour+"h";
        }
        seconds -= hour*3600;
        var minute = Math.trunc(seconds/60);
        if (minute>0){
            timeString+=minute+"m";
        }
        seconds -= minute*60;
        if (seconds>0){
            timeString+=seconds+"s";
        }
        if (timeString === "") timeString = "0s";
        return timeString;
    },
}