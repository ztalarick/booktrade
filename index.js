const express = require("express");
const app = express();

// const configRoutes = require("./routes");
// configRoutes(app);

app.listen(3000, function() {
    console.log('Site is up at on port 3000! Navigate to http://localhost:3000 to access it');
});
