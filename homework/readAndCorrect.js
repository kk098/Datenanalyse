var fs = require("fs");
var data = '';
var fileName = "/Users/kathi/Datenanalyse/homework/Liste_PPN-ExNr_HSHN-libre.csv";

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


lines.forEach(function (line) {
    //split lines at comma but ignore comma between double quotes
    tokens = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    // in case csv is NOT wellformed in all lines .. write broken lines to output file
    if (tokens.length != firstLine.length) {
        brokenStream.write(line + '\n');
        return;
    }

    var dataObject = {
        [firstLine[0]]: tokens[0],
        [firstLine[1]]: tokens[1],
        [firstLine[2]]: tokens[2],
        [firstLine[3]]: tokens[3],
        [firstLine[4]]: tokens[4]
    };

    // correct first field - it has to have at least 9 chars
    var ppn = dataObject[firstLine[0]];

    if (ppn.length < 9) {
        dataObject[firstLine[0]] = '0'.repeat(9 - ppn.length) + ppn;
    }

    array.push(dataObject);

});


//convert array to json object and write it to result.txt
resultStream.write(JSON.stringify(array, 0, 2));


//get unique values for a defined key
function getUniqueValues(keyName) {
    var seen = {}
    var tempArray = array.map(function (entry) {
        return entry[keyName];
    });
    return tempArray.filter(function (x) {
        if (seen[x])
            return;
        seen[x] = true;
        return x;
    });
}


//use it: get an array about requested keys || result is an array
function mapEntries(myArray, key) {
    return myArray.map(function (entry) {
        return entry[key];
    })
}

//get unique values of all keynames || result is another array!
var unique = function (xs) {
    var seen = {}
    return xs.filter(function (x) {
        if (seen[x])
            return;
        seen[x] = true
        return x
    })
};

//How many objects are available for the given key?
function getExemplarsForKey(key) {
    //empty object to save results
    var tempArray = {};

    for (var entry in array) {
        //check if Key exits in tempArray
        var groupKey = array[entry][key];

        if (groupKey in tempArray){
            //just increase the number
            tempArray[groupKey] += 1;
        }
        else {
            //add new object to tempArray
            tempArray[groupKey] = 1;
        }
    }
    return tempArray;
}

//Write statistical results to statistic.txt
var allEntries = array.length;
statisticStream.write(
    getUniqueValues('Sigel').length + ' Sigel are available: ' + getUniqueValues('Sigel') + '\n' +
    getUniqueValues('PPN').length + ' different PPNs (Titles) listed\n' +
    getUniqueValues('ExemplarDatensatznr').length + ' unique Exemplar Numbers -> ' + ((allEntries) - (getUniqueValues('ExemplarDatensatznr').length)) + ' have a failure\n' +
    getUniqueValues('Barcode').length + ' different Barcodes -> ' + ((allEntries) - (getUniqueValues('Barcode').length)) + ' have a failure\n' +
    getUniqueValues('Signatur').length + ' different Signatures\n' +
    'Histogram for the amount of exemplars per location:\n' + JSON.stringify(getExemplarsForKey('Sigel'), 0, 2) +
    'Histogram for the amount of exemplars per title:\n' + JSON.stringify(getExemplarsForKey('PPN'), 0, 2)

);


//var util = require('util');
//resultStream.write(util.inspect(array, false, null));
resultStream.close();


console.log('\n\t' + allEntries + " corrected objects written to result.txt.");
console.log("\tstatistic.txt file is available. ");
console.log("\nProgram ended.");

