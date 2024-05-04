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

  const login = async (req, res) => {

    let { email, password } = req.body;
    
    const access_token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET)
    
  
    let errors = [];
  
    if (!email || !password) {
      errors.push({ message: "Please Enter Email and Password" });
      res.status(400).json({ errors }); // Return errors as JSON
    } else {
      // Check if user exists
      client.query(`SELECT * FROM public.admin WHERE email = $1`, [email], async (err, result) => {
        if (err) {
          throw err;
        }

        if (result.rows.length === 0) {
          errors.push({ message: "User not found" });
          res.status(404).json({ errors }); // Return errors as JSON
        } else {
          // Check if password is correct
          const user = result.rows[0];
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) {
            errors.push({ message: "Invalid Password" });
            res.status(401).json({ errors }); // Return errors as JSON
          } else {
            const username = result.rows[0].username;
            // Password is correct, user is authenticated
            res.status(200).json({ access_token: access_token, username: username }); // Return success message as JSON // Return success message as JSON
          }
        }
      });
    }
  };

  const getExpresses = (req,res) => {
    client.query(`SELECT * FROM public.express`, (err, result) => {
      if (err) {
        throw err;
      }

      // console.log(result.rows);
      res.status(200).json({ expresses: result.rows})
    })};

    const getStations = (req,res) => {
      client.query(`SELECT * FROM public.bus_station`, (err, result) => {
        if (err) {
          throw err;
        }
  
        // console.log(result.rows);
        res.status(200).json({ stations: result.rows})
      })};


      // Adding Express endpoint
// const addExpress = (req, res) => {

//   let { name, phone_number, email, password, state } = req.body;

//   let errors = [];

//   if (!name || !phone_number || !email || !password || !state) {
//     errors.push({ message: "Please Fill All Fields" });
//     return res.status(400).json({ errors }); // Return errors as JSON
//   }

//   try {
//     let hashedPass = bcrypt.hash(password, 10);
//     console.log(hashedPass);

//     // Check if email is already registered
//     const result = client.query(`SELECT * FROM express WHERE name = $1`, [name]);
//     console.log(result.rows);

//     // if (result.rows.length > 0) {
//     //   errors.push({ message: "Name Already Registered" });
//     //   return res.status(400).json({ errors }); // Return errors as JSON
//     // }

//     // Insert new user
//     const insertResult = client.query("INSERT INTO express (name, phone_number, email, password, state) VALUES ($1, $2, $3, $4, $5) RETURNING id, password", [name, phone_number, email, hashedPass, state]);
//     console.log(insertResult.rows);
//     return res.status(200).json({ message: "Adding express Was Successful" }); // Return success message as JSON
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal Server Error" }); // Return internal server error
//   }
// };


const addExpress = async (req, res) => {
  let { name, phone_number, email, password, state } = req.body;
  let errors = [];

  if (!name || !phone_number || !email || !password || !state) {
    errors.push({ message: "Please Fill All Fields" });
    return res.status(400).json({ errors }); // Return errors as JSON
  }

  try {
    let hashedPass = await bcrypt.hash(password, 10);
    console.log(hashedPass);

    // Check if name is already registered
    const result = await client.query(`SELECT * FROM public.express WHERE name = $1`, [name]);
    console.log(result.rows);

    if (result.rows.length > 0) {
      errors.push({ message: "Name Already Registered" });
      return res.status(400).json({ errors }); // Return errors as JSON
    } else {
      console.log("express_name available");
      // return res.json({message: "express_name available"});
      const insertResult = await client.query("INSERT INTO public.express(name, phone_number, email, password, state) VALUES ($1, $2, $3, $4, $5) RETURNING id, password", [name, phone_number, email, hashedPass, state]);
      console.log(insertResult.rows);
      return res.status(200).json({ message: "Adding express Was Successful" }); // Return success message as JSON
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" }); // Return internal server error
  }
};

module.exports = { welcome, register, login, getExpresses, getStations, addExpress }