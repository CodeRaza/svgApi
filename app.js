const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const fs = require("fs");
const cheerio = require('cheerio');

app.get("/preview_svg_sample", (req, res)=> {

    fs.readFile(__dirname + '/svg/sample.svg', 'utf8', (err, data) => {

        const $ = cheerio.load(`
            ${data}
            <br>
            <button> 
                <a style="color: black; text-decoration:none;" href="/change_my_svg_text/?text=ali&name=ali">Open To Edit</a>
            </button>
        `
        , null, false);
        const content = $.html()

        res.send(content)
    });

})

app.get("/change_my_svg_text/", (req, res)=>{

    const text = req.query['text'];
    const name = req.query['name'];
    const color = req.query['color'];
    const font = req.query['font']

    console.log(color);
    if(!name) return res.send("Enter Name of File!")

    fs.readFile(__dirname + '/svg/sample.svg', 'utf8', (err, data) => {
        
        const $ = cheerio.load(`${data}`, null, false);

        if(text){
            $('#text').text(`${text}`);
        }
        
        if(color){
            $('#text').attr('fill', color)
        }

        if(font){
            $('#text').attr('font-family', font)
        }

        const content = $.html();
    
        fs.writeFile(__dirname + `/output/${name}.svg`, content, function (err) {
            if (err) throw err;
            console.log('Replaced!');
        });

        res.send(content)
    });
})

app.use((req, res)=>{
    res.json({
        "status": 404,
        "Go to Preview SVG": "/preview_svg_sample",
        "Modify SVG": "/change_my_svg_text"
    })
})

app.listen(port, ()=>{
    console.log(`HTTP server is listening on http://localhost:${port}/`);
})





