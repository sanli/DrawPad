redirectMouseToTouch = function(type, originalEvent) 
{

    //stop propagation, and remove default behavior for everything but INPUT, TEXTAREA & SELECT fields
    // originalEvent.stopPropagation();
    if (originalEvent.target.tagName.toUpperCase().indexOf("SELECT") == -1 && 
    originalEvent.target.tagName.toUpperCase().indexOf("TEXTAREA") == -1 && 
    originalEvent.target.tagName.toUpperCase().indexOf("INPUT") == -1)  //SELECT, TEXTAREA & INPUT
    {
        //if(type != 'touchstart')
        //originalEvent.stopPropagation();//originalEvent.preventDefault();
        //else
        //originalEvent.preventDefault();
        originalEvent.stopPropagation();
    }
    
    var touchevt = document.createEvent("Event");
    touchevt.initEvent(type, true, true);
    touchevt.touches = new Array();
    touchevt.touches[0] = new Object();
    touchevt.touches[0].pageX = originalEvent.clientX;
    touchevt.touches[0].pageY = originalEvent.clientY;
    touchevt.touches[0].target = originalEvent.target;
    touchevt.changedTouches = touchevt.touches; //for jqtouch
    touchevt.targetTouches = touchevt.touches; //for jqtouch
    touchevt.touches[0].clientX = touchevt.touches[0].pageX; //compatibility code
    touchevt.touches[0].clientY = touchevt.touches[0].pageY; //compatibility code
    touchevt.target = originalEvent.target;
    originalEvent.target.dispatchEvent(touchevt);
    return touchevt;
}

emulateTouchEvents = function() 
{
    //return;
    //if(emulatorReady)
    //frm.contentWindow.AppMobi.setReady();
    // var ee=window.querySelectorAll("*");
    var ee = document;
    // for(var x=0;x<ee.length;x++)
    //{
    //ee[x].mouseMoving=false;
    document.mouseMoving = false;
    
    
    document.addEventListener("mousedown", function(e) 
    {
        try 
        {
            // if (e.target != e.currentTarget)
            // return;
            this.mouseMoving = true;
            //fire off a touchstart event
            var touchevt = redirectMouseToTouch("touchstart", e);
            if (document.ontouchstart)
                document.ontouchstart(touchevt);
            if(originalEvent.target.ontouchstart)
                originalEvent.target.ontouchstart(touchevt);
            
        } catch (e) {
        }
    });

    //ee[x].onmouseup=function(e)
    document.addEventListener("mouseup", function(e) 
    {
        try 
        {
            // if (e.target != e.currentTarget)
            // return;
            this.mouseMoving = false;
            //fire off a touchstart event
            var touchevt = redirectMouseToTouch("touchend", e);
            if (document.ontouchend)
                document.ontouchend(touchevt);
            if(originalEvent.target.ontouchend)
                originalEvent.target.ontouchend(touchevt);
        } 
        catch (e) {
        }
    });
    //ee[x].onmousemove=function(e)
    document.addEventListener("mousemove", function(e) 
    {
        try 
        {
            // if (e.target != e.currentTarget)
            // return;
            if (!this.mouseMoving)
                return;
            //fire off a touchstart event
            var touchevt = redirectMouseToTouch("touchmove", e);
            if (document.ontouchmove)
                document.ontouchmove(touchevt);
                        if(originalEvent.target.ontouchmove)
                originalEvent.target.ontouchmove(touchevt);
        } 
        catch (e) {
        }
    });
// }
}
emulateTouchEvents();
window.addEventListener("resize",function(){
var touchevt = document.createEvent("Event");
 touchevt.initEvent("orientationchange", true, true);
    document.dispatchEvent(touchevt);
},false);