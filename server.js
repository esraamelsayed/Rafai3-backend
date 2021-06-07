// import app from app.js
const app = require('./app');

// load file db-connection.js
require('./db-connection');

// define port to work with as 3000 or env
const port = process.env.PORT || 3000;

// launch server on port
app.listen(port, () => {

    console.log("server is running ");
})