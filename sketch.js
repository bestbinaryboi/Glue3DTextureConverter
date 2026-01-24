//GLUE3D TEXTURE CONVERTER
//By LambdaLady(aka: bestbinaryboi,NULLIS, unbentunicorn79)



//setup varibles

//Rendering window/image (will be scaled up onto the main canvas so it doesn't look like a small box and i dont have to do any weird math with my positions and scaling)
let page;

//background settings
let bgSpeed=1
let bgColor1="#949494"
let bgColor2="#BBBBBB"


let logo;
let images=[]
let names=[]
let imageTime=[]
let focusedImage=0
let focusTime=0

function preload() {
  logo=loadImage("glue3dtextureconverterlogo.png")
}

function lerpMod(ine){
  return -1*((constrain(ine,0,1)-1)**2)+1
}
function cycleFocusedImage(){
  focusedImage=names.indexOf(selector.selected())
  focusTime=millis()
}
//setup canvases
let selector
let buttonDownload
function setup() {
  page=createGraphics(640,360);

  createCanvas(windowWidth,windowHeight)
    initCalc()
  console.log(windowOffset.x)
  page.pixelDensity(3)
  input = createFileInput(handleImage, true);
  buttonDownload = createButton('Download Files');
  
  buttonDownload.mousePressed(exportImages);
  
  selector = createSelect();
  
  selector.mouseClicked(cycleFocusedImage)
  updateUiPos()

}


// function updateUiPos(){
//   input.position(30+windowOffset.x,windowOffset.y);
//   selector.position(30+windowOffset.x,100+90+windowOffset.y)
//   buttonDownload.position(30+windowOffset.x,100+50+windowOffset.y);
// }
function updateUiPos() {
  const s = windowOffset.w / page.width;

  // positions in page-space
  const baseX = 30;
  const otherX = 640-100;
  const inputY = 90;
  const buttonY = 130;
  const selectorY = 90;

  input.position(
    windowOffset.x + baseX * s,
    windowOffset.y + inputY * s
  );

  buttonDownload.position(
    windowOffset.x + baseX * s,
    windowOffset.y + buttonY * s
  );

  selector.position(
    windowOffset.x + otherX * s,
    windowOffset.y + selectorY * s
  );
}



function handleImage(file) {
if (file.type === 'image') {
    console.log(file.name+" loading")
    names.push(file.name)
    loadImage(file.data, img => {
      images.push(resizeTo32(img));
      selector.option(file.name)
      imageTime.push(millis())
      focusTime=millis()
    });
  }
}
function exportImages(){
  let outputStack=[]
  for(let i=0;i<images.length;i++){
    outputStack.push(...convertToList(images[i]))
    
  }
  saveStrings(outputStack, "glue3d-"+names[0],"txt")
}

//main draw loop obviously
function draw() {
  background(bgColor1);
  page.clear()
  page.push()
  page.fill(0,0,0,100,)
  page.rect(0,0,640,360,10)
  page.pop()
  //draw background animation
  push()
  stroke(bgColor2)
  strokeWeight(10)
  for (let i=0;i<width/15;i++) {
    line(((round(frameCount*bgSpeed))%30)+(i*30),0,0,(round(frameCount*bgSpeed)%30)+(i*30))
  }
  pop()
  
  //draw the card
  page.push()
  page.stroke(1)
  page.fill("#00D3B2")
  page.rectMode(CENTER)
  page.rect(320,200,620,250,20)
  page.pop()
  //Draw preview
  let focusTime2=(millis()-focusTime)/200
  page.push()
  page.imageMode(CENTER)
  page.textAlign(CENTER)
  page.textSize(14)
  if(images[focusedImage]){
    page.text(names[focusedImage],page.width*(3/4),145-((lerpMod(focusTime2)*100)+1)/2)
    page.image(images[focusedImage],page.width*(3/4),155,(lerpMod(focusTime2)*100)+1,(lerpMod(focusTime2)*100)+1)
  }
  else{
    page.fill(255)
    page.text("No file",page.width*(3/4),155)
  }
  page.pop()
  
  //Draw Title
  page.push()
  page.imageMode(CENTER)
  let sizeOffset=20+cos(frameCount/100)*2
  page.translate(page.width/2,50)
  page.rotate(cos(frameCount/90)/5)
  page.image(logo,0,0,logo.width*0.22+sizeOffset,logo.height*0.22+sizeOffset)
  page.pop()
  
  //draw image bar
  page.push()
  page.imageMode(CORNER)
  page.rectMode(CORNER)
  page.fill(255,255,255,100)
  page.stroke(255)
  page.rect(45,245,page.width-90,32+10,10)
  page.noStroke()
  if(images.length==0){
    page.fill(255)
    page.text("No files uploaded...",50,270)
  }
  for (let i = 0; i < images.length; i += 1) {
    // Calculate the y-coordinate.
    let x = i * 34;
    let xMod=min(lerpMod(1-((millis()-imageTime[i])/1000))*200,page.width-90)

    // Draw the image.


    page.image(images[i], x+50+xMod, 250, images[i].width, images[i].height);
    if(focusedImage==i){
      page.fill(255,255,255,50)
      page.noStroke()
      page.rect(x+50+xMod, 250, images[i].width, images[i].height);
    }
  }
  page.pop()
  page.push()
  page.fill(200)
  page.textAlign(LEFT)
  page.textSize(10)
  page.text("Made by LamdaLady(NULLIS) unbentunicorn79@gmail.com",5,page.height-15)
  page.textAlign(RIGHT)
  page.text("v1.0",page.width-5,page.height-15)
  page.pop()
  //render the page onto the main canvas
  pasteGraphic(page)
  text(windowOffset.x,0,10)
  text(windowOffset.y,0,30)
  text(windowOffset.w,0,50)
  text(windowOffset.h,0,70)
}

//code I made forever ago for screen-filling apps
function pasteGraphic(graphic) {
  // Get the aspect ratios of the screen and the graphic
  const screenAspect = width / height;
  const graphicAspect = graphic.width / graphic.height;

  let newWidth, newHeight;

  // If the graphic is wider than the screen (or has the same aspect ratio)
  if (graphicAspect > screenAspect) {
    // Scale based on width
    newWidth = width;
    newHeight = width / graphicAspect;
  } else {
    // Scale based on height
    newWidth = height * graphicAspect;
    newHeight = height;
  }
  windowOffset={x:(width - newWidth) / 2,y:(height - newHeight) / 2,w:newWidth,h:newHeight}
  // Draw the graphic onto the main canvas, centered
  image(graphic, (width - newWidth) / 2, (height - newHeight) / 2, newWidth, newHeight);
}
let windowOffset={}
function windowResized(){
  resizeCanvas(windowWidth,windowHeight)
  updateUiPos()
}
function initCalc(){
  graphic={width:640,height:360}
    const screenAspect = width / height;
  const graphicAspect = graphic.width / graphic.height;

  let newWidth, newHeight;

  // If the graphic is wider than the screen (or has the same aspect ratio)
  if (graphicAspect > screenAspect) {
    // Scale based on width
    newWidth = width;
    newHeight = width / graphicAspect;
  } else {
    // Scale based on height
    newWidth = height * graphicAspect;
    newHeight = height;
  }
    windowOffset={x:(width - newWidth) / 2,y:(height - newHeight) / 2,w:newWidth,h:newHeight}
}
function resizeTo32(img) {
  let resized = createImage(32, 32);
  resized.copy(
    img,
    0, 0, img.width, img.height, 
    0, 0, 32, 32                 
  );
  return resized;
}

function convertToList(img){
  let output=[]
  img.loadPixels()
  let imgdata=img.pixels
  for(var i=0; i<imgdata.length; i+=4) output.push(imgdata[i+0]*65536+imgdata[i+1]*256+imgdata[i+2]);
  return output
}
