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
    
  
    let errors = [];
  
    if (!email || !password) {
      errors.push({ message: "Please Enter Email and Password" });
      res.status(400).json({ errors });
    } else {
      client.query(`SELECT * FROM public.express WHERE email = $1`, [email], async (err, result) => {
        const user = result.rows[0];
        if (err) {
          throw err;
        }

        if (result.rows.length === 0) {
          errors.push({ message: "User not found" });
          res.status(404).json({ errors });
        }else if(!user.password){
          const access_token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET)
          const username = result.rows[0].name;
          let hashedPassword = await bcrypt.hash(password, 10);
          client.query(`UPDATE public.express SET password = $1 WHERE email = $2` , [hashedPassword, email], async (err, resultS) => {
            res.status(200).json({ access_token: access_token, username: username, message: "U will continue using this password" });
          })
        } else {
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) {
            errors.push({ message: "Invalid Password" });
            res.status(401).json({ errors });
          } else {
            const access_token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET)
            const username = result.rows[0].name;
            res.status(200).json({ access_token: access_token, username: username }); // Return success message as JSON // Return success message as JSON
          }
        }
      });
    }
  };
    

  const addBus = async (req, res) => {
    let { licence_plate, bus_capacity, booked_seats, password, express_id, state } = req.body;
    let errors = [];
  
    if (!licence_plate || !bus_capacity || !booked_seats || !password || !express_id || !state) {
      errors.push({ message: "Please Fill All Fields" });
      return res.status(400).json({ errors }); // Return errors as JSON
    }
  
    try {
      let hashedPass = await bcrypt.hash(password, 10);
      console.log(hashedPass);
  
      // Check if bus is already registered
      const busResult = await client.query(`SELECT * FROM public.bus WHERE licence_plate = $1`, [licence_plate]);
      console.log(busResult.rows);
  
      if (busResult.rows.length > 0) {
        errors.push({ message: "Bus Already Registered" });
        return res.status(400).json({ errors }); // Return errors as JSON
      }
  
      // Check if the express_id exists in the express table
      const expressResult = await client.query(`SELECT * FROM public.express WHERE id = $1`, [express_id]);
      console.log(expressResult.rows);
  
      if (expressResult.rows.length === 0) {
        errors.push({ message: "Express ID Not Found" });
        return res.status(400).json({ errors }); // Return errors as JSON
      }
  
      // Insert the new bus record
      const insertResult = await client.query(
        "INSERT INTO public.bus(licence_plate, bus_capacity, booked_seats, password, express_id, state) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, password",
        [licence_plate, bus_capacity, booked_seats, hashedPass, express_id, state]
      );
      console.log(insertResult.rows);
      return res.status(200).json({ message: "Adding Bus Was Successful" }); // Return success message as JSON to the Client
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" }); // Return internal server error
    }
  };


const editBus = async (req, res) => {
  try {
    const { id } = req.body;
    const { licence_plate, bus_capacity, booked_seats, password, express_id, state } = req.body;
    let errors = [];

    if (!licence_plate || !bus_capacity || !booked_seats || !password || !express_id || !state) {
      errors.push({ message: "Please Fill All Fields" });
      return res.status(400).json({ errors }); // Return errors as JSON
    }

    // Check if bus station exists
    const checkResult = await client.query('SELECT * FROM public.bus WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update bus station
    const updateResult = await client.query(
      'UPDATE public.bus SET licence_plate = $1, bus_capacity = $2, booked_seats = $3, password = $4, express_id = $5, state = $6 WHERE id = $7 RETURNING id, licence_plate, bus_capacity, booked_seats, password, express_id, state', 
      [licence_plate, bus_capacity, booked_seats, hashedPassword, express_id, state, id]
    );
    console.log(updateResult.rows);

    return res.status(200).json({ message: "Bus updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

  
const getBuses = (req,res) => {
  client.query(`SELECT * FROM public.bus WHERE state = true`, (err, result) => {
    if (err) {
      throw err;
    }

    // console.log(result.rows);
    res.status(200).json({ buses: result.rows})
  })};


  const addRide = async (req, res) => {
    let { from_station, to_station, bus, departure_time, date, price, state } = req.body;
    let errors = [];
  
    if (!from_station || !to_station || !bus || !departure_time || !date || !price || state === undefined) { 
      errors.push({ message: "Please Fill All Fields" });
      return res.status(400).json({ errors });
    }
  
    try {
      // Check if a similar ride is already registered
      const rideResult = await client.query(`SELECT * FROM public.ride WHERE from_station = $1 AND to_station = $2 AND bus = $3 AND departure_time = $4 AND date = $5`, [from_station, to_station, bus, departure_time, date]);
      if (rideResult.rows.length > 0) {
        errors.push({ message: "Ride Already Registered" });
        return res.status(400).json({ errors });
      }
  
      // Insert the new ride record
      const insertResult = await client.query(
        "INSERT INTO public.ride(from_station, to_station, bus, departure_time, date, price, state) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
        [from_station, to_station, bus, departure_time, date, price, state]
      );
      console.log(insertResult.rows[0]);
      return res.status(200).json({ message: "Adding Ride Was Successful" });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };


  const getRides = (req,res) => {
    client.query(`SELECT * FROM public.ride`, (err, result) => {
      if (err) {
        throw err;
      }
  
      // console.log(result.rows);
      res.status(200).json({ Rides: result.rows})
    })};


    const RemoveBus = async (req, res) => {
      try {
        const { id } = req.body;
        let errors = [];
    
        if (!id) {
          errors.push({ message: "ID parameter is missing" });
          return res.status(400).json({ errors }); 
        }
    
        // Check if bus station exists
        const checkResult = await client.query('SELECT * FROM public.bus WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
          return res.status(404).json({ message: "Bus not found" });
        }
    
        const updateResult = await client.query('UPDATE public.bus SET state = false WHERE id = $1', [id]);
        console.log(updateResult);
    
        return res.status(200).json({ message: "Bus deleted successfully" });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
      }
    };
  

module.exports = { welcome, login, addBus, editBus, getBuses, addRide, getRides, RemoveBus}
