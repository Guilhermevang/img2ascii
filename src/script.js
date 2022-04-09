/**
 * 
 * Author: Guilherme Evangelista
 * From: Brasil
 * 
 * Github: https://www.github.com/guilhermevang
 * Instagram: https://www.instagram.com/guilhermevang/
 * Email: guilhermlou@hotmail.com
 * 
 * Released in 09/04/2020
 * 
 * On Windows, run:
 * 1 - python -m http.server 8080
 * 
 * Then, open your browser and type:
 * 2 - http://localhost:8080/
 * 
 * Thanks for reading!
 * 
**/

export default async function img2ascii(imageURL, settings) {
  // ASCII chars by Sean Gugler
  // http://mewbies.com/geek_fun_files/ascii/ascii_art_light_scale_and_gray_scale_chart.htm
  const chars = '@@BBRR**##$$PPXX00wwooIIccvv::++!!~~""..,,  '
  const getChar = (rgb) => chars[parseInt((Math.max(...rgb) / 255) * (chars.length - 1), 10)];

  let image = await createImage();
  let { width, height } = getCanvasNewDimensions();
  let { ctx } = createCanvas();
  let image_data = await getImageData();
  let output = await render();
  
  // If using callback
  let htmlOutput = document.createElement('pre');
  htmlOutput.innerHTML = output;
  settings.mounted(htmlOutput);
  
  if (settings.toCanvas) {
    // If setted to render to canvas
    insertOutputIntoCanvas();
  } else {
    // If setted to return as string
    settings.insert ? settings.insert.innerHTML = output : null;
  }

  
  function createImage() {
    return new Promise(resolve => {
      let img = new Image();
      img.src = imageURL + '?' + new Date().getTime();
      img.crossOrigin = 'Anonymous';
      img.complete ? resolve(img) : img.onload = () => resolve(img);
    });
  }

  function getCanvasNewDimensions(w) {
    let { width, height } = image;
    let ratio = height / width;
    return {
      width: w || settings.width || 200,
      height: parseInt((w || settings.width) * ratio, 10)
    }
  }
  
  function createCanvas(w, h) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = w || width,
    canvas.height = h || height;
    return { canvas, ctx };
  }
  
  function getImageData() {
    return new Promise(resolve => {
      ctx.drawImage(image, 0, 0, width, height);
      let { data } = ctx.getImageData(0, 0, width, height);
      resolve(data);
    });
  }

  function render() {
    return new Promise(resolve => {
      // I'm thinking something about render from start and end at the same time (loop)
      let str = '';
      const getRGB = px => [image_data[px=px*4], image_data[px+1], image_data[px+2]];
      for (var px=0; px<(width*height); px++) {
        let rgb = getRGB(px);
        let char = getChar(rgb);
        if (px > 0 && px % width === 0) str += '\n';
        str += settings.color ? `<font style="color: rgb(${rgb.join(',')})">${char}</font>` : char;
      }
      resolve(str);
    });
  }

  
  
  function insertOutputIntoCanvas() {
    /**
     * Each line has a different width, so we need a font with same width and height
     * like "Courier Prime" or something else.
    **/
    let textToInsert = output.split('\n');
    let outputCanvas = document.createElement('canvas')
    let canvasContext = outputCanvas.getContext('2d');
    let fontSize = settings.fontSize || 10
    canvasContext.font = `${fontSize}px Courier`;
    
    const changeCanvasWidth = (metrics) => outputCanvas.width = metrics.width;
    outputCanvas.height = textToInsert.length * fontSize;

    for (var row = 0; row < textToInsert.length; row++) {
      let textMeasure = canvasContext.measureText(textToInsert[row])
      if (textMeasure.width > outputCanvas.width) changeCanvasWidth(textMeasure);
      canvasContext.fillText(textToInsert[row], 0, ( fontSize*row ) + fontSize);
    }

    console.log(outputCanvas.toDataURL());
    settings.insert.appendChild(outputCanvas);
  }
}