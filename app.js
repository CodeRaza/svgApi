const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const fs = require("fs");
const cheerio = require('cheerio');
const sharp = require("sharp")
const https= require("https")
const download = require('download');

let remote_base_url = "https://cloudconvert.com/images/logo_flat_110_borderless.png"; // remote  
let local_base_path = "assets"; // the assets directory in the server
let svg_path = "svgs/1.svg";

app.get("/list_svg", (req, res) => {

    var htmltext = '<h1>All SVGs</h1>';

    fs.readdirSync(
        __dirname + `/assets/svg/`
    ).forEach(file => {
        htmltext += `
            <a href=/preview_svg_sample/${file}>${file}</a>
            <br>
        `
    });


    res.send(htmltext)
})

app.get("/preview_svg_sample/:name", async (req, res)=> {

    const file_name = req.params.name;

    fs.readFile(__dirname + `/assets/svg/${file_name}`, 'utf8', (err, data) => {

        if(err){

            const filePath = `${__dirname}/assets/svg/`;
            download(remote_base_url).pipe(fs.createWriteStream(filePath + `${file_name}`));

            return res.redirect(req.url);

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
app.get("/change_my_svg_text/", async (req, res)=>{

    const data = JSON.parse(req.query['data'])
    const file = req.query['file']

    if(!data) return res.send("Error...") 
    if(!file) return res.send("PLEASE ENTER FILE NAME")


    fs.readFile(__dirname + `/assets/svg/${file}`, 'utf8', (err, svg_data) => {
        
        if(err){
            
            const filePath = `${__dirname}/assets/svg/`;
            download(remote_base_url).pipe(fs.createWriteStream(filePath + `${file_name}`));

            return res.redirect(req.url);
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
    
        fs.writeFile(__dirname + `/output/${file}.svg`, content, function (err) {
            if (err) throw err;
            console.log('Replaced!');
        });
       
        const svg_to_img_text = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="1008px" height="1152px" viewBox="0 0 1008 1152" xml:space="preserve">
            ${$('svg').html()}
        </svg>`
        


        const input_svg = Buffer.from(svg_to_img_text);

        sharp(input_svg)
        .png()
        .toFile("new-file.png")
        .then(function(info) {
            console.log(info);
        })
        .catch(function(err) {
            console.log(err)
        })

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





