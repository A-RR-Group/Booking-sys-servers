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

const register = async (req, res) => {
    let { username, email, password } = req.body;
  
    let errors = [];
  
    if (!username || !email || !password) {
      errors.push({ message: "Please Enter All Fields" });
      res.status(400).json({ errors }); // Return errors as JSON
    } else {
      let hashedPassword = await bcrypt.hash(password, 10);
  
      // Check if email is already registered
      client.query(`SELECT * FROM public.admin WHERE email = $1`, [email], (err, result) => {
        if (err) {
          throw err;
        }
  
        if (result.rows.length > 0) {
          errors.push({ message: "Email Already Registered" });
          res.status(400).json({ errors }); // Return errors as JSON
        } else {
          // Insert new user
          client.query("INSERT INTO public.admin (username, email, password) VALUES ($1, $2, $3) RETURNING id, password", [username, email, hashedPassword], (err, result) => {
            if (err) {
              throw err;
            }
            res.status(200).json({ message: "Registration Successful" }); // Return success message as JSON
          });
        }
      });
    }
  };

  const login = async (req, res) => {

    let { email, password } = req.body;
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
          res.status(404).json({ errors });
        } else {
          // Checking if password is correct
          const user = result.rows[0];
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) {
            errors.push({ message: "Invalid Password" });
            res.status(401).json({ errors });
          } else {
            const access_token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" })
            const refresh_token = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "90d" })
            const username = result.rows[0].username;
            res.cookie("refreshToken", refresh_token, {
              httpOnly: true,
              secure: true,
              path: '/',
              maxAge: 6 * 30 * 24 * 60 * 60 * 1000
            });
            
            res.status(200).json({ access_token: access_token, username: username });
          }
        }
      });
    }
  };

  const verify_token =  (req, res) => {
    const access_token = req.access_token ? req.access_token : false;
    res.json({
      login: true,
      access_token: access_token
    });
  }

  
  const getExpresses = (req,res) => {
    const access_token = req.access_token ? req.access_token : false;
    client.query(`SELECT * FROM public.express WHERE state = true`, (err, result) => {
      if (err) {
        throw err;
      }
      res.status(200).json({ expresses: result.rows, access_token: access_token})
    })};

    const getStations = (req,res) => {
      const access_token = req.access_token ? req.access_token : false;
      client.query(`SELECT * FROM public.bus_station WHERE state = true`, (err, result) => {
        if (err) {
          throw err;
        }
        res.status(200).json({ stations: result.rows, access_token: access_token})
      })};


const addExpress = async (req, res) => {
  const access_token = req.access_token ? req.access_token : false;
  let { name, email, phone_number, state } = req.body;
  let errors = [];

  if (!name || !phone_number || !email || !state) {
    errors.push({ message: "Please Fill All Fields" });
    return res.status(400).json({ errors }); // Return errors as JSON
  }

  try {

    // Check if name is already registered
    const result = await client.query(`SELECT * FROM public.express WHERE name = $1`, [name]);

    if (result.rows.length > 0) {
      errors.push({ message: "Name already registered" });
      return res.status(400).json({ errors });
    } else {
      const insertResult = await client.query("INSERT INTO public.express(name, phone_number, email, state) VALUES ($1, $2, $3, $4) RETURNING id, password", [name, phone_number, email, state]);
      const expresses = await client.query(`SELECT * FROM public.express WHERE state = true`);
      return res.status(200).json({ message: "Express added successfully", expresses: expresses.rows, access_token: access_token,});
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const removeExpress = async (req, res) => {
  const access_token = req.access_token ? req.access_token : false;
  let { id } = req.body;
  let errors = [];

  if (!id) {
    errors.push({ message: "ID parameter is missing" });
    return res.status(400).json({ errors });
  }

  try {
    // Check if the express exists
    const result = await client.query('SELECT * FROM public.express WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      errors.push({ message: "Express not found", access_token: access_token });
      return res.status(404).json({ errors }); 
    }

    // Update the state to false instead of deleting the record
    const updateResult = await client.query('UPDATE public.express SET state = false WHERE id = $1', [id]);
    const expresses = await client.query(`SELECT * FROM public.express WHERE state = true`);
    return res.status(200).json({ message: "Express deleted successfully", expresses: expresses.rows, access_token: access_token}); // Return success message as JSON
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" }); // Return internal server error
  }
};




const addBusStation = async (req, res) => {
  const access_token = req.access_token ? req.access_token : false;
  try {
    let { name, state } = req.body;
    let errors = [];

    if (!name || !state) {
      errors.push({ message: "Please fill all fields" });
      return res.status(400).json({ errors }); // Return errors as JSON
    }

    const result = await client.query(`SELECT * FROM public.bus_station WHERE name = $1`, [name]);

    if (result.rows.length > 0) {
      errors.push({ message: "Name already registered", access_token: access_token });
      return res.status(400).json({ errors });
    } else {
      const insertResult = await client.query("INSERT INTO public.bus_station(name, state) VALUES ($1, $2) RETURNING id, name", [name, state]);
      const stations = await client.query(`SELECT * FROM public.bus_station WHERE state = true`);
      return res.status(200).json({ message: "Bus station added successfully", stations: stations.rows, access_token: access_token }); // Return success message as JSON
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message }); // Return internal server error with specific error message
  }
};

const editBusStation = async (req, res) => {
  const access_token = req.access_token ? req.access_token : false;
  try {
    const { id } = req.body;
    const { name, state } = req.body;
    let errors = [];

    if (!name || !state) {
      errors.push({ message: "Please fill all fields" });
      return res.status(400).json({ errors });
    }

    // Check if bus station exists
    const checkResult = await client.query('SELECT * FROM public.bus_station WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Bus station not found", access_token: access_token });
    }

    const updateResult = await client.query('UPDATE public.bus_station SET name = $1, state = $2 WHERE id = $3 RETURNING id, name, state', [name, state, id]);
    const stations = await client.query(`SELECT * FROM public.bus_station WHERE state = true`);

    return res.status(200).json({ message: "Bus station updated successfully", stations: stations.rows, access_token:access_token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error", error: err.message });
  }
};


const RemoveBusStation = async (req, res) => {
  const access_token = req.access_token ? req.access_token : false;
  try {
    const { id } = req.body;
    let errors = [];

    if (!id) {
      errors.push({ message: "ID parameter is missing" });
      return res.status(400).json({ errors }); 
    }

    // Check if bus station exists
    const checkResult = await client.query('SELECT * FROM public.bus_station WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Bus station not found", access_token: access_token });
    }

    const updateResult = await client.query('UPDATE public.bus_station SET state = false WHERE id = $1', [id]);
    const stations = await client.query(`SELECT * FROM public.bus_station WHERE state = true`);

    return res.status(200).json({ message: "Bus station deleted successfully", stations: stations.rows, access_token: access_token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



module.exports = { welcome, register, login, getExpresses, getStations, addExpress, removeExpress, addBusStation, RemoveBusStation, editBusStation, verify_token}