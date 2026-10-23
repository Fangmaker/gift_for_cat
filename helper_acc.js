/* 验收辅助驱动（临时文件，验收后删除）：把地图导航能力暴露给测试脚本 */
(function(){
  if(window.__accReady) return;
  window.__accReady = true;
  var map = document.getElementById('map');

  window.__ban = function(t){
    var d = document.getElementById('__ban') || document.createElement('div');
    d.id='__ban';
    d.style.cssText='position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:99999;background:rgba(0,0,0,.85);color:#39ff7a;font:bold 18px monospace;padding:8px 16px;border-radius:10px;max-width:90vw;';
    d.textContent=t; document.body.appendChild(d);
  };

  window.__c = function(){
    var m = document.getElementById('coord-pill').textContent.match(/([0-9]+[.][0-9]+)/g);
    return m ? {lat:+m[0], lng:+m[1], z:+m[2]} : null;
  };

  window.__n = function(){
    return 'trees='+document.querySelectorAll('.tree-marker').length+
           ' animals='+document.querySelectorAll('.animal-marker').length;
  };

  function mk(pt,x,y,id){
    var e = new PointerEvent(pt,{bubbles:true,cancelable:true,view:window,
      pointerId:id,pointerType:'mouse',isPrimary:true,button:0,
      buttons:(pt==='pointerup'||pt==='pointercancel'?0:1),
      clientX:x,clientY:y,screenX:x,screenY:y});
    try{ Object.defineProperty(e,'which',{value:1}); }catch(_){}
    return e;
  }

  function fire(pt,x,y,id){
    (pt==='pointerdown' ? map : document).dispatchEvent(mk(pt,x,y,id));
  }

  window.__drag = function(dx,dy){
    var id = 100 + Math.floor(Math.random()*800);
    var r = map.getBoundingClientRect();
    var x = r.width/2, y = r.height/2;
    fire('pointercancel',x,y,id); fire('pointerup',x,y,id);
    fire('pointerdown',x,y,id);
    var s=8, i=1;
    var t = setInterval(function(){
      if(i<=s){ fire('pointermove', x+dx*i/s, y+dy*i/s, id); i++; }
      else{
        fire('pointermove', x+dx, y+dy, id);
        fire('pointermove', x+dx, y+dy, id);
        fire('pointerup', x+dx, y+dy, id);
        clearInterval(t);
      }
    },20);
  };

  window.__wheel = function(dir){
    var r = map.getBoundingClientRect();
    map.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,
      deltaY:dir*240,deltaMode:0,clientX:r.width/2,clientY:r.height/2}));
  };

  window.__tgt=null; window.__tmr=null; window.__stall=0; window.__last=null;

  window.__step = function(){
    var t=window.__tgt; if(!t){ if(window.__tmr){clearInterval(window.__tmr);window.__tmr=null;} return; }
    var c=window.__c(); if(!c) return;
    if(window.__last && Math.abs(c.lat-window.__last.lat)<1e-9 && Math.abs(c.lng-window.__last.lng)<1e-9 && Math.abs(c.z-window.__last.z)<1e-9){
      window.__stall++;
    }else{ window.__stall=0; }
    window.__last=c;
    if(window.__stall>25){ window.__ban('STALL at '+c.lat.toFixed(4)+','+c.lng.toFixed(4)+' z'+c.z); window.__tgt=null; clearInterval(window.__tmr); window.__tmr=null; return; }
    if(Math.abs(c.z-t.z)>=0.3){ window.__wheel(c.z<t.z?-1:1); return; }
    var dLng=t.lng-c.lng, dLat=t.lat-c.lat;
    if(Math.abs(dLng)<0.0006 && Math.abs(dLat)<0.0006){
      window.__ban('AT '+c.lat.toFixed(4)+','+c.lng.toFixed(4)+' z'+c.z+' | '+window.__n());
      window.__tgt=null; clearInterval(window.__tmr); window.__tmr=null; return;
    }
    var ppd = 256*Math.pow(2,c.z)/360;
    var dx = -dLng*ppd, dy = dLat*ppd/Math.cos(c.lat*Math.PI/180);
    var m = Math.max(Math.abs(dx),Math.abs(dy));
    if(m>420){ dx*=420/m; dy*=420/m; }
    window.__drag(dx,dy);
  };

  window.__go = function(lat,lng,z){
    window.__tgt={lat:lat,lng:lng,z:z}; window.__stall=0; window.__last=null;
    if(!window.__tmr){ window.__tmr=setInterval(window.__step,700); }
    window.__ban('GO '+lat+','+lng+' z'+z);
    return 'started';
  };

  window.__ban('ACC_READY');
})();
