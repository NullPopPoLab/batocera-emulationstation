// † EmulationStation NullPopPoCustom † //
// required: 1stkit.js 

const ratingscore=['0','0.2','0.4','0.6','0.8','1']

var metaset={
	id:{capt:'ID',type:'fixed'},
	path:{capt:'Path',type:'fixed'},
	systemName:{capt:'System',type:'fixed'},
	playcount:{capt:'Play Count',type:'fixed'},
	lastplayed:{capt:'Last Played Time',type:'fixed',view:metaview_datetime},
	gametime:{capt:'Played Game Time',type:'fixed',view:metaview_seconds},
	docsAvailable:{capt:'Has Documents',type:'fixed',view:metaview_yesno},
	slideshowAvailable:{capt:'Has Slideshow',type:'fixed',view:metaview_yesno},
	jukeboxAvailable:{capt:'Has Jukebox',type:'fixed',view:metaview_yesno},
	arcadesystemname:{capt:'Powered by',type:'lineinput'},
	name:{capt:'Captional Title',type:'lineinput'},
	title:{capt:'Formal Title',type:'lineinput'},
	sortname:{capt:'Sortable Title',type:'lineinput'},
	family:{capt:'Family',type:'lineinput'},
	desc:{capt:'Description',type:'textinput'},
	rating:{capt:'Rating',type:'rating',view:metaview_rating},
	region:{capt:'Region',type:'lineinput'},
	lang:{capt:'Language',type:'lineinput'},
	releasedate:{capt:'Release Date',type:'date',view:metaview_date},
	developer:{capt:'Developer',type:'lineinput'},
	publisher:{capt:'Publisher',type:'lineinput'},
	genres:{capt:'Genres',type:'genres',view:metaview_genres},
	players:{capt:'Players',type:'lineinput'},
}

function metaview_yesno(val){
	return booleanize(val)?'Yes':'No';
}

function mateview_yesno_select(val,editable=false){
	if(!editable)return metaview_yesno(val);
	val=booleanize(val);

	var span=quickhtml({
		tag:'span',
		style:'display:inline-block',
	});
	var label0=quickhtml({target:span,tag:'label'});
	span.append(' ');
	var label1=quickhtml({target:span,tag:'label'});

	var radio0=quickhtml({
		target:label0,
		tag:'input',
		attr:{type:'radio'}
	});
	label0.append('No');
	label1.append('Yes');
	var radio1=quickhtml({
		target:label1,
		tag:'input',
		attr:{type:'radio'}
	});
	if(val)radio1.checked=true;
	else radio0.checked=true;

	var busy=false;
	radio0.onclick=()=>{
		if(busy)return;
		busy=true;
		radio1.checked=!radio0.checked;
		busy=false;
	}
	radio1.onclick=()=>{
		if(busy)return;
		busy=true;
		radio0.checked=!radio1.checked;
		busy=false;
	}

	return span;
}

function metaview_seconds(val){
	var h=Math.floor(val/3600);
	val-=h*3600;
	var m=Math.floor(val/60);
	val-=m*60;
	var s=Math.floor(val);
	val-=s;
	var v=''+h+':'+zerofill(m,2)+':'+zerofill(s,2);
	if(val)v+=(''+val).substring(1);
	return v;
}

function metaview_date(val){
	if(!val)return '';
	var yp=0;
	var mp=4;
	var dp=6;
	switch(val.length){
		// YYYYMMDDThhmmss 
		case 8: case 15:
		break;

		// YYYY-MM-DDThh:mm:ss 
		case 10: case 19:
		mp+=1;
		dp+=2;
		break;

		default:
		return '';
	}

	var y=parseInt(val.substring(yp,yp+4));
	if(isNaN(y))return '';
	var m=parseInt(val.substring(mp,mp+2));
	if(isNaN(m))return '';
	var d=parseInt(val.substring(dp,dp+2));
	if(isNaN(d))return '';

	return zerofill(y,4)+'-'+zerofill(m,2)+'-'+zerofill(d,2);
}

function metaview_datetime(val){
	var date=metaview_date(val);
	if(!date)return '';

	var tp=8;
	var hp=9;
	var ip=11;
	var sp=13;
	switch(val.length){
		// YYYYMMDDThhmmss 
		case 8: case 15:
		break;

		// YYYY-MM-DDThh:mm:ss 
		case 10: case 19:
		tp+=2;
		hp+=2;
		ip+=3;
		sp+=4;
		break;

		default:
		return date;
	}

	if(val.substring(tp,tp+1)!='T')return date;

	var h=parseInt(val.substring(hp,hp+2));
	if(isNaN(h))return date;
	var i=parseInt(val.substring(ip,ip+2));
	if(isNaN(i))return date;
	var s=parseInt(val.substring(sp,sp+2));
	if(isNaN(s))return date;

	return date+' '+zerofill(h,2)+':'+zerofill(i,2)+':'+zerofill(s,2);
}

function metaview_rating(value,editable=false){

	var v=Math.floor(value*5+0.5);
	var span=quickhtml({
		tag:'span',
		attr:{title:v},
		style:'display:inline-block',
	});

	var star=[]
	var rescore=(v2)=>{
		for(var i=0;i<5;++i){
			star[i].setAttribute('src',
				((i<v2)?es_resource.star1:es_resource.star0));
		}
	}

	for(var i=0;i<5;++i){
		star[i]=quickhtml({
			target:span,
			tag:'img',
			attr:{src:((i<v)?es_resource.star1:es_resource.star0)},
		});
		if(!editable)continue;
		((i_)=>{
			star[i_].onclick=()=>{
				v=(v==1 && i_==0)?0:(i_+1);
				rescore(v);
			}
		})(i);
	}
	return span;
}

function metaview_genres(value,view=null,editable=false){

	return view?view:value;
}

function metaview(sname,gid,data){

	var div=quickhtml({tag:'div'});

	var tbl=quickhtml({target:div,tag:'table',attr:{border:'border'}});

	safeeachobject(metaset,(name,t)=>{
		var inp=null;
		var ctl=null;
		var view=data[name]??'';
		if(view && t.view)view=t.view(view);
		switch(t.type){
			case 'flags':
			inp=mateview_yesno_select(date[name]??false,true);
			break;

			case 'rating':
			inp=metaview_rating(data[name]??0,true);
			break;

			case 'genres':
			inp=metaview_genres(data['genres']??'',data['genre']??'',true);
			break;

			case 'lineinput':
			inp=quickhtml({tag:'input',attr:{type:'text',value:view}});
			break;

			case 'textinput':
			inp=quickhtml({tag:'textarea',sub:[view]});
			break;

			default:
			inp=view;
		}

		quickhtml({
			target:tbl,
			tag:'tr',
			sub:[
				quickhtml({tag:'td',sub:[t.capt]}),
				quickhtml({tag:'td',sub:[inp??'']}),
				quickhtml({tag:'td',sub:[ctl??'']}),
			]
		});
		return true;
	});

	safeeachobject(es_caps.Flags,(name,caption)=>{
		var inp=mateview_yesno_select(data[name]??false,true);
		quickhtml({
			target:tbl,
			tag:'tr',
			sub:[
				quickhtml({tag:'td',sub:[caption]}),
				quickhtml({tag:'td',sub:[inp]}),
			]
		});
		return true;
	});

	safeeachobject(es_caps.Texts,(name,caption)=>{
		var inp=quickhtml({tag:'textarea',sub:[data[name]??'']});
		quickhtml({
			target:tbl,
			tag:'tr',
			sub:[
				quickhtml({tag:'td',sub:[caption]}),
				quickhtml({tag:'td',sub:[inp]}),
			]
		});
		return true;
	});

	safeeachobject(es_caps.Books,(name,caption)=>{
		quickhtml({
			target:tbl,
			tag:'tr',
			sub:[
				quickhtml({tag:'td',sub:[caption]}),
				quickhtml({tag:'td',sub:[
					data[name]?quickhtml({
						tag:'a',
						attr:{target:'_blank',href:es_client.makeurl(data[name])},
						sub:['[View]']
					}):'(empty)'
				]}),
			]
		});
		return true;
	});

	safeeachobject(es_caps.Videos,(name,caption)=>{
		quickhtml({
			target:div,
			tag:'fieldset',
			sub:[
				quickhtml({tag:'legend',sub:[caption]}),
				data[name]?mediaview(es_client.makeurl(data[name]),'video'):'(empty)'
			]
		});
		return true;
	});

	safeeachobject(es_caps.Images,(name,caption)=>{
		quickhtml({
			target:div,
			tag:'fieldset',
			sub:[
				quickhtml({tag:'legend',sub:[caption]}),
				data[name]?mediaview(es_client.makeurl(data[name]),'image'):'(empty)'
			]
		});
		return true;
	});

	return div;
}
