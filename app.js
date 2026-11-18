const $=id=>document.getElementById(id);
const video=$("source"), fileInput=$("file"), status=$("status");
let currentUrl=null, sourceName="clip";
function setStatus(t){status.textContent=t}
function setSource(url,name){if(currentUrl)URL.revokeObjectURL(currentUrl);currentUrl=url;sourceName=name||"clip";video.src=url;video.load();$("export").disabled=false;setStatus("Video loaded. Choose a start point and render.");}
fileInput.addEventListener("change",e=>{const f=e.target.files?.[0];if(!f)return;setSource(URL.createObjectURL(f),f.name.replace(/\.[^.]+$/,""));});
$("loadUrl").addEventListener("click",async()=>{
 const u=$("url").value.trim();if(!u){setStatus("Paste a direct video URL first.");return;}
 try{const r=await fetch(u,{method:"GET",mode:"cors"});if(!r.ok)throw new Error("HTTP "+r.status);const b=await r.blob();if(!b.type.startsWith("video/")&&!/\.(mp4|webm|mov)(\?|$)/i.test(u))throw new Error("The URL did not return a recognised video file.");setSource(URL.createObjectURL(b),"clip");}
 catch(err){setStatus("Could not load this URL. It must be a direct video file and allow browser CORS access. "+err.message);}
});
$("useTime").addEventListener("click",()=>{$("start").value=Math.floor(video.currentTime);});
$("opacity").addEventListener("input",e=>{$("opacityOut").value=e.target.value+"%";document.querySelector(".preview-watermark").style.color=`rgba(255,255,255,${Number(e.target.value)/100})`;});
function supportedMime(){const types=["video/mp4;codecs=avc1.42E01E,mp4a.40.2","video/mp4","video/webm;codecs=vp9,opus","video/webm"];return types.find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t))||"";}
function drawRoundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
$("export").addEventListener("click",async()=>{
 const start=Math.max(0,Number($("start").value)||0),duration=Number($("duration").value)||150;
 if(!video.src||!Number.isFinite(video.duration)){ $("exportStatus").textContent="Wait until the video metadata loads.";return;}
 if(start+duration>video.duration){$("exportStatus").textContent=`Not enough footage. This video ends at ${Math.floor(video.duration)} seconds.`;return;}
 const mime=supportedMime();if(!mime){$("exportStatus").textContent="This iPhone browser does not expose a supported MediaRecorder format. Try an updated Safari version.";return;}
 const btn=$("export");btn.disabled=true;$("download").classList.add("hidden");
 try{
  const canvas=document.createElement("canvas");canvas.width=720;canvas.height=1280;const ctx=canvas.getContext("2d",{alpha:false});
  const stream=canvas.captureStream(30);
  const audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  await audioCtx.resume();
  const src=audioCtx.createMediaElementSource(video),dest=audioCtx.createMediaStreamDestination();src.connect(dest);src.connect(audioCtx.destination);
  dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
  const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3500000,audioBitsPerSecond:128000});
  const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  const stopped=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=e=>reject(e.error||new Error("Recording failed"));});
  const caption=$("caption").value.trim().split(/\n/).filter(Boolean).slice(0,3);
  const opacity=Number($("opacity").value)/100;
  function paint(){
   if(video.readyState>=2){
    const vw=video.videoWidth,vh=video.videoHeight,scale=Math.max(720/vw,1280/vh),sw=720/scale,sh=1280/scale,sx=(vw-sw)/2,sy=(vh-sh)/2;
    ctx.drawImage(video,sx,sy,sw,sh,0,0,720,1280);
    ctx.save();ctx.globalAlpha=opacity;ctx.textAlign="center";ctx.font="900 43px Arial";ctx.fillStyle="#fff";ctx.shadowColor="#000";ctx.shadowBlur=12;ctx.fillText("CLIPRUSH",360,650);ctx.restore();
    if(caption.length){ctx.save();ctx.textAlign="center";ctx.font="900 42px Arial";ctx.lineWidth=8;ctx.strokeStyle="rgba(0,0,0,.85)";ctx.fillStyle="#fff";caption.forEach((line,i)=>{const y=1010+i*54;ctx.strokeText(line.toUpperCase(),360,y,660);ctx.fillText(line.toUpperCase(),360,y,660);});ctx.restore();}
   }
   if(!video.paused&&!video.ended)requestAnimationFrame(paint);
  }
  video.currentTime=start;
  await new Promise((resolve,reject)=>{video.onseeked=resolve;video.onerror=reject;});
  recorder.start(1000);video.muted=false;await video.play();paint();
  $("exportStatus").textContent="Rendering on your iPhone… Keep Safari open and the screen awake.";
  const endAt=start+duration;
  await new Promise((resolve,reject)=>{
   const check=()=>{if(video.currentTime>=endAt||video.ended){video.pause();resolve();}else if(video.paused){reject(new Error("Playback stopped before the clip finished."));}else setTimeout(check,250);};check();
  });
  recorder.stop();await stopped;stream.getTracks().forEach(t=>t.stop());await audioCtx.close();
  const blob=new Blob(chunks,{type:mime});const ext=mime.includes("mp4")?"mp4":"webm";const out=URL.createObjectURL(blob);
  const a=$("download");a.href=out;a.download=`CLIPRUSH-${Date.now()}.${ext}`;a.textContent=`Save finished ${ext.toUpperCase()} clip`;a.classList.remove("hidden");
  $("exportStatus").textContent=`Finished. ${(blob.size/1024/1024).toFixed(1)} MB created.`;
 }catch(err){$("exportStatus").textContent="Export stopped: "+err.message+" If this repeats, try a shorter source file or another supported browser.";}
 finally{btn.disabled=false;}
});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
