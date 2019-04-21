var mysql = require("mysql");
require("dotenv").config();
var prompt = require('prompt');

var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: process.env.WEBSITE_USER,

  password: process.env.WEBSITE_PASSWORD,
  database: "bamazon",
});

connection.connect(function(err) {
  if (err) throw err;
  afterConnection();
});

function afterConnection() {

  connection.query("SELECT product_name FROM products", function(err, res) {
    if (err) throw err;
    console.log("This is our current inventory: \n" + res[0].product_name + "\n" + res[1].product_name + "\n" + res[2].product_name + "\n" + res[3].product_name + "\n" + res[4].product_name + "\n" + res[5].product_name + "\n" + res[6].product_name + "\n" + res[7].product_name + "\n" + res[8].product_name + "\n" + res[9].product_name);
    askUser();
    //connection.end();
  });
}

var questions = {
  properties: {
    question1: {
      description: "What would you like to purchase ?",
      pattern: /^[a-zA-Z\s\-]+$/,
      message: "Product can only contain letters",
      required: true
    },
    question2: {
      description: "How many would you like to purchase ?",
      type: "integer",
      message: "Quantity must be a number",
      required: true
    },
  }
};

var questions2 = {
  properties: {
    question2: {
      description: "How many would you like to purchase ?",
      type: "integer",
      message: "Quantity must be a number",
      required: true
    },
  }
}

function askUser(list) {
if (list !== undefined) {
  questions = list[0]
}
  prompt.get(questions, function (err, result) {
    if (list !== undefined) {
      result.question1 = list[1].question1
    }
    //console.log(result)
    var item = result.question1
    
    connection.query('SELECT stock_quantity FROM products WHERE product_name="' + item + '"', function(err, res) {  
      //console.log(res[0].stock_quantity)
      if (result.question2 > res[0].stock_quantity) {
        console.log("Insufficent Quantity !")
        askUser([questions2, {question1: result.question1}])
      } else {
        console.log("Your order for " + result.question2 + " " + result.question1 + "(s) has been placed !");
          var updatedQuantity = res[0].stock_quantity - result.question2 
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: updatedQuantity
              },
              {
                product_name: item
              }
            ],
            function(err, res) {
              //console.log(res.affectedRows + " products updated!\n");
            }
          )  
          connection.query('SELECT price FROM products WHERE product_name="' + item + '"', function(err, res) { 
              var updatedPrice = res[0].price * result.question2 
              console.log("You owe me " + updatedPrice + " !")
              connection.end();
          })
        }
    })
  });
}