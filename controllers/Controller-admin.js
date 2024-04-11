const bcrypt = require("bcrypt");
const pg = require('pg');

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
    let welcomeMessage = `Welcome to admin`
    
    res.status(200).json({
        message: welcomeMessage
    });
}

const register = async (req, res) => {
    let { username, email, password } = req.body;
  
    let errors = [];
  
    if (!username || !email || !password) {
      errors.push({ message: "Please Enter All Fields" });
      res.status(400).json({ errors }); // Return errors as JSON
    } else {
      let hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);
  
      // Check if email is already registered
      client.query(`SELECT * FROM public.admin WHERE email = $1`, [email], (err, result) => {
        if (err) {
          throw err;
        }
  
        console.log(result.rows);
  
        if (result.rows.length > 0) {
          errors.push({ message: "Email Already Registered" });
          res.status(400).json({ errors }); // Return errors as JSON
        } else {
          // Insert new user
          client.query("INSERT INTO public.admin (username, email, password) VALUES ($1, $2, $3) RETURNING id, password", [username, email, hashedPassword], (err, result) => {
            if (err) {
              throw err;
            }
  
            console.log(result.rows);
            res.status(200).json({ message: "Registration Successful" }); // Return success message as JSON
          });
        }
      });
    }
  };

module.exports = { welcome, register }