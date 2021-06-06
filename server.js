const express = require("express");
const app = express();
var cookieParser = require("cookie-parser");
const fs = require("fs");
var multer = require("multer");
const path = require("path");
function isUserBooked(data) {
  userData = data.toString().split("\n");
  for (i = 0; i < userData.length; i++) {
    if (userData[i].split("|").length > 3) {
      return true;
    }
  }
}
app.listen(3000, function () {
  console.log("listening on 3000");
});
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.post("/login", (req, res) => {
  var name = req.body.name;
  var aadhar = req.body.aadhar;
  var mobile = req.body.mobile;
  var fileData = name.concat("|").concat(mobile).concat("|", aadhar, "\n");

  fs.readFile("users.txt", function (err, data) {
    if (err) throw err;
    if (!data.includes(aadhar)) {
      fs.appendFile("users.txt", fileData, function (err) {
        if (err) throw err;
        console.log("Saved!");
        res.cookie("userDetails", { name: name, aadhar: aadhar });
        res.redirect("/welcome.html");
      });
    } else if (data.includes(aadhar) && isUserBooked(data)) {
      res.cookie("userDetails", { name: name, aadhar: aadhar });
      res.redirect("/booked.html");
    } else {
      res.cookie("userDetails", { name: name, aadhar: aadhar });
      res.redirect("/welcome.html");
    }
  });
});
app.get("/book*", (req, res) => {
  var userDetails = req.cookies["userDetails"];
  var centerId = req.query.id;
  var centerName = req.query.name;
  var centerAddress = req.query.address;
  var vaccineSelected = req.query.vaccine;
  fs.readFile("users.txt", function (err, data) {
    if (err) throw err;
    var userFileData = data.toString().split("\n");
    for (i = 0; i < userFileData.length; i++) {
      if (userFileData[i].includes(userDetails.aadhar)) {
        userFileData[i] = userFileData[i].concat(
          "|",
          centerId,
          "|",
          centerName,
          "|",
          centerAddress,
          "|",
          vaccineSelected
        );
        fs.readFile("./public/centers.txt", function (err, data) {
          if (err) throw err;
          var centerList = data.toString().split("\n");
          for (i = 0; i < centerList.length; i++) {
            if (centerList[i].includes(centerId)) {
              console.log(centerList[i]);
              var matchCenter = centerList[i].split("|");
              matchCenter[5] = parseInt(matchCenter[5]) - 1;
              centerList[i] = matchCenter.join("|");
              console.log(centerList[i]);
            }
            break;
          }
          fs.writeFile(
            "./public/centers.txt",
            centerList.join("\n"),
            function (err) {
              if (err) throw err;
              console.log(`Slot Reduced at ${centerId}:${centerName}`);
            }
          );
        });
        break;
      }
    }
    fs.writeFile("users.txt", userFileData.join("\n"), function (err) {
      if (err) throw err;
      console.log(
        `User:${userDetails.name}'s Slot Booked at ${centerId}:${centerName}`
      );
    });
  });
  res.clearCookie("userDetails");
  res.end(
    `Your Slot for ${vaccineSelected} has been successfully booked at ${centerName}`
  );
});
