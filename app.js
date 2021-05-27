const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
var _ = require('lodash');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-aishwary:Test123@cluster0.zka6j.mongodb.net/to-do-listDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name:String
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err , itemslist){
    if(itemslist.length === 0)
    {
      Item.insertMany(defaultItems , function(err){
        if(err) console.log(err);
        else console.log("Successfully inserted");
      });
      res.redirect("/");
    }
    else res.render("list", {listTitle: 'Today', newListItems: itemslist});
  });
});

app.get("/:customListName" , function(req,res){
  const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName} , function(err,foundlist){
      if(!err)
      {
        if(foundlist) {
          // display list
          res.render("list" , {listTitle: foundlist.name, newListItems: foundlist.items});
        }
        else
        {
          // add and display list
          const list = new List({
            name: customListName,
            items: defaultItems
          });
           list.save();
           res.redirect("/" + customListName);
        }
      }
    });

});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});


app.post("/delete" , function(req,res){
  const deleteItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.findByIdAndDelete(deleteItemId,function(err){
      if(err) console.log(err);
      else res.redirect("/");
    });
  }
  else
  {
    List.findOneAndUpdate({name: listName} , {$pull: {items: {_id: deleteItemId}}} , function(err , foundList){
      if(!err)
      {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Successfully");
});
