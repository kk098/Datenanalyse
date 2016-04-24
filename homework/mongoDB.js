
var request = require("request");
var mongoose = require('mongoose');
var fs = require("fs");

var fileName = "/Users/kathi/Datenanalyse/homework/ppn.txt";
// read contents of ppn file
var ppnContent = fs.readFileSync(fileName).toString();
var array = JSON.parse(ppnContent);

mongoose.connect('mongodb://localhost/SWB');

//Create a model to save data in mongodb
var Item = mongoose.model('Item', {
    ppn: String,
    xml: String
});

array.forEach(function (ppn){
    var url = "http://swb.bsz-bw.de/sru/DB=2.1/username=/password=/?query=pica.ppn+%3D+%22" + ppn + "%22&version=1.1&operation=searchRetrieve&stylesheet=http%3A%2F%2Fswb.bsz-bw.de%2Fsru%2F%3Fxsl%3DsearchRetrieveResponse&recordSchema=marc21&maximumRecords=1&startRecord=1&recordPacking=xml&sortKeys=none&x-info-5-mg-requestGroupings=none"
    saveRequest(url, ppn);
});

function saveRequest(url , ppn){
    request({
        url: url,
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var item = new Item({
                ppn: ppn,
                xml: body
            });
            item.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('saved');
                }
            });
        }
    });
}
