

//variables for canvases and their dimensions
var canvas = document.getElementById("canvas");
var toolCanvas = document.getElementById("toolBar");
var ctx = canvas.getContext("2d");
var ctxToolbar = toolCanvas.getContext("2d");
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight*2;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

//variables for toolbars and workspace
var toolBarWidth = 0.1*canvasWidth;
toolCanvas.width = canvasWidth;
toolCanvas.height = canvasHeight;
var toolBar = [0,0, toolBarWidth, canvasHeight/2];
var editBar = [canvasWidth-1.2*toolBarWidth, 0, 1.2*toolBarWidth, canvasHeight/2];

var toolWidth = 0.6*toolBarWidth;
var workSpace = [toolBarWidth, 0, canvasWidth-toolBarWidth, canvasHeight];

var workSpaceCenterX = 0.49*canvasWidth;
var dragTabSize = 0.2*toolWidth;
var dragTabColor = 'gray';

var divSquare, divSquare2, divSquare3;

var colorInput;
var allElements, allText;
var shapeColor;

var focusedElement;
var selectedElements;

const RESIZE_TAB = 0;
const MOVEMENT_TAB = 1;
const COLOR_TAB = 2;


var controlHeld = false;
var shiftHeld = false;
var mouseX, mouseY;
var clipboardItem;

var editToolsVisible = false;
var textSliderVisible = false;

//Class definitions
class Object
{
  constructor(id, x, y, width, height, colorIndex, image)
  {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.colorIndex = colorIndex;
    this.color = colors[colorIndex];
    this.opacity = 1.0;
    this.image = image;
  }

  refreshColor()
  {
    this.color = colors[this.colorIndex];
  }

  draw(ctx)
  {
    this.drawWholeArea(ctx);
    //for tools
    // if(this.id.charAt(0) == 'h' || this.id.charAt(0) == 'p')//should jus tbe first letter H or p
    // {
    //   ctx.font = toolBarWidth/4+'px Luckiest Guy';
    //   // context.font = 0.5*bubbleHeight+'px Righteous';
    //   // var wordWidth = context.measureText(this.messageToSend).width;
    //   ctx.fillStyle='black';
    //   // ctx.fillText(messageToSend, bubbleX+(0.25*width), bubbleY+(0.75*height));
    //   ctx.fillText(this.id, this.x+0.1*this.width, this.y+0.8*this.height);
    // }
    //check if image assigned
    if(this.image != null)
    {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  drawWholeArea(ctx)
  {
    ctx.fillStyle= this.color;
    if(this.id.toLowerCase().includes('circle'))
    {
      ctx.beginPath();
      ctx.ellipse(this.x+0.5*this.width, this.y+0.5*this.height, 0.5*this.width, 0.5*this.height, 0, 0, 2 * Math.PI);
      ctx.fill();
    }
    else
    {
      ctx.fillRect(this.x, this.y,this.width,this.height);
    }
  }
}

//All objects that will become HTML elements
class Element extends Object
{
  constructor(id, x, y, width, height, colorIndex, type)
  {
    super(id, x, y, width, height, colorIndex);
    this.type = type;
    this.isFocus = true;
    this.tabList = [];
    this.updateTabPositions();
  }

  draw(ctx)
  {
    this.drawWholeArea(ctx);

    //only draw edit areas if focused, moved to global drawWall
      // so will be drawn above everything
    // if(this.isFocus)
    // {
    //   this.drawAllTabs(ctx);
    // }
  }

  drawAllTabs(ctx)
  {
    this.updateTabPositions();
    for(var i = 0; i < this.tabList.length; i++)
    {
      if(i == 0)//resize tab
      {
        ctx.fillStyle= dragTabColor;
      }
      else if(i == 1)//position tab
      {
        ctx.fillStyle= 'lightblue';
      }
      else if(i == 2)//color tab
      {
        ctx.fillStyle= 'green';
      }
      ctx.fillRect(this.tabList[i][0], this.tabList[i][1], this.tabList[i][2], this.tabList[i][3]);
    }
  }

  updateTabPositions()
  {
    var resizeTab = [this.x+this.width, this.y+this.height, dragTabSize, dragTabSize];
    var positionTab = [this.x+0.5*this.width-0.5*dragTabSize, this.y+this.height, dragTabSize, 2*dragTabSize];
    // var colorTab = [this.x+0.75*this.width, this.y+this.height, dragTabSize, dragTabSize];

    this.tabList = [resizeTab, positionTab];
    // this.tabList = [resizeTab, positionTab, colorTab];
  }
}


class Text extends Element
{
  constructor(id, x, y, width, height, color, type)
  {
    super(id, x, y, width, height, color, type);
    this.fontColor = 'black';
    //create new input at newHeadingx y

    //elementDragging is the tool dragged
    if(elementDragging.id == 'h')
    {
      activeInput = document.createElement('input');
      activeInput.classList.add("headingInput");
      activeInput.type = 'text';
    }
    else if(elementDragging.id == 'h2')
    {
      activeInput = document.createElement('input');
      activeInput.classList.add("heading2Input");
      activeInput.type = 'text';
    }
    else if(elementDragging.id == 'p')
    {
      activeInput = document.createElement('textarea');
      activeInput.classList.add("paragraphInput");
      activeInput.rows = '4';
      activeInput.cols = '50';
    }
    this.htmlElement = activeInput;
    this.htmlElement.id = this.id;
    this.updateHtmlElement();//position, size, color

    activeInput.onmousedown = function(event)
		{
			//make this focus
      if(focusedElement != null)
      {
        focusedElement.isFocus = false;
        if(focusedElement.type == 'heading' || focusedElement.type == 'paragraph')
        {
        }
        // elementDragging.isFocus = false;
      }
      var thisInput = event.target;
      var idToCheck = thisInput.id;
      if(idToCheck.charAt(0) == 'h')
      {
        var index = parseInt(idToCheck.substring(7), 10);
      }
      else if(idToCheck.charAt(0) == 'p')
      {
        var index = parseInt(idToCheck.substring(9), 10);
      }

      var element = allElements[index];
      element.isFocus = true;
      focusedElement = element;
    }


    activeInput.onkeydown = function(event)
    {
      var thisInput = event.target;
      var fontSize = window.getComputedStyle(thisInput).getPropertyValue('font-size');
      // ctx.font = fontSize+' Luckiest Guy'; //just for measurement
      ctx.font = fontSize+' Righteous'; //just for measurement
      // let fontSizeVw = element.
      var wordWidth = canvasWidth*0.02+ctx.measureText(thisInput.value).width;
      var idToCheck = thisInput.id;
      if(idToCheck.charAt(0) == 'h')
      {
        var index = parseInt(idToCheck.substring(7), 10);
        thisInput.style.width = wordWidth+'px';
        var element = allElements[index];
        element.width = wordWidth;
      }
      // else if(idToCheck.charAt(0) == 'p')
      // {
      //   var index = parseInt(idToCheck.substring(9), 10);
      //   var element = allElements[index];
      // }
    }

    document.getElementsByTagName('body')[0].insertBefore(activeInput, colorInput);
    activeInput.focus();
  }

  updateTextObject()
  {
    var thisInput = this.htmlElement;
    var fontSize = window.getComputedStyle(thisInput).getPropertyValue('font-size');
    // ctx.font = fontSize+' Luckiest Guy'; //just for measurement
    ctx.font = fontSize+' Righteous'; //just for measurement
    // let fontSizeVw = element.
    var wordWidth = canvasWidth*0.02+ctx.measureText(thisInput.value).width;
    var idToCheck = thisInput.id;
    // if(idToCheck.charAt(0) == 'h')
    // {
    var index = parseInt(idToCheck.substring(7), 10);
    thisInput.style.width = wordWidth+'px';
    var element = allElements[index];
    element.width = wordWidth;
    this.updateHtmlElement();
    // }
  }

  draw(ctx)
  {
    if(this.isFocus)
    {
      //white when editing text, transparent when not
      this.color = 'rgba(255,255,255,0.5)';
    }
    else
    {
      this.color = 'rgba(255,255,255,0.0)';
    }
    this.drawWholeArea(ctx);
  }
  updateHtmlElement()
  {
    this.htmlElement.style.left = this.x+'px';
    this.htmlElement.style.top = this.y+'px';
    this.htmlElement.style.width = this.width+'px';
    this.htmlElement.style.height = this.height+'px';
    this.htmlElement.style.color = this.fontColor;
  }
}

class BuildImage extends Element
{
  constructor(id, x, y, width, height, colorIndex, type)
  {
    super(id, x, y, width, height, colorIndex, type);
    var newHtmlImage = document.createElement('img');
    this.htmlElement = newHtmlImage;
    this.htmlElement.id = this.id;
    this.ratio = 1;

    this.src = '';
    this.canvasImage = new Image();
    this.canvasImage.src = this.src;

    this.updateHtmlElement();
  }

  updateHtmlElement()
  {
    this.htmlElement.style.left = this.x+'px';
    this.htmlElement.style.top = this.y+'px';
    this.htmlElement.style.width = this.width+'px';
    this.htmlElement.style.height = this.height+'px';
  }

  draw(ctx)
  {
    ctx.drawImage(this.canvasImage, this.x, this.y, this.width, this.height);
  }
}

var colors, margin;

init();

function init()
{
  allElements = [];
  allText = [];
  allTools = [];
  selectedElements = [];
  margin = toolWidth/3;
  initImages();
  // colors = ['#C7DFC5','#C1DBE3', '#373737'];
  // colors = ['#420039','#932F6D', '#DCCCFF'];
  // colors = ['#2E86AB','#F5F749', '#F24236'];
  // colors = ['#f27a86','#ffce67', '#acdacf', '#85c3dc', 'white'];
    //blue, yellow orange
  colors = ['#2176AE','#FBB13C', '#FE6847', 'white', 'black'];
  // colors = ['#F4C95D','#DD7230', '#854D27'];
  //postions need calculating, i*margin, if i%2==0 add top margin etc)
  divSquare = new Object('divSquare',margin, 0.1*canvasHeight, toolWidth, toolWidth, 3);
  toolHeading = new Object('h', margin, 0.2*canvasHeight, toolWidth, toolWidth, 1, textSizeImage);
  toolHeading.color = 'rgba(1,1,1,0.0)';
  toolImage = new Object('img', margin, 0.3*canvasHeight, toolWidth, toolWidth, 2, imageImage);

  allTools.push(divSquare);
  allTools.push(toolHeading);
  allTools.push(toolImage);

  colorInput = document.getElementById("colorInput");
  fontSizeInput = document.getElementById("fontSizeSlider");
  opacitySlider = document.getElementById("opacitySlider");
  //need delay to wait for google font to load
  setTimeout(draw, 500);
  // draw();
}

function drawToolbar(ctxToolbar)
{
  ctxToolbar.fillStyle='lightgray';
  ctxToolbar.fillRect(toolBar[0], toolBar[1], toolBar[2], toolBar[3]);
  for(var i = 0; i < allTools.length; i++)
  {
    allTools[i].draw(ctxToolbar);
  }
}

function drawEditBar(ctxEditbar)
{
  //draw gray background
  ctxEditbar.fillStyle='lightgray';
  ctxEditbar.fillRect(editBar[0], editBar[1], editBar[2], editBar[3]);

  //draw slider labels
  if(editToolsVisible)
  {
    ctxEditbar.drawImage(opacityImage, canvasWidth-0.45*toolBarWidth, 0.30*canvasHeight, 0.03*canvasWidth, 0.03*canvasWidth);

    ctxEditbar.globalAlpha = 0.2;
    ctxEditbar.drawImage(opacityImage, canvasWidth-1.1*toolBarWidth, 0.30*canvasHeight, 0.03*canvasWidth, 0.03*canvasWidth);
    ctxEditbar.globalAlpha = 1.0;

  }

  if(textSliderVisible)
  {
    ctxEditbar.drawImage(textSizeImage, canvasWidth-0.45*toolBarWidth, 0.20*canvasHeight, 0.03*canvasWidth, 0.03*canvasWidth);
    ctxEditbar.drawImage(textSizeImage, canvasWidth-1.1*toolBarWidth, 0.21*canvasHeight, 0.015*canvasWidth, 0.015*canvasWidth);
  }
}

var opacityImage, textSizeImage, textSizeSmallImage, imageImage;

function initImages()
{
  opacityImage = new Image();
  opacityImage.src = 'opacity.png';
  textSizeSmallImage = new Image();
  textSizeSmallImage.src = 'textSizeSmall.png';
  textSizeImage = new Image();
  textSizeImage.src = 'textSize.png';
  imageImage = new Image();
  imageImage.src = 'imageIcon2.jpg';
}

function draw()
{

  ctx.clearRect(0,0,canvasWidth,canvasHeight);
  ctxToolbar.clearRect(toolBarWidth,0,canvasWidth,canvasHeight);

  for(var i=0; i<allElements.length; i++)
  {
    ctx.globalAlpha = allElements[i].opacity;
    allElements[i].draw(ctx);
    ctx.globalAlpha = 1.0;
  }
  for(var i=0; i<selectedElements.length; i++)
  {
      selectedElements[i].drawAllTabs(ctx);
  }
  drawToolbar(ctxToolbar);//all tools
  drawEditBar(ctxToolbar);
  if(editToolsVisible)
  {
    drawPalette();
  }
}

function checkClickTab(clickX, clickY)
{
  var result = [false, -1];
  var activeTabs = shapeToCheck.tabList;
  var leway = 20;
  for(var i = 0; i< activeTabs.length; i++)
  {
    var tab = activeTabs[i];
    if(collides(clickX-(0.5*leway), clickY-(0.5*leway), leway, leway, tab[0], tab[1], tab[2], tab[3]))
    {
      result[0] = true;
      result[1] = i;
    }
  }
  return result;
}

function elementCollides(element1, element2)
{
  return collides(element1.x-2, element1.y-2, element1.width+4, element1.height+4, element2.x-2, element2.y-2, element2.width+4, element2.height+4);
  // return collides(element1.x, element1.y, element1.width, element1.height, element2.x, element2.y, element2.width, element2.height);
}

function collides(object1x, object1y, object1width, object1height, object2x, object2y, object2width, object2height)
{
 var doesCollide = false;
 var rightOfLeft = object1x < object2x + object2width;
 var leftOfRight = object1x + object1width > object2x;
 var aboveBottom = object1y < object2y + object2height;
 var belowTop = object1y + object1height > object2y;
	if(object1x < object2x + object2width &&
		object1x + object1width > object2x &&
		object1y < object2y + object2height &&
		object1y + object1height > object2y)
		{
			doesCollide = true;
		}
	return doesCollide;
}
var autoPosBuffer = 50;
function checkAutoPosition(element)
{
  var repositioned = false;
  for(var i=0; i<allElements.length; i++)
  {
    var previousEl = allElements[i];
    if(previousEl != element
    && !(previousEl instanceof Text || previousEl instanceof BuildImage))
    {
      if(elementCollides(element, previousEl))
      {
        //check side collided
        // if(element.x < previousEl.x+previousEl.width && element.x > previousEl.x+previousEl.width-autoPosBuffer)
        // {
        //   element.x = previousEl.x+previousEl.width;
        // }
        if(element.width < previousEl.width && element.width > previousEl.width - autoPosBuffer
          || element.width > previousEl.width && element.width < previousEl.width + autoPosBuffer)
        {
          element.width = previousEl.width;
        }

        if(element.y < previousEl.y+previousEl.height && element.y > previousEl.y+previousEl.height-autoPosBuffer)
        {
          element.y = previousEl.y+previousEl.height-2;
          repositioned = true;
        }
      }

      // if(repositioned)
      // {
      //
      // }
    }
  }
}

function checkAutoCenter(element)
{
  var elementCenterX = elementDragging.x+0.5*elementDragging.width;
  if(elementCenterX > workSpaceCenterX-autoPosBuffer && elementCenterX < workSpaceCenterX+autoPosBuffer)
  // if(elementCenterX > 0.49*canvasWidth-autoPosBuffer && elementCenterX < 0.49*canvasWidth+autoPosBuffer)
  {
    elementDragging.x = workSpaceCenterX - 0.5*elementDragging.width;
    // elementDragging.x = 0.49*canvasWidth - 0.5*elementDragging.width;
  }
}

var allTextFocusable = true;
function setAllTextFocusable(focusable)
{
  for(var i=0; i<allElements.length; i++)
  {
    var element = allElements[i];
    if(element instanceof Text && element != focusedElement)
    {
      if(!focusable)
      {
        element.htmlElement.classList.add("unfocusable");
      }
      else
      {
        element.htmlElement.classList.remove("unfocusable");
      }
    }
  }
  allTextFocusable = !allTextFocusable;
}

var isPlacingNewShape, isMovingShape, isResizing;
var leftMouseDown;
var elementDragging = null;
var startOfDrag = [];
var preDragPositions = [];
var sizeStartOfDrag = [];
var focusedElement;
var shapeToCheck;
window.onmousedown = function(e)
{
  // focusedElement = null;
  elementDragging = null;
  leftMouseDown = true;
  let nothingClicked = true;
  let clickPadding = 10;
    //check if clicking a tool
  for(var i = 0; i < allTools.length; i++)
  {
    var tool = allTools[i];

    if(collides(e.clientX-(0.5*clickPadding), e.clientY-(0.5*clickPadding), clickPadding, clickPadding, tool.x, tool.y, tool.width, tool.height))
    {
      isPlacingNewShape = true;
      leftMouseDown = true;
      startOfDrag = [tool.x, tool.y];
      mouseStartOfDrag = [e.pageX, e.pageY];
      elementDragging = tool;
      nothingClicked = false;
      selectedElements = [];
      opacitySlider.value = 100;
      //need unfocusAllElements() function?
      if(focusedElement != null)
      {
        focusedElement.isFocus = false;
        // if(focusedElement.type == 'heading' || focusedElement.type == 'paragraph')
        if(shapeToCheck instanceof Text)
        {
          // focusedElement.htmlElement.style.backgroundColor = 'transparent';
        }
        // elementDragging.isFocus = false;
      }
    }
    else
    {
      //no tool clicked
    }
  }

  //check if cicking an element/any edit tab
  for(var i = allElements.length; i > 0; i--)
  {
    shapeToCheck = allElements[i-1];
    var tabCheckResult = checkClickTab(e.pageX, e.pageY);
    var tabClicked = tabCheckResult[0];
    var whichTab = tabCheckResult[1]; //index in activeTabs

    nothingClicked = !tabClicked;

    // var tabs = shapeToCheck.tabList;
                                    //if clicked shape/div
    if(collides(e.pageX-(0.5*clickPadding), e.pageY-(0.5*clickPadding), clickPadding, clickPadding, shapeToCheck.x, shapeToCheck.y, shapeToCheck.width, shapeToCheck.height))
    {

      // if(shapeToCheck instanceof Text)
      // {
      //   shapeToCheck.htmlElement.focus();
      // }
      nothingClicked = false;

      if(focusedElement != null)
      {
        //unfocus previous focused element
        focusedElement.isFocus = false;
        // elementDragging.isFocus = false;
      }
      focusedElement = shapeToCheck;
      focusedElement.isFocus = true;


      showEditTools();



      if(!controlHeld)
      {
      // selectedElements = [];
        if(selectedElements.length < 2)
        {
          selectedElements = [];
          selectedElements[0] = focusedElement;
        }
      }
      else
      {
        if(!selectedElements.includes(focusedElement))
        {
          selectedElements.push(focusedElement);
        }
      }

      if(!(focusedElement instanceof Text))
      {
        isMovingShape = true;
      }
	  else
	  {
      showTextTools();
	  }
      setAllTextFocusable(false);
      //needs to be for every shape
      for(var i=0; i<selectedElements.length; i++)
      {
        preDragPositions[i] = [selectedElements[i].x, selectedElements[i].y];
      }
      // startOfDrag = [shapeToCheck.x, shapeToCheck.y];
      mouseStartOfDrag = [e.pageX, e.pageY];
      elementDragging = shapeToCheck;
      break;
    }
                                    //if clicked resize tab
    // if(collides(e.pageX, e.pageY, 10, 10, shapeToCheck.x+shapeToCheck.width, shapeToCheck.y+shapeToCheck.height, 2*dragTabSize, 2*dragTabSize)
    // && shapeToCheck.isFocus)
    else if(tabClicked && whichTab == RESIZE_TAB)  //tablist[0] = resizeTab, could be RESIZE_TAB (= 0)
    {
      isResizing = true;
      sizeStartOfDrag = [shapeToCheck.width, shapeToCheck.height];
      mouseStartOfDrag = [e.pageX, e.pageY];
      elementDragging = shapeToCheck;
      break;
    }                                   //movement tab
    // else if(collides(e.pageX, e.pageY, 10, 10, shapeToCheck.x+0.5*shapeToCheck.width-0.5*dragTabSize, shapeToCheck.y+shapeToCheck.height, 2*dragTabSize, 3*dragTabSize)
    // && shapeToCheck.isFocus)
    else if(tabClicked && whichTab == MOVEMENT_TAB)
    {
      if(focusedElement != null)
      {
        focusedElement.isFocus = false;
        // elementDragging.isFocus = false;
      }
      focusedElement = shapeToCheck;
      shapeToCheck.isFocus = true;
      isMovingShape = true;
      setAllTextFocusable(false);

      for(var i=0; i<selectedElements.length; i++)
      {
        preDragPositions[i] = [selectedElements[i].x, selectedElements[i].y];
      }
      // startOfDrag = [shapeToCheck.x, shapeToCheck.y];
      mouseStartOfDrag = [e.pageX, e.pageY];
      elementDragging = shapeToCheck;
      break;
  }                                      //color tab
    else if(tabClicked && whichTab == COLOR_TAB)
    {
      //show color picker
        //square with 4 square colors like toolbar
      console.log('color');
    }

  }
  //if click within the toolbar
  if(collides(e.pageX, e.pageY, 5, 5, 0, 0, toolBarWidth, canvasHeight)
	  || collides(e.pageX, e.pageY, 5, 5, editBar[0], editBar[1], toolBarWidth, canvasHeight))
  {
    nothingClicked = false;
  }

  if(collides(e.clientX, e.clientY, 5, 5, editBar[0], paletteY, 5*colorWidth, colorHeight))
  {
    for(let i = 0; i < colors.length; i++)
    {
      let colorX = editBar[0]+i*colorWidth;
      if(e.clientX > colorX && e.clientX < colorX+colorWidth)
      {
        focusedElement.colorIndex = i;
        focusedElement.refreshColor();
        if(focusedElement instanceof Text)
        {
          focusedElement.fontColor = colors[i];
          focusedElement.updateHtmlElement();
        }
        // focusedElement.color = colors[i];
      }
    }
  }
  //only works if background of workspace clicked, need deselect hoykey?
  if(nothingClicked)
  {
    selectedElements = [];
    if(focusedElement != null)
    {
      focusedElement.isFocus = false;
      // elementDragging.isFocus = false;
    }
    focusedElement = null;
  	opacitySlider.style.opacity = 0.0;
    editToolsVisible = false;
  	colorInput.style.opacity = 0.0;
  	fontSizeInput.style.opacity = 0.0;
    textSliderVisible = false;
  }
  // setTestLabel(e.pageX +'y'+ e.pageY +'vs'+ divSquare.x +'y'+ divSquare.y,);
  draw();
}

window.onmousemove = function(e)
{
  // xDifference = e.pageX - mouseStartOfDrag[0];
  // yDifference = e.pageY - mouseStartOfDrag[1];


  //need to separate placing new shape and moving placed shape
  mouseX = e.pageX;
  mouseY = e.pageY;
  if(isPlacingNewShape)
  {
    xDifference = e.pageX - mouseStartOfDrag[0];
    yDifference = e.pageY - mouseStartOfDrag[1];
    elementDragging.x = startOfDrag[0] + xDifference;
    elementDragging.y = startOfDrag[1] + yDifference;
    // if(elementDragging.type == 'heading' || elementDragging.type == 'paragraph')
    if(elementDragging instanceof Text
    || elementDragging instanceof BuildImage)
    {
      elementDragging.updateHtmlElement();
    }

    draw();
  }
  else if(isMovingShape)
  {
    // move all selected elements
    xDifference = e.pageX - mouseStartOfDrag[0];
    yDifference = e.pageY - mouseStartOfDrag[1];
    for(var i=0; i<selectedElements.length; i++)
    {
      let elementToMove = selectedElements[i];
      elementToMove.x = preDragPositions[i][0] + xDifference;
      elementToMove.y = preDragPositions[i][1] + yDifference;
      // elementToMove.x = startOfDrag[0] + xDifference;
      // elementToMove.y = startOfDrag[1] + yDifference;
      // if(elementDragging.type == 'heading' || elementDragging.type == 'paragraph')
      if(elementToMove instanceof Text
      || elementToMove instanceof BuildImage)
      {
        elementToMove.updateHtmlElement();
      }
    }

    draw();
  }
  else if(isResizing)
  {
    xDifference = e.pageX - mouseStartOfDrag[0];
    yDifference = e.pageY - mouseStartOfDrag[1];
    elementDragging.width = sizeStartOfDrag[0] + xDifference;
    //if image, keep original ratio (ratio = width/height)
    if(shapeToCheck instanceof BuildImage)
    {
      let ratio = elementDragging.ratio;
      elementDragging.height = elementDragging.width/ratio;
      // elementDragging.height = sizeStartOfDrag[1] + yDifference;
    }
    else if(shapeToCheck.id == 'circle' && shiftHeld)
    {
      elementDragging.height = elementDragging.width;
    }
    else
    {
      elementDragging.height = sizeStartOfDrag[1] + yDifference;
    }

    if(shapeToCheck instanceof Text)
    {
      // var input = document.getElementById(elementDragging.id);
      shapeToCheck.updateHtmlElement();
    }
    else if(shapeToCheck instanceof BuildImage)
    {
      shapeToCheck.updateHtmlElement();
    }

    draw();
  }
}


var activeInput;
window.onmouseup = function(e)
{
  setAllTextFocusable(true);
  if(isPlacingNewShape)
  {
    isPlacingNewShape = false;
    //only if dropped in work area
    // if(collides(e.pageX, e.pageY, 2, 2, workSpace)) //this works?
    if(collides(e.pageX, e.pageY, 2, 2, toolBarWidth, 0, canvasWidth-toolBarWidth, canvasHeight))
    {
      //create new div
      // if(elementDragging.id == 'divSquare')//tool id
      if(elementDragging.id.substring(0,3) == 'div')//tool id
      {
        // var droppedShape = new Shape('square', elementDragging.x,   elementDragging.y , elementDragging.width, elementDragging.height, elementDragging.color ,'square');
        //id should be 'square'+allElements.length, editable in text area
        var droppedShape;
        if(elementDragging.id == 'divCircle')
        {
          droppedShape = new Element('circle', elementDragging.x,   elementDragging.y+window.scrollY , 2*elementDragging.width, 2*elementDragging.height, elementDragging.colorIndex ,'circle');
         //
        }
        else
        {
          droppedShape = new Element('square', elementDragging.x,   elementDragging.y+window.scrollY , 2*elementDragging.width, 2*elementDragging.height, elementDragging.colorIndex ,'square');
        }
        allElements.push(droppedShape);
        // droppedShape.isFocus = true;
        focusedElement = droppedShape;
        selectedElements.push(droppedShape);
        showEditTools();
      }
      else if (elementDragging.id.charAt(0) == 'h' && elementDragging.type == null) //type == tool?
      {
        //needs to be extension of shape
        //should take font size for height and width
        // var newHeading = [elementDragging.x, elementDragging.y,  toolWidth*4,  toolWidth];
        var id = "heading" +(allElements.length);
        var newHeading = new Text(id, elementDragging.x, elementDragging.y+window.scrollY,  toolWidth*2,  0.04*canvasWidth, 'black', 'heading');
        // var newHeading = new Text(id, elementDragging.x, elementDragging.y+window.scrollY,  toolWidth*4,  toolWidth, 'black', 'heading');
        if(elementDragging.id.charAt(1) == '1')
        {
          newHeading.height = toolWidth*1.3;
          newHeading.updateHtmlElement();//position, size, color
        }
        // allHeadings.push(newHeading);
        allElements.push(newHeading);
        // var insertBeforeMe = document.querySelector("#colorInput");
        focusedElement = newHeading;
        selectedElements.push(newHeading);
        showEditTools();
        showTextTools();
      }
      else if (elementDragging.id.charAt(0) == 'p' && elementDragging.type == null)
      {
        var id = "paragraph" +(allElements.length);
        var newText = new Text(id, elementDragging.x, elementDragging.y,  toolWidth*4,  toolWidth, 'black', 'paragraph');
        // allHeadings.push(newHeading);
        allElements.push(newText);
        // var insertBeforeMe = document.querySelector("#colorInput");
        focusedElement = newText;
        selectedElements.push(newText);
      }
      else if (elementDragging.id == 'img' && elementDragging.type == null)
      {
        var id = "image" +(allElements.length);
        var newImage = new BuildImage(id, elementDragging.x, elementDragging.y,  toolWidth*2,  toolWidth*2, 'rgba(0,0,0,0.0)', 'paragraph');
        allElements.push(newImage);
        focusedElement = newImage;
        selectedElements.push(newImage);
        imageSelector.click();
        showEditTools();
      }

      elementDragging.x = startOfDrag[0];
      elementDragging.y = startOfDrag[1];
    }
    else
    {

    }

    if(focusedElement.x < toolBarWidth)
    {
      focusedElement.x = toolBarWidth;
    }
    // var droppedShape = new Shape('square'+allElements.length, e.pageX, e.pageY, elementDragging.width, elementDragging.height, elementDragging.color ,'square'));
    //could animate this back (grow another one on toolbar)

    //animate size from 0
  }
  else if(isMovingShape)
  {
    isMovingShape = false;
    if(elementDragging.x < toolBarWidth)
    {
      elementDragging.x = toolBarWidth;
    }
  }
  else if(isResizing)
  {
    isResizing = false;
    elementDragging.width = sizeStartOfDrag[0] + xDifference;
    if(shapeToCheck instanceof BuildImage)
    {
      let ratio = elementDragging.ratio;
      elementDragging.height = elementDragging.width/ratio;
      // elementDragging.height = sizeStartOfDrag[1] + yDifference;
    }
    else if(shapeToCheck.id == 'circle' && shiftHeld)
    {
      elementDragging.height = elementDragging.width;
    }
    else
    {
      elementDragging.height = sizeStartOfDrag[1] + yDifference;
    }

    //check not bigger than workspace
    if(elementDragging.width > canvasWidth - (2*toolBarWidth))
    {
      elementDragging.width = canvasWidth - (2*toolBarWidth);
    }
  }



  if(elementDragging instanceof Text
  || elementDragging instanceof BuildImage)
  {
    elementDragging.updateHtmlElement();
    elementDragging.htmlElement.focus();
  }
  else if(elementDragging.id == 'circle')
  {
    //dont auto center
  }
  else //only auto pos and center divs
  {
    if(elementDragging != null)
    {
      checkAutoPosition(elementDragging);
      checkAutoCenter(elementDragging);
    }
  }
  draw();
}

//prevents default page scrolling hotkeys
// toolCanvas.addEventListener("keydown", function(e) {
//     // space and arrow keys
//     if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
//         e.preventDefault();
//     }
// }, false);

window.onkeydown = function(e)
{
  if([37, 38, 39, 40].indexOf(e.keyCode) > -1)
  {
      e.preventDefault();
  }

  switch (e.keyCode) {
    case 46: //delete
      if(focusedElement instanceof Element
      && !(focusedElement instanceof Text))
      {
        allElements.splice(allElements.indexOf(focusedElement), 1);
        selectedElements.splice(allElements.indexOf(focusedElement), 1);
      }
      break;
    case 17: //control key
      controlHeld = true;
      break;
    case 16: //shift key
      shiftHeld = true;
      break;
    case 67: //C key
      copyFocusedElements();
      break;
    case 68: //D key
      //so doesnt trigger while typing in text area
      if(!(focusedElement instanceof Text))
      {
        placeDiv(mouseX, mouseY);
      }
      break;
    case 84: //T key
      if(!(focusedElement instanceof Text))
      {
        var id = "heading" +(allElements.length);
        //dummy object, bad hack
        elementDragging = new Object('h', 0, 0, toolWidth, toolWidth, 0);
        var newHeading = new Text(id, mouseX, mouseY,  toolWidth*2,  0.04*canvasWidth, 'black', 'heading');
        // newHeading.height = toolWidth*1.3;
        // allHeadings.push(newHeading);
        // var insertBeforeMe = document.querySelector("#colorInput");

        //delay to remove 'T' from hotkey press
        setTimeout(function()
        {
          focusedElement = newHeading;
          selectedElements = [];
          newHeading.htmlElement.value = '';
          selectedElements.push(newHeading);
          allElements.push(newHeading);
          newHeading.updateHtmlElement();//position, size, color
        }, 2);
      }
        break;

      //LURD = 0123
      case 37:
        nudgeElements(0);
        break;
      case 38:
        nudgeElements(1);
        break;
      case 39:
        nudgeElements(2);
        break;
      case 40:
        nudgeElements(3);
        break;

      //color hotkeys 1-5
      case 49:
        setColor(0);
        break;
      case 50:
        setColor(1);
        break;
      case 51:
        setColor(2);
        break;
      case 52:
        setColor(3);
        // setColor('white');
        break;
      case 53:
        setColor(4);
        // setColor('black');
        break;
      case 54:
        getNewColorTheme();
        break;
      case 189: //minus
      if(focusedElement != null)
      {
        sendToBack(focusedElement);
      }
      break;
      case 187: //plus
      if(focusedElement != null)
      {
        bringToFront(focusedElement);
      }
      break;
  }
  draw();
}

function sendToBack(element)
{
  allElements.unshift(element);
  allElements.splice(allElements.lastIndexOf(element), 1);
}

function bringToFront(element)
{
  allElements.push(element);
  allElements.splice(allElements.indexOf(element), 1);
}

window.onkeyup = function(e)
{
  switch (e.keyCode) {
    case 17: //control key
      controlHeld = false;
      break;
    case 16: //shift key
      shiftHeld = false;
      break;
  }
  draw();
}


function setColor(colorIndex)
{
  if(focusedElement instanceof Text)
  {
    focusedElement.colorIndex = colorIndex;
    focusedElement.fontColor = colors[colorIndex];
    focusedElement.updateHtmlElement();
  }
  else
  {
    focusedElement.colorIndex = colorIndex;
    focusedElement.refreshColor();
  }
}
//for movement with arrow keys
    //left up right down = 0 1 2 3
function nudgeElements(direction)
{
  let amount = 0.005*canvasWidth;
  if(direction == 0 || direction == 1)
  {
    amount *= -1;
  }
  //left right
  if(direction == 0 || direction == 2)
  {
    focusedElement.x += amount;
  }
  else //up down
  {
    focusedElement.y += amount;
  }

  if(focusedElement instanceof Text)
  {
    focusedElement.updateHtmlElement();
  }
}

//display all edit inputs, and update their values
function showEditTools()
{
  editToolsVisible = true;
  colorInput.style.opacity = 1.0;
  opacitySlider.style.opacity = 1.0;
  opacitySlider.value = focusedElement.opacity * 100;
}

function showTextTools()
{
  fontSizeInput.style.opacity = 1.0;
  textSliderVisible = true;
}

colorInput.addEventListener("keydown", function(event)
{
  if (event.keyCode === 13)//enter key
  {
    shapeColor = colorInput.value;
    // divSquare.color = shapeColor;
    // setColor(shapeColor);
    if(focusedElement instanceof Text)
    {
      focusedElement.fontColor = shapeColor;
      focusedElement.updateHtmlElement();
    }
    else
    {
      focusedElement.color = shapeColor;
    }

  }
});

fontSizeInput.oninput = function(event)
{

  let newSize = this.value/10;
  if(focusedElement instanceof Text) //not needed?
  {
    focusedElement.htmlElement.style.fontSize = newSize+'vw';
    focusedElement.height = newSize/100*canvasWidth;
    focusedElement.updateTextObject();
  }
  draw();
}

function placeDiv(x, y)
{
  var droppedShape = new Element('square', x-2.1*toolWidth,   y -2.1*toolWidth, 2*toolWidth, 2*toolWidth, 3,'square');
  // var droppedShape = new Element('square', x,   y , 2*toolWidth, 2*toolWidth, colors[0],'square');
  allElements.push(droppedShape);
  // droppedShape.isFocus = true;
  focusedElement = droppedShape;
  selectedElements = [];
  selectedElements.push(droppedShape);
}

function copyFocusedElements()
{
  if(controlHeld && focusedElement != null)
  {
    //need checks for each element type, text, image, div
      //if text, change .text/.value to match,

    //need check for multiple copy i.e. if selectedElements.length > 1
    clipboardItem =  new Element(focusedElement.id, focusedElement.x,   focusedElement.y , focusedElement.width, focusedElement.height, focusedElement.colorIndex ,'circle');
    clipboardItem.x += 0.03*canvasWidth;
    clipboardItem.y += 0.03*canvasWidth;
    clipboardItem.opacity = focusedElement.opacity;
    focusedElement.isFocus = false;
    focusedElement = clipboardItem;
    selectedElements = [];
    selectedElements[0] = focusedElement;
    clipboardItem.isFocus = true;
    allElements.push(clipboardItem);
  }
}

var imageSelector = document.getElementById('imageSelector');
imageSelector.addEventListener('change', imageSelect, false);
// imageSelector.change = function(e)
// {
//
// }

function imageSelect(e)
{
  var fr = new FileReader;
  var image = focusedElement.htmlElement;
  fr.onload = function()
  {
      var imgMeasure = new Image;

      imgMeasure.onload = function()
      {
        var ratio = imgMeasure.width/imgMeasure.height;
        focusedElement.ratio = ratio;
        if(imgMeasure.width > 0.8*(canvasWidth-2.2*toolBarWidth))
        {
          focusedElement.width = canvasWidth-2.4*toolBarWidth;
          focusedElement.height = focusedElement.width/ratio;
          focusedElement.x = 0;
        }
        else if(imgMeasure.height > 0.5*canvasHeight)
        {
          focusedElement.height = 0.4*canvasHeight;
          focusedElement.width = focusedElement.height*ratio;
        }
        else
        {
          focusedElement.width = imgMeasure.width;
          focusedElement.height = imgMeasure.height;
        }
        focusedElement.updateHtmlElement();
      };
      imgMeasure.src = fr.result;
      image.src = fr.result;

      focusedElement.src = fr.result;
      focusedElement.canvasImage.src = fr.result;
      setTimeout(draw, 1000);
  };
  fr.readAsDataURL(this.files[0]);

  // var file = e.target.files[0];
  // var img = new Image;
  // img.src = file.name;
  // var width = img.width;

}

function toggleColorModal()
{
  //set visible, set position based on activeElements color tab
}

//toggleModal = x,y,w,h, colors[]
//color = x,y,w,h, color, on hover change activeElement color, on click permanently

var testLabel = document.getElementById('test');
function setTestLabel(setTo)
{
  testLabel.innerHTML = setTo;
  // introTitle.innerHTML  = 'Race Mode';
}

opacitySlider.oninput = function()
{
  focusedElement.opacity = this.value*0.01;
  if(focusedElement instanceof Text)
  {
    focusedElement.htmlElement.style.opacity = focusedElement.opacity;
  }
  draw();
}


//_________________________________COLOR API_________________________________

function getNewColorTheme()
{
  var url = "http://colormind.io/api/";
  var data = {
  	model : "default"//,
  //	input : [[44,43,44],[90,83,82],"N","N","N"]
  }

  var http = new XMLHttpRequest();

  http.onreadystatechange = function() {
  	if(http.readyState == 4 && http.status == 200) {
  		var palette = JSON.parse(http.responseText).result;
      newColorTheme(palette);
  	}
  }

  http.open("POST", url, true);
  http.send(JSON.stringify(data));

  // [[42, 41, 48], [90, 83, 84], [191, 157, 175], [188, 138, 125], [215, 170, 66]]
  // note that the input colors have changed as well, by a small amount
}

function newColorTheme(palette)
{
  let colorJson = palette;
  colors[0] = 'rgb('+palette[0][0]+', '+palette[0][1]+', '+palette[0][2]+')';
  colors[1] = 'rgb('+palette[1][0]+', '+palette[1][1]+', '+palette[1][2]+')';
  colors[2] = 'rgb('+palette[2][0]+', '+palette[2][1]+', '+palette[2][2]+')';
  colors[3] = 'rgb('+palette[3][0]+', '+palette[3][1]+', '+palette[3][2]+')';
  colors[4] = 'rgb('+palette[4][0]+', '+palette[4][1]+', '+palette[4][2]+')';
  updateColors();

}
//change all elements and div tools to match new scheme
function updateColors()
{
  let colorIndex = 0;
  for(var i = 0; i < allTools.length; i++)
  {
    allTools[i].color = colors[colorIndex];
    colorIndex++;
    if(colorIndex > colors.length-1)
    {
      colorIndex = 0;
    }
  }
  for(var i=0; i<allElements.length; i++)
  {
    allElements[i].refreshColor();
  }
  draw();
}

let paletteY = 0.46*canvasHeight;
let colorHeight = 0.6*toolWidth;
let colorWidth = (1.08*toolBarWidth)/5;
function drawPalette()
{
  for(let i = 0; i < colors.length; i++)
  {
    ctxToolbar.fillStyle = colors[i];
    // ctxToolbar.fillRect(margin+i*colorWidth, canvasHeight/4, colorWidth, toolWidth);
    ctxToolbar.fillRect(editBar[0]+i*colorWidth, paletteY, colorWidth, colorHeight);
  }
}

function closeIntro()
{
  document.getElementById('introModal').style.display = 'none';
  document.getElementById('darkenBackground').style.display = 'none';
}
