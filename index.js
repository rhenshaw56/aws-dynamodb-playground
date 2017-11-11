const AWS = require('aws-sdk');

AWS.config.update({
    region: "us-west-2",
    endpoint: 'http://localhost:8000',
    // accessKeyId default can be used while using the downloadable version of DynamoDB.
    // For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
    accessKeyId: "fakeMyKeyId",
    // secretAccessKey default can be used while using the downloadable version of DynamoDB.
    // For security reasons, do not store AWS Credentials in your files. Use AmazonCognito instead.
    secretAccessKey: "fakeSecretAccessKey"
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

document.createMovies = function createMovies() {
    var params = {
        TableName : "Movies",
        KeySchema: [
            { AttributeName: "year", KeyType: "HASH"},
            { AttributeName: "title", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
            { AttributeName: "year", AttributeType: "N" },
            { AttributeName: "title", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
  };
        dynamodb.createTable(params, function(err, data) {
            if (err) {
                document.getElementById('textarea').innerHTML = "Unable to create table: " + "\n" + JSON.stringify(err, undefined, 2);
            } else {
                document.getElementById('textarea').innerHTML = "Created table: " + "\n" + JSON.stringify(data, undefined, 2);
            } }
        );
  }

document.downloadFile = function processFile(evt) {
    console.log("tytyt");
      document.getElementById('textarea').innerHTML = "";
      document.getElementById('textarea').innerHTML += "Importing movies into DynamoDB. Please wait..." + "\n";
      console.log("event", evt);
      var file = evt.target.files[0];
      if (file) {
          var r = new FileReader();
          r.onload = function(e) {
              var contents = e.target.result;
              var allMovies = JSON.parse(contents);
              allMovies.forEach(function (movie) {
                  document.getElementById('textarea').innerHTML += "Processing: " + movie.title + "\n";
                  var params = {
                      TableName: "Movies",
                      Item: {
                          "year": movie.year,
                          "title": movie.title,
                          "info": movie.info
                        }
                    };
                docClient.put(params, function (err, data) {
    if (err) {
        document.getElementById('textarea').innerHTML += "Unable to add movie: " + count + movie.title + "\n";
        document.getElementById('textarea').innerHTML += "Error JSON: " + JSON.stringify(err) + "\n";
    } else {
        document.getElementById('textarea').innerHTML += "PutItem succeeded: " + movie.title + "\n";
        textarea.scrollTop = textarea.scrollHeight;
    }
}); });
};
r.readAsText(file);
} else {
alert("Could not read movie data file");
}
}

document.addMovieItem = function addMovieItem() {
    const formItems = document.getElementById('movie-info').children;
    const items = Object.keys(formItems);
    const Item = {};
    const info = {};
    const params = {
        TableName: "Movies"
    };
    items.forEach((item) => {
        if (formItems[item].value) {
            const key = formItems[item].name
            if (key === 'title') {
                Item[key] = formItems[item].value;
                formItems[item].value = '';
                return;
            }
            if (key === 'year') {
                Item[key] = Number(formItems[item].value);
                formItems[item].value = '';
                return;
            }
            info[key] = formItems[item].value;
            formItems[item].value = '';
            return;
        }
        return;
    });
    Item["info"] = info;
    params['Item'] = Item;
    docClient.put(params, function(err, data) {
        if (err) {
            document.getElementById('textarea').innerHTML = "Unable to add item: " + "\n" + JSON.stringify(err, undefined, 2);
        } else {
            document.getElementById('textarea').innerHTML = "PutItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2);
        } 
    });
}

document.findMovie = function findMovie() {
    console.log("We on!");
    const formItems = document.getElementById('movie-query').children;
    const items = Object.keys(formItems);
    const keys = {};
    const params = {
        TableName: "Movies"
    };
    items.forEach((item) => {
        if (formItems[item].value) {
            const key = formItems[item].name
            if (key === 'title') {
                keys[key] = formItems[item].value;
                formItems[item].value = '';
                return;
            }
            if (key === 'year') {
                keys[key] = Number(formItems[item].value);
                formItems[item].value = '';
                return;
            }
        }
        return;
    });
    params['Key'] = keys;
    console.log("params", params);
    docClient.get(params, function(err, data) {
        if (err) {
            document.getElementById('textarea').innerHTML = "Unable to read item: " + "\n" + JSON.stringify(err, undefined, 2);
        } else {
            document.getElementById('textarea').innerHTML = "GetItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2);
        }
    })
}