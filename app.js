const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const fs = require("fs");
var cheerio = require('cheerio');

app.get("/list_svg", (req, res) => {

    var htmltext = '<h1>All SVGs</h1>';

    fs.readdirSync(
        __dirname + `/svg/`
    ).forEach(file => {
        htmltext += `
            <a href=/preview_svg_sample/${file}>${file}</a>
            <br>
        `
    });

    res.send(htmltext)
})

app.get("/preview_svg_sample/:name", (req, res)=> {

    const file_name = req.params.name;

    fs.readFile(__dirname + `/svg/${file_name}`, 'utf8', (err, data) => {

        if(err){
            return res.send("File Not Found!");
        }

        const $ = cheerio.load(`
            ${data}
        `
        , null, false);

        const text_ids = $('*').get().filter(el => el.name == 'text' || el.name == "textPath" || el.name == "tspan" || el.name == 'path').map(el => `${el.name} = ${el.attribs.id}`)
       
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
    });

})

// http://localhost:3000/change_my_svg_text?data=[{%22textID%22:%22heading%22,%20%22font%22:%22fantasy%22,%20%22color%22:%22f3791f%22,%20%22new_text%22:%20%22Heeeeee!%22},{%22textID%22:%22outline%22,%20%22font%22:%22cursive%22,%20%22color%22:%22ad31f4%22,%20%22new_text%22:%20%22I%20LOVE%20CODE%22}]
app.get("/change_my_svg_text/", (req, res)=>{

    const data = JSON.parse(req.query['data'])
    const file = req.query['file']

    console.log(data[0].bg_image);

    if(!data) return res.send("Error...") 
    if(!file) return res.send("PLEASE ENTER FILE NAME")


    fs.readFile(__dirname + `/svg/${file}`, 'utf8', (err, svg_data) => {
        
        if(err){
            return res.send("File Not Found!");
        }

        const $ = cheerio.load(`
            ${svg_data}`
        , {
            xmlMode: true,
          });

        data.map((layer, index)=>{
            // $(`#${layer.textID}`).text(`${layer.new_text}`)
            if(layer.bg_image){
                $(`svg`).prepend(`<defs>
                    <pattern id="img${index}" patternUnits="userSpaceOnUse" width="100" height="100">
                        <image href=${layer.bg_image} x="0" y="0" width="100" height="100" />
                    </pattern>
                </defs>`);
                $(`#${layer.textID}`).attr('fill', `url(#img${index})`)
            }
            // $(`#${layer.textID}`).attr('fill', `#${layer.color}`)
            $(`#${layer.textID}`).attr('font-family', layer.font)
            if(layer.style){
                $(`#${layer.textID}`).attr('style', `${layer.style}`)
            }
        })
   
        const content = $.html();
    
        // fs.writeFile(__dirname + `/output/something_new.svg`, content, function (err) {
        //     if (err) throw err;
        //     console.log('Replaced!');
        // });

        res.send(content)
    });
})

app.use((req, res)=>{
    res.json({
        "status": 404,
        "List All SVGs": "/list_svg",
        "Go to Preview SVG": "/preview_svg_sample/file_name",
        "Modify SVG": "/change_my_svg_text"
    })
})

app.listen(port, ()=>{
    console.log(`HTTP server is listening on http://localhost:${port}/`);
})





