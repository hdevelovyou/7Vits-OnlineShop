
import db from '../models/index';
let getHomepage = async (req, res) => {
    //return res.send("Hello world from controller")
    try{
        let data = await db.User.findAll();
        return res.render('homepage.ejs',{
            data: JSON.stringify(data)
        });
    }catch(e)
    {
        console.log(e)
    }
}
let  getAboutpage = (req,res) =>{
    return res.render('test/about.ejs');
}
/*object:{
    key:'',
    value:''
}*/
module.exports = {
    getHomepage: getHomepage,
    getAboutpage: getAboutpage
}