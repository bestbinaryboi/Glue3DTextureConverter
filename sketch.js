//GLUE3D TEXTURE CONVERTER
//By LambdaLady(aka: bestbinaryboi,NULLIS, unbentunicorn79)



//setup varibles

//Rendering window/image (will be scaled up onto the main canvas so it doesn't look like a small box and i dont have to do any weird math with my positions and scaling)
let page;

//background settings
let bgSpeed=1
let bgColor1="#BBBBBB"
let bgColor2="#88B5B7"

let imagesNeeded=0
let imagesLoaded=0
let logo;
let images=[]
let names=[]
let imageTime=[]
let focusedImage=0
let lastFocusedImage=0
let focusTime=0
let aeroGradient;
let shadow;
let showBranding=true
let clickTesting=false
let dragTesting=false
function preload() {
  logo=loadImage("glue3dtextureconverterlogo.png")
}

function lerpMod(ine){
  return -1*((constrain(ine,0,1)-1)**2)+1
}
function cycleFocusedImage(){
  focusedImage=names.indexOf(selector.selected())
  if(lastFocusedImage!=focusedImage){
     focusTime=millis()
  }
  lastFocusedImage=focusedImage
}
let reduceMotion=false
//setup canvases
let selector
let buttonDownload
let SpriteSheetCheckbox
let ReduceMotionButton
let gradientbg;
let trashcanIcon
let helpButton
let reportButton
function loadPackList(){
  return getItem("packNames")
}
function savePack(packName){
  if(!Array.isArray(getItem("packNames"))){
    storeItem("packNames",[])
  }
  storeItem("packNames",[...getItem("packNames"),packName])
  let outputStack=[]
  for(let i=0;i<images.length;i++){
    outputStack.push(...convertToList(images[i]))
  }
  storeItem("PACKDATA_"+packName,outputStack)
}
function setup() {
  page=createGraphics(640,360);
  createCanvas(windowWidth,windowHeight)
  aeroGradient=loadImage("aerocard.png",onFlyImageLoad)
  shadow=loadImage("shadow.png",onFlyImageLoad)
  trashcanIcon=loadImage("trashicon.png",onFlyImageLoad)
  initCalc()
  console.log(windowOffset.x)
  page.pixelDensity(3)
  input = createFileInput(handleImage, true);
  SpriteSheetCheckbox = createCheckbox(" Import as sprite sheet?");
  SpriteSheetCheckbox.style("font-family: Verdana, sans-serif;")
  ReduceMotionButton = createCheckbox("Reduce Motion?");
  ReduceMotionButton.style("font-family: Verdana, sans-serif;")
  ReduceMotionButton.position(0,0)
  reportButton=createButton("Report issue/Suggest feature")
  reportButton.position(10,height-30)
  buttonDownload = createButton('Download Files');
  reportButton.mouseClicked(goToIssues);
  buttonDownload.mousePressed(exportImages);
  // helpButton=createButton("?")
  // helpButton.position(width-30,5)
  selector = createSelect();
  selector.size(100,30)
  selector.mouseClicked(cycleFocusedImage)
  ReduceMotionButton.mouseClicked(setMotionReduce)
  updateUiPos()
  setMotionReduce()
  if(getItem("packNames")){
  foundFiles=getItem("packNames")}
  else{
    foundFiles=[]
  }

}
startReadyNeeded=2
startReadyHad=0
function onFlyImageLoad(){
  startReadyHad++
}
function setMotionReduce(){
  reduceMotion=ReduceMotionButton.checked()
  gradientbg=loadImage("Gradient.png")
}
function goToIssues(){
  window.open("https://github.com/bestbinaryboi/Glue3DTextureConverter/issues/new", "_blank");
}

let UiYOffset=0
function updateUiPos() {
  const s = windowOffset.w / page.width;
  reportButton.position(10,height-30)
  // positions in page-space
  const baseX = 30;
  const otherX = 640-100;
  const inputY = 90+UiYOffset;
  const buttonY = 130+UiYOffset;
  const selectorY = 110+UiYOffset;
  const checkboxY=110+UiYOffset;

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
  console.log(file.type)
if (file.type === 'image') {
    console.log(file.name+" loading")
    imagesNeeded++
    loadImage(file.data, img => {
      imagesLoaded++
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
  if (file.type === 'text') {
    console.log(file.name+" loading as list")
    imagesNeeded++
    console.log(file.data)
    imagesLoaded++
    fileData=split(file.data,"\n")
    let tempArray=splitImage(listToImg(fileData),32,32)
    for(let i=0;i<tempArray.length;i++){
      images.push(tempArray[i]);
      imageTime.push(millis())
      selector.option(file.name+i)
      names.push(file.name+i)
    }
  }
}
let startDone=true
function numberToOrdinal(n){
  const v=n%100
  if(v>=11 && v<=13) return n+"th";
  switch (n%10){
    case 1: return n+"st";
    case 2: return n+"nd";
    case 3: return n+"rd";
    default: return n+"th";
  }
  
}
let lerpLoad=0
let startedDelay=0
function listToImg(fileArray){
  let listImageHeight=32*floor(fileArray.length/(32*32))
  console.log("creating 32 by "+listImageHeight+" image")
  let imagePixels=[]
  for(let i=0; i<fileArray.length; i+=1) {
    imagePixels.push((fileArray[i] >> 16) & 0xff, (fileArray[i] >> 8) & 0xff, fileArray[i] & 0xff, 255);
  }
  let listImage=createImage(32,listImageHeight)
  listImage.loadPixels()
  if(imagePixels.length!=listImage.pixels.length){
    console.warn("Image doesn't match calculated size")
  }
  for(let i=0;i<imagePixels.length;i++){
    listImage.pixels[i]=imagePixels[i]
  }
  listImage.updatePixels()
  return listImage
}

function exportImages(){
  if(images.length==0){
    window.alert("Heres smth to process :) (In the future make sure to Choose Files before downloading the output)")
    for(let i=1;i<100;i++){
      console.log(numberToOrdinal(i))
      handleImage({name:"THE "+numberToOrdinal(i).toUpperCase()+" CHEESE",data:"slice-of-cheese.png",type:"image"})
    }
    return
  }
  let outputStack=[]
  for(let i=0;i<images.length;i++){
    outputStack.push(...convertToList(images[i]))
    
  }
  saveStrings(outputStack, "glue3d-"+names[0],"txt")
}
function mouseReleased(){
  if(inDragMode){
    inDragMode=false
    if(getClickedItem()!=undefined){
      swapTextures(focusedImage,getClickedItem())
    }
    const s = windowOffset.w / page.width;
    if(isInBounds(windowOffset.x+(45+550)*s,windowOffset.y+290*s,32*s,32*s)){
      images.splice(focusedImage,1)
      names.splice(focusedImage,1)
      focusedImage=undefined
    }
  }
}
let testSlider=15
//main draw loop obviously
function draw() {
  background(bgColor1);
  page.clear()
  if(!mouseIsPressed){
  dragModeTimer=millis()
  }
  if((millis()-dragModeTimer>2000)&&(focusedImage!=undefined)){
    inDragMode=true
  }
  //draw background animation
  if(gradientbg){
    image(gradientbg,0,0,width,height)
  }
  else{
  // push()
  // stroke(bgColor2)
  // strokeWeight(10)
  // for (let i=0;i<width/15;i++) {
  //   line(((round(frameCount*bgSpeed))%30)+(i*30),0,0,(round(frameCount*bgSpeed)%30)+(i*30))
  // }
  // pop()
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
    page.image(shadow,page.width*(3/4),210,shadow.width*0.25*lerpMod(focusTime2),shadow.height*0.25*lerpMod(focusTime2))
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
  if (showBranding) page.image(logo,0,0,logo.width*0.22+sizeOffset,logo.height*0.22+sizeOffset);
  
  page.pop()
  
  //draw image bar
  page.push()
  page.imageMode(CORNER)
  page.rectMode(CORNER)
  page.fill(255,255,255,100)
  page.stroke(255)
  page.rect(45,245,550,42,10)
  //loading
  if(imagesNeeded>0){
  lerpLoad=lerp(lerpLoad,imagesLoaded/imagesNeeded,0.9)
  page.rect(45,267,550*(lerpLoad),20,10)
  }
  page.noStroke()
  if(images.length==0){
    page.fill(30,100)
    page.textAlign(LEFT)
    page.text("No files uploaded...",50,270)
  }
  else{
    page.textAlign(RIGHT)
    page.fill(255,200)
    page.textSize(14)
    page.text(images.length,40,270)
    page.textSize(8)
    page.textAlign(CENTER)
    if(images.length==1){
      page.text("file",35,280)
    }
    else{
      page.text("files",35,280)
    }
    
  }
  const s = windowOffset.w / page.width;
  if(deleteMode||(inDragMode&&isInBounds(windowOffset.x+(45+550)*s,windowOffset.y+290*s,32*s,32*s))){
    trashY=lerp(trashY,-10,0.9)
  }
  else{
    trashY=lerp(trashY,0,0.9)
  }
  
  page.image(trashcanIcon,45+550,290+trashY,32,32)
  for (let i = 0; i < images.length; i += 1) {
    // Calculate the y-coordinate.
    let x = i * min(34,(page.width-90-32)/images.length);
    let xMod=0
    
    if(!reduceMotion){
    xMod=min(lerpMod(1-((millis()-imageTime[i])/1000))*200,page.width-90)
    }
    // Draw the image.
    if(deleteMode){
      page.tint(175+75*sin(millis()/1000+i),100,100)
    }
    if(focusedImage==i){
    if(!inDragMode){
      if(millis()-dragModeTimer>500){
      page.tint(((millis()-dragModeTimer-500)/1500)*100+150)
      page.image(images[i], x+50+xMod,250, 32, 32)
      }
      else{
      page.image(images[i], x+50+xMod, 250-20*abs((sin((millis()/1000)*(1/0.7)*PI))), 32, 32)
      }
      page.noTint()
    }
    }
    else{
      page.image(images[i], x+50+xMod, 250, 32, 32)
    }
  }
  page.pop()
  page.push()
  page.fill(200)
  page.textAlign(LEFT)
  page.textSize(10)
  if(showBranding) page.text("Made by LamdaLady(NULLIS, unbentunicorn79)",5,page.height-15);
  page.textAlign(RIGHT)
  page.text("v1.5",page.width-5,page.height-15)
  page.pop()
  //render the page onto the main canvas
  // if(!startDone){
  //   let pullUpOffset=(1-lerpMod((millis()-startedDelay)/1000))
  //   push()
  //   tint(255,pullUpOffset*255)
  //   imageMode(CENTER)
  //   rectMode(CENTER)
  //   if (showBranding) image(logo,logo.width*0.4+10,logo.height*0.4,logo.width*0.8,logo.height*0.8);
  //   else rect(logo.width*0.4+10,logo.height*0.4,logo.width*0.8,logo.height*0.8);
  //   textAlign(CENTER)
  //   textSize(20)
  //   fill(255,pullUpOffset*255)
  //   // text("Click anywhere to start",width/2,height*(3/4))
  //   renderButton(aeroGradient,50,logo.height*0.8,100,100,"New Pack")
  //   renderButton(aeroGradient,160,logo.height*0.8,100,100,"Import")
  //   textSize(15)
  //   renderFileList()
  //   pop()
  //   translate(0,height*pullUpOffset)
  //   if(pullUpOffset==0){
  //     startDone=true
  //   }
  //   UiYOffset=pullUpOffset*height
  //   updateUiPos()
  // }
  if(startedDelay!=Infinity){
    pasteGraphic(page)
  }
  
  //Click testing
  if(clickTesting){
  const s = windowOffset.w / page.width;
  for (let i = 0; i < images.length; i += 1) {
    // Calculate the y-coordinate.
    let x = i * min(34,(page.width-90-32)/images.length);
    let xMod=0
    if(!reduceMotion){
    xMod=min(lerpMod(1-((millis()-imageTime[i])/1000))*200,page.width-90)
    }
    
    // Draw the image.
    if(focusedImage==i){
    }
    else{
      push()
      stroke(0)
      strokeWeight(2)
      textAlign(LEFT)
      text("working",0,50)
      rect(windowOffset.x+(x+50+xMod)*s,windowOffset.y+250*s,32*s,32*s)
      pop()
    }
  }
  }
  
  
  if(dragTesting){
  text("timer: "+round(millis()-dragModeTimer)+"  dragMode?: "+inDragMode+" dropping to:"+getClickedItem(),0,30)
  }
  if(inDragMode){
    push()
    tint(255/1.5,200)
    image(images[focusedImage],mouseX,mouseY)
    pop()
    cursor('grabbing')
  }
  else{
    cursor(ARROW)
  }
}
function isInBounds(boxx,boxy,boxw,boxh){
  boxx2=boxx+boxw
  boxy2=boxy+boxh
  return (boxx<mouseX)&&(mouseX<boxx2)&&(boxy<mouseY)&&(mouseY<boxy2)
}
function getClickedItem(){
  let thisOutput
  const s = windowOffset.w / page.width;
  for (let i = 0; i < images.length; i += 1) {
    // Calculate the y-coordinate.
    let x = i * min(34,(page.width-90-32)/images.length);
    let xMod=0
    if(!reduceMotion){
    xMod=min(lerpMod(1-((millis()-imageTime[i])/1000))*200,page.width-90)
    }
    
    // Draw the image.
    if(focusedImage==i){
    }
    else{
      if(isInBounds(windowOffset.x+(x+50+xMod)*s,windowOffset.y+250*s,32*s,32*s)){
        thisOutput=i
      }
    }
  }
  return thisOutput
  
}
let dragModeTimer=0
let inDragMode=false
let deleteMode=false
let trashY=0
function mousePressed(){
  if(renderButton(aeroGradient,50,logo.height*0.8,100,100,"")){
    if(startedDelay==Infinity){
      startedDelay=millis()
    }
  }
  const s = windowOffset.w / page.width;
  if(isInBounds(windowOffset.x+(45+550)*s,windowOffset.y+290*s,32*s,32*s)){
    deleteMode=!deleteMode
  }
  if(deleteMode){
    if(getClickedItem()==undefined){
      return
    }
    images.splice(getClickedItem(),1)
    names.splice(getClickedItem(),1)
  }
  else{
    if(getClickedItem()!=undefined){
      focusedImage=getClickedItem()
    }
    
  }
  
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
let foundFiles=[]
function renderFileList(){
  for(let i=0;i<foundFiles.length;i++){
    renderButton(shadow,270,logo.height*0.8+(i*35),140,30,foundFiles[i])
  }
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
function swapTextures(index1,index2){
  [images[index1], images[index2]] = [images[index2], images[index1]];
  [names[index1], names[index2]] = [names[index2], names[index1]];
}
function renderButton(inimg,sx,sy,sw,sh,inText=""){
  push()
  imageMode(CORNER)
  if(inimg){
  image(inimg,sx,sy,sw,sh)
  }
  textAlign(CENTER)
  text(inText,sx+(sw/2),sy+(sh/2))
  pop()
  return ((mouseX>sx)&&(mouseX<sx+sw))&&((mouseY>sy)&&(mouseY<sy+sh))
}
function convertToList(img){
  let output=[]
  img.loadPixels()
  let imgdata=img.pixels
  for(var i=0; i<imgdata.length; i+=4) output.push(imgdata[i+0]*65536+imgdata[i+1]*256+imgdata[i+2]);
  return output
}
