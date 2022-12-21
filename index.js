const port = 8080;
const express  = require('express');
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");

//To create a table to put mysql in
const html = "<!DOCTYPE html>" +
'<html lang="en">' +
'<head>' +
 '   <meta charset="UTF-8">' +
 '   <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
 '   <title>Glucose App</title> </head>' +
'<body> <h1>Welcome To Your Glucose Application</h1>'

var connection = mysql.createConnection({
    host: "database-1.cbo5mezuwpdr.us-west-1.rds.amazonaws.com",
    port:"3306",
    user: "admin",
    password: "password",
    database:"finalproject"
  });

connection.connect(function(err) {
    if (err) {
      console.error('Database connection failed: ' + err.stack);
      return;
    }
    console.log('Connected to database.');
});
//parses the url and sees if the header is matched with any of the functions 
app.use(bodyParser.urlencoded({
    extended:true
}));
// when go to website, this function will send the web server the html file
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/glucose.html");
    console.log("File Sent");
});

app.post("/submit", function(req, res) {
    var user_date = String(req.body.Date);
    var name = String(req.body.Name);
    var glucoseLvl = parseInt(req.body.glucose_level);

    var sql = "INSERT INTO customer (dates,metername, glvl) VALUES ('"+user_date+"','"+name+"','"+glucoseLvl+"')";
    connection.query(sql, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        console.log("insert worked");
    });
    // res.send("Addition - " + num1);
    res.redirect("/"); //redirect to home page
  });

  app.post("/history", function(req, res) {
    var sql = "SELECT customerID, metername,glvl, DATE_FORMAT(dates, '%m/%d/%Y %h:%i %p')as DateTime FROM customer ORDER BY DateTime"
    connection.query(sql, function(err,result){
    if (err){
      console.error(err);
      return;
    }

    res.write(html);
    res.write('<table><tr><th>ID</th><th>Reader Name' +
     '</th><th> Glucose Level </th><th>Date and Time</th></tr>');
    
    for (data of result){
      res.write('<tr><td>' + data.customerID + '</td><td>' + data.metername +
       "</td><td>" + data.glvl + "</td><td>" + data.DateTime +
        '</td></tr>');
    }
    res.write('</table>');
    res.write('<br><br>');
    res.write('<form id ="deletion" method="post" action="/delete">' +
        '<label for="del">Records to Delete (input an ID number and seperate by commas) </label>' +
        '<input type="text" placeholder="deletion" name = "del">' +
          '<input type="submit" id="deletion"></form>')
    }); 
  });
// can delete multiple customer id
  app.post("/delete", function(req,res) {
    var toDelete = req.body.del.split(',');
    toDelete.forEach(element => {
      connection.query("DELETE FROM customer WHERE customerID='" + element + "'", function(err,result){
        if (err){
          console.error(err);
          return;
        }
        });
      });
    res.redirect("/");
  });

app.listen(port, function() {
    console.log("Serving")
});
