const db = require('../models/index');
const getHomePage = async (req, res) => {
    try{
        let data = await db.User.findAll();
        return res.send('Hello world with Bire');
    } catch(e) {
        console.log(e);
    }
    
}

const getColorGalaxy = (req, res) => {
    res.render('sample.ejs');
}

module.exports = {
    getHomePage,
    getColorGalaxy
}