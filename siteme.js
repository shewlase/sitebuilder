
var canvas = document.getElementById("canvas");
var toolCanvas = document.getElementById("toolBar");
var ctx = canvas.getContext("2d");
var ctxToolbar = toolCanvas.getContext("2d");
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight*2;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
var toolBarWidth = 0.1*canvasWidth;
toolCanvas.width = canvasWidth;
toolCanvas.height = canvasHeight;
var toolBar = [0,0, toolBarWidth, canvasHeight];
var toolWidth = 0.33*toolBarWidth;
var workSpace = [toolBarWidth, 0, canvasWidth-toolBarWidth, canvasHeight];
var workSpaceCenterX = workSpace[0]+0.5*workSpace[2];
var dragTabSize = 0.5*toolWidth;
var dragTabColor = 'gray';
// var toolBar = [0,0, 100, 100];
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
// var divSquare = [20, 20, 10, 10];

class Object
{
  constructor(id, x, y, width, height, color)
  {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.opacity = 1.0;
  }

  draw(ctx)
  {
    this.drawWholeArea(ctx);
    // if(this.id == 'h1')//should jus tbe first letter H or p
    //for tools

    if(this.id.charAt(0) == 'h' || this.id.charAt(0) == 'p')//should jus tbe first letter H or p
    {
      ctx.font = toolBarWidth/4+'px Luckiest Guy';
      // context.font = 0.5*bubbleHeight+'px Righteous';
      // var wordWidth = context.measureText(this.messageToSend).width;
      ctx.fillStyle='black';
      // ctx.fillText(messageToSend, bubbleX+(0.25*width), bubbleY+(0.75*height));
      ctx.fillText(this.id, this.x+0.1*this.width, this.y+0.8*this.height);
    }

  }

  drawWholeArea(ctx)
  {
    ctx.fillStyle= this.color;
    // if(this.id == 'divCircle')
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

class Element extends Object
{
  constructor(id, x, y, width, height, color, type)
  {
    super(id, x, y, width, height, color);
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
    if(elementDragging.id == 'h1')
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
          // focusedElement.htmlElement.style.backgroundColor = 'transparent';
        }
        // elementDragging.isFocus = false;
      }
      var thisInput = event.target;
      // thisInput.style.backgroundColor = 'white';
      var idToCheck = thisInput.id;
      if(idToCheck.charAt(0) == 'h')
      {
        var index = parseInt(idToCheck.substring(7), 10);
      }
      else if(idToCheck.charAt(0) == 'p')
      {
        var index = parseInt(idToCheck.substring(9), 10);
      }
      //7 for heading

      var element = allElements[index];
      // var element = getElementObject();
      element.isFocus = true;
      focusedElement = element;
    }


    activeInput.onkeypress = function(event)
    {
      var thisInput = event.target;
      var fontSize = window.getComputedStyle(thisInput).getPropertyValue('font-size');
      ctx.font = fontSize+' Luckiest Guy';
      var wordWidth = 100+ctx.measureText(thisInput.value).width;
      var thisInput = event.target;
      var idToCheck = thisInput.id;
      if(idToCheck.charAt(0) == 'h')
      {
        var index = parseInt(idToCheck.substring(7), 10);
        thisInput.style.width = wordWidth+'px';
        var element = allElements[index];
        element.width = wordWidth;
      }
      else if(idToCheck.charAt(0) == 'p')
      {
        var index = parseInt(idToCheck.substring(9), 10);
        var element = allElements[index];
      }
      //7 for heading

    }
    document.getElementsByTagName('body')[0].insertBefore(activeInput, colorInput);
    activeInput.focus();
  }
  draw(ctx)
  {
    if(this.isFocus)
    {
      //white when editing text, transparent when not
      this.color = 'rgba(255,255,255,0.5)';
      // this.drawAllTabs(ctx);
    }
    else
    {
      // this.color = 'rgba(255,255,0)';
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
  constructor(id, x, y, width, height, color, type)
  {
    super(id, x, y, width, height, color, type);
    // this.source = 'grenade.jpg';
    var newHtmlImage = document.createElement('img');
    this.htmlElement = newHtmlImage;
    this.htmlElement.id = this.id;
    this.ratio = 1;

    this.src = '';
    this.canvasImage = new Image();
    this.canvasImage.src = this.src;

    // this.htmlElement.src = this.source;
    // document.getElementsByTagName('body')[0].insertBefore(newHtmlImage, colorInput);
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

var colors;
init();

function init()
{
  allElements = [];
  allText = [];
  allTools = [];
  selectedElements = [];
  var margin = toolWidth/3;
  // colors = ['#C7DFC5','#C1DBE3', '#373737'];
  // colors = ['#420039','#932F6D', '#DCCCFF'];
  // colors = ['#2E86AB','#F5F749', '#F24236'];
  //blue, yellow orange
  colors = ['#2176AE','#FBB13C', '#FE6847'];
  // colors = ['#F4C95D','#DD7230', '#854D27'];
  //postions need calculating, i*margin, if i%2==0 add top margin etc)
  divSquare = new Object('divSquare',margin, margin, toolWidth, toolWidth, colors[0]);
  divSquare2 = new Object('divSquare', 2*margin+toolWidth, margin, toolWidth, toolWidth, colors[1]);
  divSquare3 = new Object('divSquare', margin, 2*margin+toolWidth, toolWidth, toolWidth, colors[2]);
  divSquare4 = new Object('divCircle', 2*margin+toolWidth, 2*margin+toolWidth, toolWidth, toolWidth, 'white');
  toolHeading = new Object('h1', margin, 3*margin+2*toolWidth, toolWidth, toolWidth, colors[0]);
  toolHeading2 = new Object('h2', 2*margin+toolWidth, 3*margin+2*toolWidth, toolWidth, toolWidth, colors[1]);
  toolParagraph = new Object('p', margin, 4*margin+3*toolWidth, toolWidth, toolWidth, colors[2]);
  toolImage = new Object('img', margin, 5*margin+4*toolWidth, toolWidth, toolWidth, colors[0]);

  allTools.push(divSquare);
  allTools.push(divSquare2);
  allTools.push(divSquare3);
  allTools.push(divSquare4);
  allTools.push(toolHeading);
  allTools.push(toolHeading2);
  allTools.push(toolParagraph);
  allTools.push(toolImage);

  colorInput = document.getElementById("colorInput");
  fontSizeInput = document.getElementById("fontSizeInput");
  opacitySlider = document.getElementById("opacitySlider");
  animate();
  // draw();
}

function drawToolbar(ctx)
{
  ctx.fillStyle='lightgray';
  // ctx.fillStyle='#F6FEAA';
  // ctx.fillRect(0,0,toolBarWidth,canvasHeight);
  ctx.fillRect(toolBar[0], toolBar[1], toolBar[2], toolBar[3]);
  for(var i = 0; i < allTools.length; i++)
  {
    allTools[i].draw(ctx);
  }
  // divSquare.draw(ctx);
  // ctx.fillRect(20, 20, 150, 100);
}

//dont need this? just draw when changed or have shouldAnimate variable
function animate()
{
	requestAnimationFrame(animate);
  draw();
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
  // for(var i=0; i<allElements.length; i++)
  // {
  //   if(allElements[i].isFocus)
  //   {
  //     allElements[i].drawAllTabs(ctx);
  //   }
  // }
  for(var i=0; i<selectedElements.length; i++)
  {
      selectedElements[i].drawAllTabs(ctx);
  }
  // for(var i=0; i<allHeadings.length; i++)
  // {
  //     heading = allHeadings[i];
  //     if(heading.isFocus)
  //     {
  //       ctx.fillStyle= dragTabColor;
  //       ctx.fillRect(heading.x+heading.width, heading.y+heading.height, dragTabSize, dragTabSize);
  //     }
  // }
  drawToolbar(ctxToolbar);//all tools
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
          element.y = previousEl.y+previousEl.height;
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
  {
    elementDragging.x = workSpaceCenterX - 0.5*elementDragging.width;
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
      opacitySlider.value = focusedElement.opacity * 100;

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
  if(collides(e.pageX, e.pageY, 5, 5, 0, 0, toolBarWidth, canvasHeight))
  {
    nothingClicked = false;
  }

  if(nothingClicked)
  {
    selectedElements = [];
    if(focusedElement != null)
    {
      focusedElement.isFocus = false;
      // elementDragging.isFocus = false;
    }
    focusedElement = null;
  }
  // setTestLabel(e.pageX +'y'+ e.pageY +'vs'+ divSquare.x +'y'+ divSquare.y,);
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
          droppedShape = new Element('circle', elementDragging.x,   elementDragging.y+window.scrollY , 2*elementDragging.width, 2*elementDragging.height, elementDragging.color ,'circle');
         //
        }
        else
        {
          droppedShape = new Element('square', elementDragging.x,   elementDragging.y+window.scrollY , 2*elementDragging.width, 2*elementDragging.height, elementDragging.color ,'square');
        }
        allElements.push(droppedShape);
        // droppedShape.isFocus = true;
        focusedElement = droppedShape;
        selectedElements.push(droppedShape);
      }
      else if (elementDragging.id.charAt(0) == 'h' && elementDragging.type == null) //type == tool?
      {
        //needs to be extension of shape
        //should take font size for height and width
        // var newHeading = [elementDragging.x, elementDragging.y,  toolWidth*4,  toolWidth];
        var id = "heading" +(allElements.length);
        var newHeading = new Text(id, elementDragging.x, elementDragging.y,  toolWidth*4,  toolWidth, 'black', 'heading');
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
        var newImage = new BuildImage(id, elementDragging.x, elementDragging.y,  toolWidth*4,  toolWidth*4, 'rgba(0,0,0,0.0)', 'paragraph');
        allElements.push(newImage);
        focusedElement = newImage;
        selectedElements.push(newImage);
        imageSelector.click();
      }

      elementDragging.x = startOfDrag[0];
      elementDragging.y = startOfDrag[1];
    }
    else
    {

    }
    // var droppedShape = new Shape('square'+allElements.length, e.pageX, e.pageY, elementDragging.width, elementDragging.height, elementDragging.color ,'square'));
    //could animate this back (grow another one on toolbar)

    //animate size from 0
  }
  else if(isMovingShape)
  {
    isMovingShape = false;
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
  }



  if(elementDragging instanceof Text
  || elementDragging instanceof BuildImage)
  {
    elementDragging.updateHtmlElement();
    elementDragging.htmlElement.focus();
  }
  else //only auto pos and center divs
  {
    if(elementDragging != null)
    {
      checkAutoPosition(elementDragging);
      checkAutoCenter(elementDragging);
    }
  }
}

window.onkeydown = function(e)
{
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
      elementDragging = new Object('h1', 0, 0, toolWidth, toolWidth, colors[0]);
      var newHeading = new Text(id, mouseX, mouseY,  toolWidth*4,  toolWidth, 'black', 'heading');
        newHeading.height = toolWidth*1.3;
        newHeading.updateHtmlElement();//position, size, color

      // allHeadings.push(newHeading);
      allElements.push(newHeading);
      // var insertBeforeMe = document.querySelector("#colorInput");
      focusedElement = newHeading;
      selectedElements.push(newHeading);
      break;
    }
  }
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
}

colorInput.addEventListener("keydown", function(event)
{
  if (event.keyCode === 13)//enter key
  {
    shapeColor = colorInput.value;
    // divSquare.color = shapeColor;
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

fontSizeInput.onkeydown = function(event)
{
  if (event.keyCode === 13)//enter key
  {
    var size = fontSizeInput.value;
    if(focusedElement instanceof Text)
    {
      focusedElement.htmlElement.style.fontSize = size+'vw';
      //need update element size afterwards

      // focusedElement.updateHtmlElement();
    }
  }
}

function placeDiv(x, y)
{
  var droppedShape = new Element('square', x-2.1*toolWidth,   y -2.1*toolWidth, 2*toolWidth, 2*toolWidth, colors[0],'square');
  // var droppedShape = new Element('square', x,   y , 2*toolWidth, 2*toolWidth, colors[0],'square');
  allElements.push(droppedShape);
  // droppedShape.isFocus = true;
  focusedElement = droppedShape;
  selectedElements = [];
  selectedElements.push(droppedShape);
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
        if(imgMeasure.width > canvasWidth-toolBarWidth)
        {
          focusedElement.width = canvasWidth-toolBarWidth;
          focusedElement.height = focusedElement.width/ratio;
        }
        else if(imgMeasure.height > canvasHeight)
        {
          focusedElement.height = 0.8*canvasHeight;
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
}
