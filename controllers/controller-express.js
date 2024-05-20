const bcrypt = require("bcrypt");
const pg = require('pg');
const jwt = require('jsonwebtoken');

// Connect to PostgreSQL
const conString = "postgres://pobrpkhn:eRnVq78-FrEnfFiLLnIbHrXkkDosTJdD@drona.db.elephantsql.com/pobrpkhn";
const client = new pg.Client(conString);

client.connect(function(err) {
  if (err) {
    return console.error('could not connect to postgres', err);
  } else {
    console.log("Database connected successfully");
  }
});

const welcome = (req,res) => {
    let welcomeMessage = `Welcome to express`
    
    res.status(200).json({
        message: welcomeMessage
    });
}


const login = async (req, res) => {

    let { email, password } = req.body;
    
    const access_token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET)
    
  
    let errors = [];
  
    if (!email || !password) {
      errors.push({ message: "Please Enter Email and Password" });
      res.status(400).json({ errors });
    } else {
      client.query(`SELECT * FROM public.express WHERE email = $1`, [email], async (err, result) => {
        if (err) {
          throw err;
        }

        if (result.rows.length === 0) {
          errors.push({ message: "User not found" });
          res.status(404).json({ errors });
        } else {
          const user = result.rows[0];
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) {
            errors.push({ message: "Invalid Password" });
            res.status(401).json({ errors });
          } else {
            const username = result.rows[0].username;
            res.status(200).json({ access_token: access_token, username: username }); // Return success message as JSON // Return success message as JSON
          }
        }
      });
    }
  };




module.exports = { welcome, login}
