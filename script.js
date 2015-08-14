$(document).ready(function(){

    var player=$('#player')
        dropZone= $("#drop_file"),
        inputZone=$("#input_file"),
        stopButton=$('#stop'),
        playButton=$('#start'),
        pauseButton=$('#pause'),
        gainButton=$('#gain'),
        trackName=$('#trackName'),
        drawElement=$('#visualizing')[0],
        frequency=$('#frequency'),
        q=$('#Q'),
        filterGain=$('#filterGain'),
        wait=$('.wait');
    var context=new AudioContext(),
         fileread=new FileReader(),
         gainNode,
         source,
         analayser,
         filter,
         buffer,
         startedAt,
         pausedAt,
         visualisationId;
    
hide(player,wait);

dropZone[0].ondragover = function() {
    dropZone.addClass('hover');
    return false;
};
    
dropZone[0].ondragleave = function() {
    dropZone.removeClass('hover');
    return false;
};
    
inputZone.change(function(event){
    var file=event.target.files[0];
    loadSoundFile(file);
       
})
    

    
 dropZone[0].ondrop=function(event){
     event.preventDefault();
     dropZone.removeClass('hover');
     var file=event.dataTransfer.files[0];
     loadSoundFile(file);    
    }
 
 
 var loadSoundFile = function(file) {
   var track=file.name;
       trackName.text(track);
 
  fileread.onloadend=function(evt){
    context.decodeAudioData(evt.target.result,success,error); }
  
  //for decoding audiobuffer
   function success(decodeArrayBuffer){
         buffer=decodeArrayBuffer;
         show(player);
         hide(inputZone,dropZone,wait);
         }
    function error(e){console.log("error");}

  
  fileread.onloadstart=function(evt){wait.show();}
  fileread.readAsArrayBuffer(file);
       
      }

 
 playButton.click(function(){
     if(!startedAt){
     source=context.createBufferSource();
     source.buffer=buffer;
     source.loop=true;
         
         
     analayser=context.createAnalyser();
     analayser.fftSize = 2048;
         
     gainNode=context.createGain();
     gainNode.gain.value=gainButton.val();
         
     filter= context.createBiquadFilter(); 
     changeFilter($('.radio1:checked').val());
     filter.frequency.value=frequency.val()*10000;
     filter.Q=q.val();
     filter.gain.value=filterGain.val();
   
    source.connect(analayser);
    analayser.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(context.destination);         
   
     if(pausedAt){
         source.start(0,pausedAt/1000);
         startedAt=Date.now()-pausedAt;
         pausedAt=0;
         visualisationId=showVisualization(analayser,drawElement);
    }else
      {
             startedAt=Date.now();
             source.start(0);
             visualisationId=showVisualization(analayser,drawElement);
       }
     }
 })
 
 pauseButton.click(function(){
     if(startedAt){
     source.stop(0);
     pausedAt=Date.now()-startedAt;
     startedAt=0;
     }
 })
 
 stopButton.click(function(){
     stop();
 })
 
 function stop(){
  try{source.stop(0);}catch(e){} 
  startedAt=0;
  hide(player);
  show(inputZone,dropZone);
  stopVisualization(visualisationId);
  visualisationId=0;
 }
 
 gainButton.change(function(e){
     if(!gainNode) return;
     gainNode.gain.value=gainButton.val();
 })
 $('.radio1').change(function(){
     changeFilter($('.radio1:checked').val()*1)
 })
 $('.range1').change(function(evt){
     filter.frequency.value=frequency.val()*10000;
     filter.Q.value=q.val();
     filter.gain.value=filterGain.val();
 })
 function hide(){
    $(arguments).each(function(){
        if(typeof this.hide=='function')
            this.hide();})
 }
function show(){
    $(arguments).each(function(){
        if(typeof this.show=='function')
            this.show();})
 }
 function changeFilter(val){
     var allFilters=[
    "lowpass",
    "highpass",
    "bandpass",
    "lowshelf",
    "highshelf",
    "peaking",
    "notch",
    "allpass"];
    filter.type=allFilters[val];   
 }
    
 
function showVisualization(analyser,drawElemant){
    if(!visualisationId)
    visualisationId=window.setInterval(function(){
         var freq=new Uint8Array(analayser.frequencyBinCount);
        analayser.getByteFrequencyData(freq);
        var HEIGHT=drawElement.height,
            WIDTH=drawElement.width;
        var draw=drawElement.getContext('2d');
        draw.clearRect(0,0,drawElement.width,drawElement.height);
        for(var i=0;i<analayser.frequencyBinCount;i++)
            {
                    var value=freq[i],
                    percent=value/256,
                    height=HEIGHT*percent,
                    offset=HEIGHT-height-1,
                    barWidth=WIDTH/analayser.frequencyBinCount,
                    hue=i/analayser.frequencyBinCount*360;
                    draw.fillStyle='hsl('+hue+',100%,50%)';
                    draw.fillRect(i*barWidth,offset,barWidth,height);                    
            }
        },100);
    return visualisationId;
  }
function stopVisualization(id,drawElemant){
    var draw=drawElement.getContext('2d');
        draw.clearRect(0,0,drawElement.width,drawElement.height);
        window.clearInterval(id);
    }


})