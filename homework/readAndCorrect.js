var fs = require("fs");
var data = '';
var fileName = "/Users/kathi/Datenanalyse/homework/test.csv";

// read contents of file
var contents = fs.readFileSync(fileName).toString();

// split to lines
var lines = contents.match(/[^\r\n]+/g);

// objects may land here
var array = [];

// first line contains description of columns
var firstLine = lines.shift().split(",");

// output stream for broken lines
var brokenStream = fs.createWriteStream('errors.txt');

// output for resulting array
var resultStream = fs.createWriteStream('results.txt');

// output stream for statistic analysis
var statisticStream = fs.createWriteStream('statistic.txt');


if (firstLine.length < 5) {
    process.exit();
}

var tokens;

lines.forEach(function(line) {
    //split lines at comma but ignore comma between double quotes
    tokens = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    // in case csv is NOT wellformed in all lines .. write broken lines to output file
    if (tokens.length != firstLine.length) {
        brokenStream.write(line + '\n');
        return;
    }

    var dataObject = {
        [firstLine[0]] : tokens[0],
        [firstLine[1]] : tokens[1],
        [firstLine[2]] : tokens[2],
        [firstLine[3]] : tokens[3],
        [firstLine[4]] : tokens[4]
    };

    // correct first field - it has to have at least 9 chars
    var ppn = dataObject[firstLine[0]];

    if (ppn.length < 9) {
        dataObject[firstLine[0]] = '0'.repeat(9 - ppn.length) + ppn;
    }

    array.push(dataObject);

});


var util = require('util');

resultStream.write(util.inspect(array, false, null));
resultStream.close();

console.log("extracted " + array.length + " objects from csv.");
console.log("Program ended.");




