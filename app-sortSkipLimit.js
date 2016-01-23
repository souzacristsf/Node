var MongoClient = require('mongodb').MongoClient,
    commandLineArgs = require('command-line-args'),
    assert = require('assert');


var options = commandLineOptions();


MongoClient.connect('mongodb://localhost:27017/be-mean', function(err, db) {

    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");

    var query = queryDocument(options);
    var fields = fieldsDocument(options);

    var cursor = db.collection('pokemons').find(query);
    cursor.project(fields);
    cursor.limit(options.limit);
    cursor.skip(options.skip);
    cursor.sort([["name", 1], ["defense", -1]]);

    var numMatches = 0;

    cursor.forEach(
        function(doc) {
            numMatches = numMatches + 1;
            if(doc.speed === undefined) {
                console.log("Pokemos " + doc.name +
                    "\n\t" + "Attack -> " + doc.attack +
                    "\n\t" + "Defense -> " + doc.defense);
            }
            else {
                console.log("Pokemos " + doc.name +
                    "\n\t" + "Attack -> " + doc.attack +
                    "\n\t" + "Defense -> " + doc.defense +
                    "\n\t" + "Speed -> " + doc.speed);
            }
        },
        function(err) {
            assert.equal(err, null);
            console.log("Our query was:" + JSON.stringify(query));
            console.log("Documents displayed: " + numMatches);
            return db.close();
        }
    );

});


function queryDocument(options) {

    console.log(options);

    var query = {
        "attack": {
            "$gte": options.attack
        },
        "defense": {
            "$gte": options.defense
        }
    };

    if ("speed" in options) {
        query.speed = { "$gte": options.speed };
    }
    console.log(query);
    return query;

}

function fieldsDocument(options) {

    var fields = {
       "_id": 0,
       "name": 1,
       "attack": 1,
        "defense": 1
    };

    if ("speed" in options) {
        fields.speed = 1;
    }

    return fields;
}


function commandLineOptions() {

    var cli = commandLineArgs([
        { name: "attack", alias: "a", type: Number },
        { name: "defense", alias: "d", type: Number },
        { name: "speed", alias: "s", type: Number },
        { name: "skip", type: Number, defaultValue: 0 },
        { name: "limit", type: Number, defaultValue: 620 }
    ]);

    var options = cli.parse()
    if ( !(("attack" in options) && ("defense" in options))) {
        console.log(cli.getUsage({
            title: "Usage",
            description: "The first two options below are required. The rest are optional."
        }));
        process.exit();
    }

    return options;

}

// References
//https://university.mongodb.com/courses/MongoDB
// WEEK 3: THE NODE.JS DRIVER


