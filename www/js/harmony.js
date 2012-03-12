
(function(window,document,undefined){
 
 

    function ribbon( context )
    {
    	this.init( context );
    }

    ribbon.prototype =
    {
    	context: null,

    	mouseX: null, mouseY: null,

    	painters: null,

    	interval: null,

    	init: function( context )
    	{
    		this.context = context;
    		this.context.lineWidth = 5;
    		this.context.globalCompositeOperation = 'source-over';

    		this.mouseX = SCREEN_WIDTH / 2;
    		this.mouseY = SCREEN_HEIGHT / 2;

    		this.painters = new Array();

    		for (var i = 0; i < 50; i++)
    		{
    			this.painters.push({ dx: SCREEN_WIDTH / 2, dy: SCREEN_HEIGHT / 2, ax: 0, ay: 0, div: 0.1, ease: Math.random() * 0.2 + 0.6 });
    		}

    		this.isDrawing = false;

            //每秒60 frame,考虑到Pad的性能,可以适当减少
    		this.interval = setInterval( bargs( function( _this ) { _this.update(); return false; }, this ), 1000/60 );
    	},

    	destroy: function()
    	{
    		clearInterval(this.interval);
    	},

    	strokeStart: function( mouseX, mouseY )
    	{
    		this.mouseX = mouseX;
    		this.mouseY = mouseY

    		this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", 0.05 )";		

    		for (var i = 0; i < this.painters.length; i++)
    		{
    			this.painters[i].dx = mouseX;
    			this.painters[i].dy = mouseY;
    		}

    		this.shouldDraw = true;
    	},

    	stroke: function( mouseX, mouseY )
    	{
    		this.mouseX = mouseX;
    		this.mouseY = mouseY;
    	},

    	strokeEnd: function()
    	{

    	},

    	update: function()
    	{
    		var i;

    		for (i = 0; i < this.painters.length; i++)
    		{
    			this.context.beginPath();
    			this.context.moveTo(this.painters[i].dx, this.painters[i].dy);		

    			this.painters[i].dx -= this.painters[i].ax = (this.painters[i].ax + (this.painters[i].dx - this.mouseX) * this.painters[i].div) * this.painters[i].ease;
    			this.painters[i].dy -= this.painters[i].ay = (this.painters[i].ay + (this.painters[i].dy - this.mouseY) * this.painters[i].div) * this.painters[i].ease;
    			this.context.lineTo(this.painters[i].dx, this.painters[i].dy);
    			this.context.stroke();
    		}
    	}
    }

    function bargs( _fn )
    {
    	var n, args = [];
    	for( n = 1; n < arguments.length; n++ )
    		args.push( arguments[ n ] );
    	return function () { return _fn.apply( this, args ); };
    }


//================================= 
//Maobi效果
//=================================
 
    function maobi( context, canvas , options )
    {
    	this.init( context, canvas , options );
    }

    maobi.prototype =
    {

        // 创建函数
    	init: function( context , canvas, options)
    	{
            this.velocityPressureCoff = 5;
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.canvasContext = this.canvas.getContext('2d');
            
            this.brushOpacity = 1;
            this.bufferingSize = 4;
            this.strokeBuffer = [];
            this.splineBuffer = [];
            this.previousPosition = null;
            this.previousBrushSize = null;
            this.previousVelocity = 0;
            this.previousDistance = 0;
            this.expectedNextPosition = null;
            this.accelerate = 0;
            this.clear();
            
            //this.selectBrush(options.defaultBrush);
            this.selectBrush("Medium");
 
            var self = this;
            setTimeout(function(){
                    self.selectBrushColor(options.defaultBrushColor || '0,0,0');
            },1000);
 
    	},
 
        clear : function clear() {
            /// <summary>Clear Canvas</summary>
           this.canvasContext.clearRect(0, 0, this.width, this.height);
           
           /*this.compositedCanvasContext.save();
           //this.compositedCanvasContext.fillStyle = '#ffffff';
           //this.compositedCanvasContext.fillRect(0, 0, this.width, this.height);
           this.compositedCanvasContext.clearRect(0, 0, this.width, this.height);
           this.compositedCanvasContext.restore();*/
        },

 
        //设置笔刷的透明度
        setBrushOpacity : function (brushOpacity) {
            this.brushOpacity = brushOpacity;
            this.canvas.css('opacity', this.brushOpacity);
        },
        getBrushOpacity : function () {
            return this.brushOpacity;
        },
 
 
        //设置当前笔刷
        selectBrush : function (brushName , color) {
            this.currentBrush = Brushes.getBrush(brushName , color);
            this.currentBrushName = brushName;
            this.currentCorlor = color;
        },
        selectBrushColor : function (color) {
            this.currentBrush = Brushes.getBrush(this.currentBrushName , color);
            this.currentCorlor = color;
        },
        getCurrentBrush : function () {
            return this.currentBrush;
        },
 
        //销毁笔刷
    	destroy: function()
    	{
    		
    	},

    	strokeStart: function( mouseX, mouseY )
    	{
            this.strokeBuffer = [];
            this.splineBuffer = [];
            this.previousPosition = null;
            this.previousBrushSize = null;
            this.previousVelocity = 0;
            this.previousDistance = 0;
            this.expectedNextPosition = null;
            this.accelerate = 0;
            this.strokeBeginTime = new Date().valueOf();
            //console.log('beginStroke');
    	},
 
        // 增加一个点到待绘制队列中
        addStrokePosition : function (pos) {
            this.strokeBuffer.push(pos);
        },

    	stroke: function( mouseX, mouseY )
    	{
             var pos = { x: mouseX, y: mouseY, t: new Date().valueOf() - this.strokeBeginTime };
             this.addStrokePosition(pos);
             this.draw();
    	},

 
    	strokeEnd: function()
    	{
            if (this.accelerate > 1) {
                var pos = {
                    x: this.expectedNextPosition.x,
                    y: this.expectedNextPosition.y,
                    t: (this.accelerate/(this.previousDistance * this.previousVelocity)) + this.previousPosition.t
                };
                for (var i = 0, n = this.bufferingSize; i < n; i++) {
                    this.strokeBuffer.push(pos);
                }
                this.draw(true);
                //console.log('endStroke: this.previousVelocity=' + this.previousVelocity + ', this.previousDistance=' + this.previousDistance);
            }
            // 融合当前图层到背景上
            //this.compositeCanvas();
            //console.log('endStroke');
    	},
 
 
        //计算下一个位置？
         getInterlatePos : function (p0, p1, moveLen) {
            /// <summary></summary>
            /// <param name="p0">a source position</param>
            /// <param name="p1">a destination position</param>
            /// <param name="moveLen"></param>
            /// <return>Object</return>
            var x = p0.x + (p1.x - p0.x)*moveLen;
            var y = p0.y + (p1.y - p0.y)*moveLen;
            return { x:x, y:y };
        },
 
        // 计算两点的距离 p0 : source position  , p1: destination position
         getDistance : function (p0, p1) {
            var distance = ((p1.x - p0.x) * (p1.x - p0.x)) + ((p1.y - p0.y) * (p1.y - p0.y));
            return (distance == 0) ? distance : Math.sqrt(distance);
        },

        // ？？？？
        getBufferedCurrentPosition : function () {
            /// <summary></summary>
            /// <return>Object</return>
            var pos = { x: 0, y: 0, t: 0 };
            var bufferingSize = Math.min(this.bufferingSize, this.strokeBuffer.length);
            if (bufferingSize == 0) return null;
            for (var i = 1; i < bufferingSize+1; i++) {
                var p = this.strokeBuffer[this.strokeBuffer.length - i];
                pos.x += p.x;
                pos.y += p.y;
                pos.t += p.t;
            }
            pos.x /= bufferingSize; 
            pos.y /= bufferingSize; 
            pos.t /= bufferingSize;
            return pos;
        },
 
 
        //样条函数，在绘制样条图案中使用
         spline : function (x0, x1, v0, v1, t) {
            /// <summary>Spline function (A -> B -> C -> D)</summary>
            /// <param name="x0">point 1 (B)</param>
            /// <param name="x1">point 2 (C)</param>
            /// <param name="v0">velocity 1 (A -> C)</param>
            /// <param name="v1">velocity 2 (B -> D)</param>
            /// <param name="t"></param>
            /// <return>Number</return>
            return ((2*x0 - 2*x1 + v0 + v1) * Math.pow(t, 3)) + ((-3*x0 + 3*x1 - 2*v0 - v1) * Math.pow(t, 2)) + v0*t + x0;
        },
 
 
         //绘制笔刷到Canvas上
         draw : function (isEnding) {
            /// <summary>Draw stroke line.</summary>
            var pos = this.getBufferedCurrentPosition();
            if (pos == null) return;
            //console.log(pos);
            if (this.previousPosition == null)
                this.previousPosition = pos;
            // ---- stroke setup
            var t = (pos.t - this.previousPosition.t);
            var distance = this.getDistance(pos, this.previousPosition);
            var velocity = distance / Math.max(1, t);
            var accelerate = (this.previousVelocity == 0) ? 0 : velocity / this.previousVelocity;
            //var brushSize = this.currentBrush.maxSize - Math.min(this.currentBrush.maxSize - this.currentBrush.minSize, Math.max(0, velocity * 12));
            var curve = function(t, b, c, d) {
                return c*t/d + b;
            }
            var brushSize = Math.max(this.currentBrush.minSize,
                                     curve(velocity,
                                              this.currentBrush.maxSize,
                                              (-this.currentBrush.maxSize)-this.currentBrush.minSize,
                                              this.velocityPressureCoff
                                          )
                                    );
            //function __(i) { return i.toString().replace(/(\.\d{4})\d+/, '$1'); }
            //console.log('v='+ __(velocity) + "; d=" + __(distance) + "; a=" + __(accelerate) + "; bsize=" + __(brushSize) + ' / (' + __(pos.x) + ',' + __(pos.y) + ') t:' + __(t));
            //
            pos.s = brushSize;
            // ---- draw
            var ctx = this.canvasContext;
            ctx.save();
            this.drawStroke(ctx, this.previousPosition, pos, brushSize, distance, velocity);
            //this.drawStrokeSpline(ctx, this.previousPosition, pos, brushSize, distance, velocity);
            ctx.restore();
            // ----
            this.accelerate = accelerate;
            this.expectedNextPosition = this.getInterlatePos(this.previousPosition, pos, 1+this.accelerate);
        //    console.log('accelerate: '+this.accelerate);
        //    console.log('pos: '+pos.x+','+pos.y);
        //    console.log('expectedNextPosition: '+this.expectedNextPosition.x+','+this.expectedNextPosition.y);
            this.previousPosition = pos;
            this.previousBrushSize = brushSize;
            this.previousVelocity = velocity;
            this.previousDistance = distance;
        },
 
 
         drawStroke : function (ctx, startPos, endPos, brushSize, distance, velocity) {
            //ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            var t = 0;
            var delta = distance/1;
            var brushDelta = (brushSize - this.previousBrushSize);
            var r = Math.PI * 2;
            var rad = Math.atan2(endPos[1] - startPos[1], endPos[0] - startPos[0]);
            var k = Math.random() * 1;
            while (t < 1) {
                var brushSizeCur = this.previousBrushSize + (brushDelta * t);
                
                var pos = this.getInterlatePos(startPos, endPos, t);
                if (Math.random() > 0.2) {
                    var jitter = ((Math.random() > 0.5) ? 1 : -1) * parseInt(Math.random() * 1.2, 10);
                    var px = pos.x - brushSizeCur/2+jitter;
                    var py = pos.y - brushSizeCur/2+jitter;
                    //for (var i = 0, n = 15; i < n; i++) {
                        //ctx.drawImage(this.currentBrush.kasureImage, px, py, brushSizeCur, brushSizeCur);
                        //ctx.drawImage(this.currentBrush.kasureImage, px, py , brushSizeCur, brushSizeCur);
                        ctx.drawImage(this.currentBrush.image, px, py , brushSizeCur, brushSizeCur);
                    //}
                }
        //        if (this.previousBrushSize == brushSizeCur || (brushSizeCur < 1)) {
        //            if (brushSizeCur != this.currentBrush.maxSize && velocity > 2) {
        //                if (velocity > 4) {
        //                    ctx.fillStyle = 'rgba(100, 0, 0, 0.1)';
        //                    //ctx.arc(-brushSizeCur/2+k, -brushSizeCur/2+k, brushSizeCur, r, 0, true);
        //                    ctx.drawImage(this.currentBrush.kasureImage3, -brushSizeCur/2+k, -brushSizeCur/2+k, brushSizeCur, brushSizeCur);
        //                } else if (velocity > 3) {
        //                    ctx.fillStyle = 'rgba(100, 0, 0, 0.2)';
        //                    //ctx.arc(-brushSizeCur/2+k, -brushSizeCur/2+k, brushSizeCur, r, 0, true);
        //                    ctx.drawImage(this.currentBrush.kasureImage2, -brushSizeCur/2+k, -brushSizeCur/2+k, brushSizeCur, brushSizeCur);
        //                } else {
        //                    ctx.fillStyle = 'rgba(100, 0, 0, 0.3)';
        //                    //ctx.arc(-brushSizeCur/2+k, -brushSizeCur/2+k, brushSizeCur, r, 0, true);
        //                    ctx.drawImage(this.currentBrush.kasureImage, -brushSizeCur/2+k, -brushSizeCur/2+k, brushSizeCur, brushSizeCur);
        //                }
        //            } else {
        //                ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        //                //ctx.arc(-brushSizeCur/2+k, -brushSizeCur/2+k, brushSizeCur, r, 0, true);
        //                ctx.drawImage(this.currentBrush.image, -brushSizeCur/2, -brushSizeCur/2, brushSizeCur, brushSizeCur);
        //            }
        //        ctx.fill();
        //        ctx.restore();
                t += 1 / distance;
            }
        },
 
 
 
        drawStrokeSpline : function (ctx, startPos, endPos, brushSize, distance, velocity) {
            /// <summary>Draw stroke line (Spline).</summary>
            this.splineBuffer.push(endPos);
            // Draw Stroke part (Spline)
            if (this.splineBuffer.length > 3) {
                var segCount = 40; // spline
                var buffLen = this.splineBuffer.length;
                var points = Array.apply(null, this.splineBuffer);
                points = points.slice(points.length-4);
                points.unshift(points[0]);
                points.push(points[points.length-1]);
                //console.log(points.map(function(e){ return e.x+"," +e.y;}).join('; '));
                for (var j = 0, m = points.length-3; j < m; j++) {
                    var p0 = points[j];
                    var p1 = points[j+1];
                    var p2 = points[j+2];
                    var p3 = points[j+3];
                    var v0 = { x: (p2.x - p0.x) / 2, y: (p2.y - p0.y) / 2, s: (p2.s - p0.s) };
                    var v1 = { x: (p3.x - p1.x) / 2, y: (p3.y - p1.y) / 2, s: (p3.s - p1.s) };
                    var tmp1 = (2*p1.x - 2*p2.x + v0.x + v1.x);
                    var tmp2 = (-3*p1.x + 3*p2.x - 2*v0.x - v1.x);
                    var tmp3 = (2*p1.y - 2*p2.y + v0.y + v1.y);
                    var tmp4 = (-3*p1.y + 3*p2.y - 2*v0.y - v1.y);
                    for (var i = 1, n = segCount+1; i <= n; i++) {
                        var seg = i/segCount;
                        
                        // Method Inlining --
                        // function spline() {
                        //     return ((2*x0 - 2*x1 + v0 + v1) * Math.pow(t, 3)) + ((-3*x0 + 3*x1 - 2*v0 - v1) * Math.pow(t, 2)) + v0*t + x0;
                        // }
                        // var tX = this.spline(p1.x, p2.x, v0.x, v1.x, seg);
                        // var tY = this.spline(p1.y, p2.y, v0.y, v1.y, seg);
                        var tX = (tmp1 * Math.pow(seg, 3)) + (tmp2 * Math.pow(seg, 2)) + v0.x*seg + p1.x;
                        var tY = (tmp3 * Math.pow(seg, 3)) + (tmp4 * Math.pow(seg, 2)) + v0.y*seg + p1.y;
         
                        //var tS = this.spline(p1.s, p2.s, v0.s, v1.s, seg);
                        var tS = this.previousBrushSize + ((brushSize - this.previousBrushSize) / segCount)*i;
                    
                        if (this.previousBrushSize == brushSize && Math.random() < 0.3)
                            continue;
                        ctx.drawImage(this.currentBrush.image,
                              tX - (tS/2),
                              tY - (tS/2),
                              tS,
                              tS);
            //            if (Math.random() > 0.6) {
            //                ctx.drawImage(this.currentBrush.image,
            //                      tX + (Math.random() * 0) - (brushSize/2),
            //                      tY + (Math.random() * 0) - (brushSize/2),
            //                      brushSize,
            //                      brushSize);
            //            }
                    }
                }
            }
        }
 

 
 
    };


    var i, brush, BRUSHES = ["ribbon","maobi"],
    COLOR = [0, 0, 0], BACKGROUND_COLOR = [250, 250, 250],
    SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    PAD_WIDTH = 1024 ,
    PAD_HEIGHT = 649 ,
    PADDING = 100 ,
    container, foregroundColorSelector, backgroundColorSelector, menu,
    canvas, context,
    isForegroundColorSelectorVisible = false, isBackgroundColorSelectorVisible = false, 
    isMenuMouseOver = false, shiftKeyIsDown = false, altKeyIsDown = false;

    


    window.harmony = function init()
    {
        var hash, palette;
        
        //document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';

        container = document.createElement('div');
        container.style.background = "url('img/bg.jpg') no-repeat left top" ;
        container.style.padding = "100px" ;
        container.width = SCREEN_WIDTH;
        container.height = SCREEN_HEIGHT;

        document.body.appendChild(container);
 
        
        canvas = document.createElement("canvas");
        canvas.width = PAD_WIDTH - (PADDING * 2);
        canvas.height = PAD_HEIGHT - (PADDING * 2) ;
        canvas.style.cursor = 'crosshair';
        container.appendChild(canvas);
        
        if (!canvas.getContext) return;
        
        context = canvas.getContext("2d");
        context.translate( -PADDING , -PADDING );
        context.lineJoin = "round";
        context.lineCap = "round" ;
        

        if (!brush)
        {
            //brush = new ribbon(context);
            brush = new maobi(context, canvas, {});
        }
        
        canvas.addEventListener('touchstart', onCanvasTouchStart, false);
    }



    // COLOR SELECTORS

    function setForegroundColor( x, y )
    {
        foregroundColorSelector.update( x, y );
        COLOR = foregroundColorSelector.getColor();
        menu.setForegroundColor( COLOR );	
    }

    function onForegroundColorSelectorMouseDown( event )
    {
        window.addEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
        window.addEventListener('mouseup', onForegroundColorSelectorMouseUp, false);
        
        setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );	
    }

    function onForegroundColorSelectorMouseMove( event )
    {
        setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );
    }

    function onForegroundColorSelectorMouseUp( event )
    {
        window.removeEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
        window.removeEventListener('mouseup', onForegroundColorSelectorMouseUp, false);

        setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );
    }

    function onForegroundColorSelectorTouchStart( event )
    {
        if(event.touches.length == 1)
        {
            event.preventDefault();
            
            setForegroundColor( event.touches[0].pageX - foregroundColorSelector.container.offsetLeft, event.touches[0].pageY - foregroundColorSelector.container.offsetTop );
            
            window.addEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
            window.addEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
        }
    }

    function onForegroundColorSelectorTouchMove( event )
    {
        if(event.touches.length == 1)
        {
            event.preventDefault();
            
            setForegroundColor( event.touches[0].pageX - foregroundColorSelector.container.offsetLeft, event.touches[0].pageY - foregroundColorSelector.container.offsetTop );
        }
    }

    function onForegroundColorSelectorTouchEnd( event )
    {
        if(event.touches.length == 0)
        {
            event.preventDefault();
            
            window.removeEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
            window.removeEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
        }	
    }


    //

    function setBackgroundColor( x, y )
    {
        backgroundColorSelector.update( x, y );
        BACKGROUND_COLOR = backgroundColorSelector.getColor();
        menu.setBackgroundColor( BACKGROUND_COLOR );
        
        document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';	
    }

    function onBackgroundColorSelectorMouseDown( event )
    {
        window.addEventListener('mousemove', onBackgroundColorSelectorMouseMove, false);
        window.addEventListener('mouseup', onBackgroundColorSelectorMouseUp, false);
    }

    function onBackgroundColorSelectorMouseMove( event )
    {
        setBackgroundColor( event.clientX - backgroundColorSelector.container.offsetLeft, event.clientY - backgroundColorSelector.container.offsetTop );
    }

    function onBackgroundColorSelectorMouseUp( event )
    {
        window.removeEventListener('mousemove', onBackgroundColorSelectorMouseMove, false);
        window.removeEventListener('mouseup', onBackgroundColorSelectorMouseUp, false);
        
        setBackgroundColor( event.clientX - backgroundColorSelector.container.offsetLeft, event.clientY - backgroundColorSelector.container.offsetTop );
    }


    function onBackgroundColorSelectorTouchStart( event )
    {
        if(event.touches.length == 1)
        {
            event.preventDefault();
            
            setBackgroundColor( event.touches[0].pageX - backgroundColorSelector.container.offsetLeft, event.touches[0].pageY - backgroundColorSelector.container.offsetTop );
            
            window.addEventListener('touchmove', onBackgroundColorSelectorTouchMove, false);
            window.addEventListener('touchend', onBackgroundColorSelectorTouchEnd, false);
        }
    }

    function onBackgroundColorSelectorTouchMove( event )
    {
        if(event.touches.length == 1)
        {
            event.preventDefault();
            
            setBackgroundColor( event.touches[0].pageX - backgroundColorSelector.container.offsetLeft, event.touches[0].pageY - backgroundColorSelector.container.offsetTop );
        }
    }

    function onBackgroundColorSelectorTouchEnd( event )
    {
        if(event.touches.length == 0)
        {
            event.preventDefault();
            
            window.removeEventListener('touchmove', onBackgroundColorSelectorTouchMove, false);
            window.removeEventListener('touchend', onBackgroundColorSelectorTouchEnd, false);
        }	
    }


    // MENU

    function onMenuForegroundColor()
    {
        cleanPopUps();
        
        foregroundColorSelector.show();
        foregroundColorSelector.container.style.left = ((SCREEN_WIDTH - foregroundColorSelector.container.offsetWidth) / 2) + 'px';
        foregroundColorSelector.container.style.top = ((SCREEN_HEIGHT - foregroundColorSelector.container.offsetHeight) / 2) + 'px';

        isForegroundColorSelectorVisible = true;
    }

    function onMenuBackgroundColor()
    {
        cleanPopUps();

        backgroundColorSelector.show();
        backgroundColorSelector.container.style.left = ((SCREEN_WIDTH - backgroundColorSelector.container.offsetWidth) / 2) + 'px';
        backgroundColorSelector.container.style.top = ((SCREEN_HEIGHT - backgroundColorSelector.container.offsetHeight) / 2) + 'px';

        isBackgroundColorSelectorVisible = true;
    }

    function onMenuSelectorChange()
    {
        if (BRUSHES[menu.selector.selectedIndex] == "")
            return;

        brush.destroy();
        brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");

        window.location.hash = BRUSHES[menu.selector.selectedIndex];
    }

    function onMenuMouseOver()
    {
        isMenuMouseOver = true;
    }

    function onMenuMouseOut()
    {
        isMenuMouseOver = false;
    }


    function onMenuClear()
    {
        context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        brush.destroy();
        brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");
    }



    // CANVAS
    function onCanvasTouchStart( event )
    {
        cleanPopUps();		

        if(event.touches.length == 1)
        {
            event.preventDefault();
            
            console.dir(event );
            brush.strokeStart( event.touches[0].clientX, event.touches[0].clientY );
            
            window.addEventListener('touchmove', onCanvasTouchMove, false);
            window.addEventListener('touchend', onCanvasTouchEnd, false);
        }
    }

    function onCanvasTouchMove( event )
    {
        if(event.touches.length == 1)
        {
            event.preventDefault();
            brush.stroke( event.touches[0].pageX, event.touches[0].pageY );
        }
    }

    function onCanvasTouchEnd( event )
    {
        if(event.touches.length == 0)
        {
            event.preventDefault();
            
            brush.strokeEnd();

            window.removeEventListener('touchmove', onCanvasTouchMove, false);
            window.removeEventListener('touchend', onCanvasTouchEnd, false);
        }
    }

    //

    function cleanPopUps()
    {
        if (isForegroundColorSelectorVisible)
        {
            foregroundColorSelector.hide();
            isForegroundColorSelectorVisible = false;
        }
            
        if (isBackgroundColorSelectorVisible)
        {
            backgroundColorSelector.hide();
            isBackgroundColorSelectorVisible = false;
        }
        
    }

 
   // =======================================
   // 下面是一些还没有实现的绘图功能
   //========================================
   /**
    hamony.prototype.toDataURL = function toDataURL(withoutBack) {
        /// <summary>Get Image data URI</summary>
        this.compositeCanvas();
        return this.getImage(withoutBack).toDataURL();
    }
    
    hamony.prototype.clear = function clear() {
        /// <summary>Clear Canvas</summary>
       this.canvasContext.clearRect(0, 0, this.width, this.height);
       
       this.compositedCanvasContext.save();
       //this.compositedCanvasContext.fillStyle = '#ffffff';
       //this.compositedCanvasContext.fillRect(0, 0, this.width, this.height);
       this.compositedCanvasContext.clearRect(0, 0, this.width, this.height);
       this.compositedCanvasContext.restore();
    }
    
 
   hamony.prototype.createBrushWithOpacity = function (brushName, brushOpacity) {
        /// <summary>Create a brush.</summary>
        var newBrush = Brushes.getBrush(brushName);
        var tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = newBrush.width;
        tmpCanvas.height = newBrush.height;
        var ctx = tmpCanvas.getContext('2d');
        ctx.drawImage(newBrush.kasureImage, 0, 0);
        var imageData = ctx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
        for (var i = 0, n = imageData.data.length / 4; i < n; i++) {
            for (var j = 0, m = 3; j < m; j++) {
                imageData.data[i * 4 + j] = Math.min(255, Math.max(0, imageData.data[i * 4 + j] - ((imageData.data[i * 4 + j] - 255) * (1 - brushOpacity))));
            }
            //newImageData.data[i * 4 + 3] = Math.min(255, Math.max(0, imageData.data[i * 4 + 3] * brushOpacity)); // alpha
        }
        ctx.putImageData(imageData, 0, 0);
        var img = document.createElement('img');
        img.src = tmpCanvas.toDataURL();
        this.currentBrush = newBrush;
        this.currentBrushKasureImage = img;
    }
    StrokeEngine.prototype.getImage = function (withoutBackground) {
        /// <summary>Get a completion image</summary>
        
        if (withoutBackground)
            return this.compositedCanvas;
        // create background canvas
        var tmpCanvas = document.createElement('canvas');
        
        if(this.width==798){
            tmpCanvas.width = this.width;
            tmpCanvas.height = this.height;
        } else {
            tmpCanvas.width = 1024;
            tmpCanvas.height = 768;
        }
        
        var ctx = tmpCanvas.getContext('2d');
        // set background
        if (this.backgroundImage) {
            if(this.width==798)
                ctx.drawImage(this.backgroundImage[0], 0, 0 , this.width ,  this.height);
            else
                 ctx.drawImage(this.backgroundImage[0], 0, 0 , 1024 ,  768);
        } else {
            ctx.fillStyle = 'rgba(255,255,255,1)';
            ctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        }
        // draw composited canvas
        if(this.width==798)
            ctx.drawImage(this.compositedCanvas, 0, 0);
        else
            ctx.drawImage(this.compositedCanvas,  162, 110);
        return tmpCanvas;
    }
    
    StrokeEngine.prototype.compositeCanvas = function () {
        // copy to Background
        var tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = this.width;
        tmpCanvas.height = this.height;
        // WORKAROUND: IE9
        tmpCanvas.getContext('2d').fillRect(0, 0, 0, 0);
        this.canvas.get(0).getContext('2d').fillRect(0, 0, 0, 0);
        // writeCanvas -(w/alpha)-> tmpCanvas
        var tmpCtx = tmpCanvas.getContext('2d');
        tmpCtx.globalAlpha = this.brushOpacity;
        tmpCtx.drawImage(this.canvas.get(0), 0, 0);
        // tmpCanvas -> compositedCanvas
        this.compositedCanvasContext.drawImage(tmpCanvas, 0, 0);
        // clear writeCanvas
        this.canvasContext.clearRect(0, 0, this.width, this.height);
    }*/
   //=================================================================

})(this,this.document);


