(function(window){
    
    //笔刷对象
    var Brush = function (brushName, opt) {
        this.name           = brushName;
        this.width          = opt.width;
        this.height         = opt.height;
        this.maxSize        = opt.maxSize || opt.width;
        this.minSize        = opt.minSize || 0;
        this.brushImageName = opt.brushImageName || brushName;
        //this.image        = Resources.getImage('Brushes', this.brushImageName);
    }
    
    //绘制笔刷图片到屏幕上
    Brush.prototype.draw = function (ctx, pos, size) {
        ctx.drawImage(this.image,
            pos.x - (size/2),
            pos.y - (size/2),
            size,
            size);
    }
    
    
    //Brushs对象工厂，复杂笔刷的构建
    var Brushes = {
        Small: new Brush('Small', {
            width  : 90,
            height : 90,
            maxSize: 15,
            minSize: 3,
            brushImageName: 'Medium'
        })
        , Middle: new Brush('Middle', {
            width  : 90,
            height : 90,
            maxSize: 40,
            minSize: 3,
            brushImageName: 'Medium'
        })
        , Medium: new Brush('Medium', {
            width  : 90,
            height : 90,
            maxSize: 40,
            minSize: 3
        })
        , Large: new Brush('Large', {
            width  : 90,
            height : 90,
            maxSize: 60,
            minSize: 3,
            brushImageName: 'Medium'
        })
        , getBrush : function (brushName , color) {
            if (!this[brushName].image || color ) {
                this[brushName].image = Resources.getImage('Brushes', brushName , color);
            }
            return this[brushName];
        }
    }
    
    
    
    //笔刷资源管理器
    var Resources = {
        getCanvas : function(width , height){
            if(this.canvas) return this.canvas;
            this.canvas = document.createElement('canvas');
            this.canvas.width = width;
            this.canvas.height = height;
            return this.canvas;
        },
        
        //创建资源
        createImage: function (url , color) {
            var image = document.createElement('img');
            image.src = url;
            if(color) {
                var canvas = this.getCanvas(image.width, image.height), 
                    ctx = canvas.getContext('2d');  
                    ctx.drawImage(image , 0 , 0  , image.width, image.height),
                    imageData = ctx.getImageData(0, 0, image.width, image.height ),
                    newImageData = this.setColor(ctx , imageData , color);
                ctx.putImageData(newImageData , 0 , 0);
                image.src = canvas.toDataURL();
            }
            return image;
        } , 
        
        
        getImage: function (category, name , color) {
            return this.createImage(this[category][name] , color);
        } ,
        
        //修改图片的颜色
        setColor : function( ctx, imageData, color ){
            var w = imageData.width,
                h = imageData.height,
                ret = ctx.createImageData( w, h ),
                rgb = color.split(','),
                total = w * h * 4;
            for (var i=0; i<total; i +=4 ) {
                ret.data[i]  = rgb[0]; 
                ret.data[i+1]= rgb[1];
                ret.data[i+2]= rgb[2];
                ret.data[i+3]= imageData.data[ i + 3 ];
            }           
            return ret;
        }   
    } ;
    
    Resources.Brushes = {
        /*Small: Resources.createImage("img/a.png"),
        Medium : Resources.createImage("img/a.png"),
        Large : Resources.createImage("img/a.png")*/
        Small: "img/a.png",
        Medium : "img/a.png",
        Large : "img/a.png"
    }
 window.Brushes = Brushes ;
    return Brushes;
})(window)