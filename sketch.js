//GLUE3D TEXTURE CONVERTER
//By LambdaLady(aka: bestbinaryboi,NULLIS, unbentunicorn79)



//setup varibles

//Rendering window/image (will be scaled up onto the main canvas so it doesn't look like a small box and i dont have to do any weird math with my positions and scaling)
let page;

//background settings
let bgSpeed=1
let bgColor1="#88B5B7"
let bgColor2="#BBBBBB"


let logo;
let images=[]
let names=[]
let imageTime=[]
let focusedImage=0
let focusTime=0
let aeroGradient;
function preload() {
  logo=loadImage("glue3dtextureconverterlogo.png")
  aeroGradient=loadImage("aerocard.png")
  
}

function lerpMod(ine){
  return -1*((constrain(ine,0,1)-1)**2)+1
}
function cycleFocusedImage(){
  focusedImage=names.indexOf(selector.selected())
  focusTime=millis()
}
let reduceMotion=false
//setup canvases
let selector
let buttonDownload
let SpriteSheetCheckbox
let ReduceMotionButton
let gradientbg;
let helpButton

function setup() {
  page=createGraphics(640,360);
  createCanvas(windowWidth,windowHeight)
  initCalc()
  console.log(windowOffset.x)
  page.pixelDensity(3)
  input = createFileInput(handleImage, true);
  SpriteSheetCheckbox = createCheckbox(" Import as sprite sheet?");
  SpriteSheetCheckbox.style("font-family: Verdana, sans-serif;")
  ReduceMotionButton = createCheckbox("Reduce Motion?");
  ReduceMotionButton.style("font-family: Verdana, sans-serif;")
  ReduceMotionButton.position(0,0)
  let reportButton=createButton("Report issue/Suggest feature")
  reportButton.position(10,height-30)
  buttonDownload = createButton('Download Files');
  reportButton.mouseClicked(goToIssues);
  buttonDownload.mousePressed(exportImages);
  // helpButton=createButton("?")
  selector = createSelect();
  selector.size(100,30)
  selector.mouseClicked(cycleFocusedImage)
  ReduceMotionButton.mouseClicked(setMotionReduce)
  updateUiPos()

}
function setMotionReduce(){
  reduceMotion=ReduceMotionButton.checked()
  if(reduceMotion){
    gradientbg=loadImage("Gradient.png")
  }
}
function goToIssues(){
  window.open("https://github.com/bestbinaryboi/Glue3DTextureConverter/issues/new", "_blank");
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
  const selectorY = 110;
  const checkboxY=110

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
    SpriteSheetCheckbox.position(
    windowOffset.x + baseX * s,
    windowOffset.y + checkboxY * s
  );
  // helpButton.position(width-30,0)
}



function handleImage(file) {
if (file.type === 'image') {
    console.log(file.name+" loading")
    
    loadImage(file.data, img => {
      if(SpriteSheetCheckbox.checked()){
        let tempArray=splitImage(img,32,32)
        for(let i=0;i<tempArray.length;i++){
          images.push(tempArray[i]);
          imageTime.push(millis())
          selector.option(file.name+i)
          names.push(file.name+i)
        }
      }
      else{
      names.push(file.name)
      images.push(resizeTo32(img));
      selector.option(file.name)
      imageTime.push(millis())
      focusTime=millis()
      }
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

  //draw background animation
  if(gradientbg&&reduceMotion){
    image(gradientbg,0,0,width,height)
  }
  else{
  push()
  stroke(bgColor2)
  strokeWeight(10)
  for (let i=0;i<width/15;i++) {
    line(((round(frameCount*bgSpeed))%30)+(i*30),0,0,(round(frameCount*bgSpeed)%30)+(i*30))
  }
  pop()
  }
  page.push()
  page.noStroke()
  page.fill(0,0,0,100,)
  page.rect(0,0,640,360,10)
  page.pop()
  //draw the card
  // page.push()
  // page.stroke(1)
  // page.fill("#49FFE3B5")
  // page.rectMode(CENTER)
  // page.rect(320,200,620,250,20)
  // page.pop()
  page.push()
  page.imageMode(CENTER)
  page.tint(255,220)
  page.image(aeroGradient,320,200,620,250)
  page.pop()
  //Draw preview
  let focusTime2=(millis()-focusTime)/200
  if(reduceMotion){
    focusTime2=1
  }
  page.push()
  page.imageMode(CENTER)
  page.textAlign(CENTER)
  page.textSize(14)
  if(images[focusedImage]){
    page.text(names[focusedImage],page.width*(3/4),145-((lerpMod(focusTime2)*100)+1)/2)
    page.image(images[focusedImage],page.width*(3/4),155,(lerpMod(focusTime2)*100)+1,(lerpMod(focusTime2)*100)+1)
  }
  else{
    page.fill(20)
    page.text("No file",page.width*(3/4),155)
  }
  page.pop()
  
  //Draw Title
  page.push()
  page.imageMode(CENTER)
  let sizeOffset=20+cos(frameCount/100)*2
  page.translate(page.width/2,55)
  // page.rotate(cos(frameCount/90)/5)
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
    page.fill(30,100)
    page.text("No files uploaded...",50,270)
  }
  for (let i = 0; i < images.length; i += 1) {
    // Calculate the y-coordinate.
    let x = i * min(34,(page.width-90-32)/images.length);
    let xMod=0
    if(!reduceMotion){
    xMod=min(lerpMod(1-((millis()-imageTime[i])/1000))*200,page.width-90)
    }
    
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
  page.text("Made by LamdaLady(NULLIS, unbentunicorn79)",5,page.height-15)
  page.textAlign(RIGHT)
  page.text("v1.3",page.width-5,page.height-15)
  page.pop()
  //render the page onto the main canvas
  pasteGraphic(page)
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
function splitImage(img, tileW, tileH) {
  let pieces = [];
  let cols = Math.floor(img.width / tileW);
  let rows = Math.floor(img.height / tileH);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let piece = createImage(tileW, tileH);
      piece.copy(
        img,
        x * tileW, y * tileH, 
        tileW, tileH,         
        0, 0,                 
        tileW, tileH          
      );
      pieces.push(piece);
    }
  }
  return pieces;
}

function convertToList(img){
  let output=[]
  img.loadPixels()
  let imgdata=img.pixels
  for(var i=0; i<imgdata.length; i+=4) output.push(imgdata[i+0]*65536+imgdata[i+1]*256+imgdata[i+2]);
  return output
}