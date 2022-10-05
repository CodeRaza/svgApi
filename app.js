const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const fs = require("fs");
var cheerio = require('cheerio');

app.get("/preview_svg_sample", (req, res)=> {

    fs.readFile(__dirname + '/svg/new.svg', 'utf8', (err, data) => {

        const $ = cheerio.load(`
            ${data}
        `
        , null, false);

        const text_ids = $('*').get().filter(el => el.name == 'text' || el.name == "textPath").map(el => el.attribs.id)
       
        $('svg').append(`
            <br>
            <br>
            <h1>Text ID's In the SVG...</h1>
            ${text_ids.map(ids=>{
                return `
                    ${ids} 
                `
            })}
        `)
       
        const content = $.html()

        res.send(content)
        
        // res.json({
        //     content: content,
        //     text_ids: text_ids
        // })
    });

})

// http://localhost:3000/change_my_svg_text?data=[{%22textID%22:%22heading%22,%20%22font%22:%22fantasy%22,%20%22color%22:%22f3791f%22,%20%22new_text%22:%20%22Heeeeee!%22},{%22textID%22:%22outline%22,%20%22font%22:%22cursive%22,%20%22color%22:%22ad31f4%22,%20%22new_text%22:%20%22I%20LOVE%20CODE%22}]
app.get("/change_my_svg_text/", (req, res)=>{

    const data = JSON.parse(req.query['data'])

    if(!data) return res.send("Error...") 
    
    fs.readFile(__dirname + '/svg/new.svg', 'utf8', (err, svg_data) => {
        
        const $ = cheerio.load(`${svg_data}`, null, false);

        data.map((layer, index)=>{
            $(`#${layer.textID}`).text(`${layer.new_text}`)
            $(`#${layer.textID}`).attr('fill', `#${layer.color}`)
            $(`#${layer.textID}`).attr('font-family', layer.font)
            if(layer.style){
                $(`#${layer.textID}`).attr('style', `${layer.style}`)
            }
        })

   
        const content = $.html();
    
        fs.writeFile(__dirname + `/output/sample.svg`, content, function (err) {
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





