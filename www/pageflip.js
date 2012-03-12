(function() {
 
     // 书的宽和高
     var BOOK_WIDTH = 1024;
     var BOOK_HEIGHT = 768;
     
     // 页的宽和高
     var PAGE_WIDTH = 1024;
     var PAGE_HEIGHT = 648;
 
     // 绘图板超出书页的大小，为了绘制立体效果，需要稍微大一些
     var CANVAS_PADDING = 50;

     Pageflip = function(o){
         this.init(o) ;
     };
 
    Pageflip.prototype.init = function(o){
 
        var canvas = this.canvas = document.getElementById( o.canvas );
        this.context = canvas.getContext( "2d" );
        
        this.flipstate = {
            // 当前翻到的状态(left -1 to right +1)
            progress: 1,
            // 最终要翻到的状态
            target: 1 ,
        } 

        //调整canvas到比书略大
        //canvas.width = BOOK_WIDTH + ( CANVAS_PADDING * 2 );
        canvas.width = BOOK_WIDTH ;
        canvas.height = BOOK_HEIGHT + ( CANVAS_PADDING * 2 );

        //Canvas要比书稍微大一点
        canvas.style.top = -CANVAS_PADDING + "px";
        //canvas.style.left = -CANVAS_PADDING + "px";
        canvas.style.left = "0px" ;
     };
  
     Pageflip.prototype.render = function( that , canvas , flipstate , callback) {
         var context = canvas.getContext("2d");
         context.clearRect( 0, 0, canvas.width, canvas.height );
         
         //绘制渐进效果
         flipstate.progress += ( flipstate.target - flipstate.progress ) * 0.2;        
         
         // 如果处在flipping状态，
         if( Math.abs( flipstate.progress ) < 0.97 ) {
             that.drawFlip( context ,flipstate );
         }else{
             clearInterval( window.pageinter );
             canvas.style.display = "none" ;
             if(callback != undefined)
                 callback();
         }
     
     };
 
 
     Pageflip.prototype.drawFlip = function(context , flip){
         // Strength是折叠的强度，强度越大，阴影越深，强度在折叠到中间的时候最深
         var strength = 1 - Math.abs( flip.progress );
 
         
         // 折叠区域的宽度
         var foldWidth = ( PAGE_WIDTH * 0.5 ) * ( 1 - flip.progress );
         
         // 折叠区域所在的X坐标位置
         var foldX = PAGE_WIDTH * flip.progress + foldWidth;
         
         // 折叠阴影最远在超出页面多少
         var verticalOutdent = 20 * strength;
         
         // 折叠阴影的最大宽度
         var paperShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( 1 - flip.progress, 0.5 ), 0 );
         var rightShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
         var leftShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
         
         
         // 跟着翻页一道改变低下元素的大小
         // flip.page.style.width = Math.max(foldX, 0) + "px";
         
         context.save();
         context.translate( 0 , CANVAS_PADDING );
         
         
         // Draw a sharp shadow on the left side of the page
         context.strokeStyle = 'rgba(0,0,0,'+(0.15 * strength)+')';
         context.lineWidth = 80 * strength;
         context.beginPath();
         context.moveTo(foldX - foldWidth, -verticalOutdent * 0.5);
         context.lineTo(foldX - foldWidth, PAGE_HEIGHT + (verticalOutdent * 0.5));
         context.stroke();
         
         
         // Right side drop shadow
         var rightShadowGradient = context.createLinearGradient(foldX, 0, foldX + rightShadowWidth, 0);
         rightShadowGradient.addColorStop(0, 'rgba(0,0,0,'+(strength*0.2)+')');
         rightShadowGradient.addColorStop(0.8, 'rgba(0,0,0,0.0)');
         
         context.fillStyle = rightShadowGradient;
         context.beginPath();
         context.moveTo(foldX, 0);
         context.lineTo(foldX + rightShadowWidth, 0);
         context.lineTo(foldX + rightShadowWidth, PAGE_HEIGHT);
         context.lineTo(foldX, PAGE_HEIGHT);
         context.fill();
         
         
         // Left side drop shadow
         var leftShadowGradient = context.createLinearGradient(foldX - foldWidth - leftShadowWidth, 0, foldX - foldWidth, 0);
         leftShadowGradient.addColorStop(0, 'rgba(0,0,0,0.0)');
         leftShadowGradient.addColorStop(1, 'rgba(0,0,0,'+(strength*0.15)+')');
         
         context.fillStyle = leftShadowGradient;
         context.beginPath();
         context.moveTo(foldX - foldWidth - leftShadowWidth, 0);
         context.lineTo(foldX - foldWidth, 0);
         context.lineTo(foldX - foldWidth, PAGE_HEIGHT);
         context.lineTo(foldX - foldWidth - leftShadowWidth, PAGE_HEIGHT);
         context.fill();
         
         
         // Gradient applied to the folded paper (highlights & shadows)
         var foldGradient = context.createLinearGradient(foldX - paperShadowWidth, 0, foldX, 0);
         foldGradient.addColorStop(0.35, '#fafafa');
         foldGradient.addColorStop(0.73, '#eeeeee');
         foldGradient.addColorStop(0.9, '#fafafa');
         foldGradient.addColorStop(1.0, '#e2e2e2');
         
         context.fillStyle = foldGradient;
         context.strokeStyle = 'rgba(0,0,0,0.06)';
         context.lineWidth = 0.5;
         
         // Draw the folded piece of paper
         context.beginPath();
         context.moveTo(foldX, 0);
         context.lineTo(foldX, PAGE_HEIGHT);
         context.quadraticCurveTo(foldX, PAGE_HEIGHT + (verticalOutdent * 2), foldX - foldWidth, PAGE_HEIGHT + verticalOutdent);
         context.lineTo(foldX - foldWidth, -verticalOutdent);
         context.quadraticCurveTo(foldX, -verticalOutdent * 2, foldX, 0);
         
         context.fill();
         context.stroke();
         
         
         context.restore();
     };
 
  
     Pageflip.prototype.fwd = function( callback ){
        this.canvas.style.display = "block" ;
        this.flipstate.target = -1 ;
        this.flipstate.progress = 1 ; 
        // 按时调用render函数，执行完成后清除
        window.pageinter = setInterval( this.render ,  1000 / 20 , this , this.canvas , this.flipstate , callback);
        //this.render();
     };

     Pageflip.prototype.bwd = function( callback ){
         this.canvas.style.display = "block" ;
         this.flipstate.target = 1 ;
         this.flipstate.progress = -1 ;   
         // 按时调用render函数，执行完成后清除
         window.pageinter = setInterval( this.render ,  1000 / 20 , this , this.canvas , this.flipstate , callback);
         //this.render();
     }; 
})();


