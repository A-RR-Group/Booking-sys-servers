const welcome = (req,res) => {
    let welcomeMessage = `Welcome to admin`
    
    res.status(200).json({
        message: welcomeMessage
    });
}

module.exports = { welcome }