// † EmulationStation NullPopPoCustom † //
// required: 1stkit.js objview.js

//function delayExec(delay,exec){
//
//	var t={
//		abf:false,
//		toid:setTimeout(()=>{
//			if(t.abf)return;
//			t.abf=true;
//			if(exec)exec();
//		},delay),
//		abort:()=>{
//			if(t.abf)return;
//			t.abf=true;
//			clearTimeout(t.toid);
//		}
//	}
//	return t;
//}

const gamelist_pagenation=200;

const panel_mainboard=quickhtml({
	tag:'div',
	attr:{class:'mainboard'},
});

const panel_leftpane=quickhtml({
	target:panel_mainboard,
	tag:'div',
	attr:{class:'leftpane'},
});
const panel_rightpane=quickhtml({
	target:panel_mainboard,
	tag:'div',
	attr:{class:'rightpane'},
});

//function createSecondsTime(v){
//	var h=Math.floor(v/3600);
//	v-=h*3600;
//	var m=Math.floor(v/60);
//	v-=m*60;
//	var s=Math.floor(v);
//	var m2='0'+m;
//	var s2='0'+s;
//	return ''+h+':'+m2.substring(m2.length-2)+':'+s2.substring(s2.length-2);
//}
//
//function parseDate(v){
//	if(!v)return '';
//	var yp=0;
//	var mp=4;
//	var dp=6;
//	var tp=8;
//	var hp=9;
//	var ip=11;
//	var sp=13;
//	switch(v.length){
//		// YYYYMMDDThhmmss 
//		case 8: case 15: break;
//
//		// YYYY-MM-DDThh:mm:ss 
//		case 10: case 19:
//		mp+=1;
//		dp+=2;
//		tp+=2;
//		hp+=2;
//		ip+=3;
//		sp+=4;
//		break;
//
//		default:
//		return '';
//	}
//
//	var y=parseInt(v.substring(yp,yp+4));
//	if(isNaN(y))return '';
//	var m=parseInt(v.substring(mp,mp+2));
//	if(isNaN(m))return '';
//	var d=parseInt(v.substring(dp,dp+2));
//	if(isNaN(d))return '';
//	var t=new Date(y,m-1,d);
//	if(v.substring(tp,tp+1)!='T')return t;
//
//	var h=parseInt(v.substring(hp,hp+2));
//	if(isNaN(h))return t;
//	var i=parseInt(v.substring(ip,ip+2));
//	if(isNaN(i))return t;
//	var s=parseInt(v.substring(sp,sp+2));
//	if(isNaN(s))return t;
//	t.setHours(h);
//	t.setMinutes(i);
//	t.setSeconds(s);
//	return t;
//}
//
//function createDateTime(v){
//	v=parseDate(v);
//	if(!v)return '';
//	var t=new Date(v);
//	var y=''+t.getFullYear();
//	var m='0'+(t.getMonth()+1);
//	var d='0'+t.getDate();
//	var h='0'+t.getHours();
//	var i='0'+t.getMinutes();
//	var s='0'+t.getSeconds();
//	return y.substring(y.length-2,y.length)+'-'+
//		m.substring(m.length-2,m.length)+'-'+
//		d.substring(d.length-2,d.length)+' '+
//		h.substring(h.length-2,h.length)+':'+
//		i.substring(i.length-2,i.length)+':'+
//		s.substring(s.length-2,s.length);
//}
//
//function showError(target,err){
//
//	quickhtml({
//		target:target,
//		tag:'div',
//		attr:{class:'instanterror'},
//		sub:[JSON.stringify(err)]
//	});
//}
//
//function createRatingControl(gt,onchange){
//
//	var v=Math.floor(gt.rating*5+0.5);
//	var s=[]
//	var t={
//		view:quickhtml({
//			tag:'span',
//			attr:{title:v},
//		}),
//		set:(v2)=>{
//			v=v2;
//			for(var i=0;i<5;++i){
//				s[i].setAttribute('src',
//					'/resources/star_'+((i<v)?'filled.svg':'unfilled.svg'));
//			}
//			t.view.setAttribute('title',v);
//		},
//	}
//
//	for(var i=0;i<5;++i){
//		var f=(i+1)<=v;
//		s[i]=quickhtml({
//			target:t.view,
//			tag:'img',
//			attr:{src:'/resources/star_'+(f?'filled.svg':'unfilled.svg')},
//		});
//		((i_)=>{
//			s[i_].onclick=()=>{
//				var i2=(i_==0 && v==1)?(i_-1):i_;
//				v=i2+1;
//				t.set(v);
//				onchange(v);
//			}
//		})(i);
//	}
//
//	return t;
//}
//
//function createFavoriteButton(gt,onchange){
//
//	var f=gt.favorite=='true';
//	var t={
//		view:quickhtml({tag:'button',attr:{class:f?'btn_favorite':'btn_normal'},sub:['Favorite']}),
//		set:(f2)=>{
//			f=f2;
//			t.view.setAttribute('class',f?'btn_favorite':'btn_normal');
//		},
//	}
//	t.view.onclick=()=>{
//		f=!f;
//		t.set(f);
//		onchange(f);
//	}
//	return t;
//}
//
//function createHiddenButton(gt,onchange){
//
//	var f=gt.hidden=='true';
//	var t={
//		view:quickhtml({tag:'button',attr:{class:f?'btn_hidden':'btn_normal'},sub:['Hidden']}),
//		set:(f2)=>{
//			f=f2;
//			t.view.setAttribute('class',f?'btn_hidden':'btn_normal');
//		},
//	}
//	t.view.onclick=()=>{
//		f=!f;
//		t.set(f);
//		onchange(f);
//	}
//	return t;
//}
//
//function createRunnableButton(gt,onchange){
//
//	var f=gt.runnable=='true';
//	var t={
//		view:quickhtml({tag:'button',attr:{class:f?'btn_runnable':'btn_normal'},sub:['Runnable']}),
//		set:(f2)=>{
//			f=f2;
//			t.view.setAttribute('class',f?'btn_runnable':'btn_normal');
//		},
//	}
//	t.view.onclick=()=>{
//		f=!f;
//		t.set(f);
//		onchange(f);
//	}
//	return t;
//}
//
//function createKidGameButton(gt,onchange){
//
//	var f=gt.kidgame=='true';
//	var t={
//		view:quickhtml({tag:'button',attr:{class:f?'btn_kidgame':'btn_normal'},sub:["Kid's Game"]}),
//		set:(f2)=>{
//			f=f2;
//			t.view.setAttribute('class',f?'btn_kidgame':'btn_normal');
//		},
//	}
//	t.view.onclick=()=>{
//		f=!f;
//		t.set(f);
//		onchange(f);
//	}
//	return t;
//}
//
//function createMetaButton(gt,onsubmit){
//
//	var btn=quickhtml({tag:'button',sub:['Meta']});
//	btn.onclick=()=>{
//		updateMetaEditor(gt,onsubmit);
//	}
//	return btn;
//}
//
//function createDetailButton(gt,onquit,onsubmit,onerr){
//
//	var btn=quickhtml({tag:'button',sub:['Detail']});
//	btn.onclick=()=>{
//		updateGameView(gt,onquit,onsubmit,onerr);
//	}
//	return btn;
//}
//
//function createInstantErrorView(cols)
//{
//	var t={
//		view:quickhtml({tag:'td',attr:{colspan:cols}}),
//		clear:()=>{t.view.innerHTML='';},
//		put:(err)=>{
//			t.view.innerHTML='';
//			t.view.append(quickhtml({
//				tag:'span',
//				attr:{class:'instanterror'},
//				sub:[JSON.stringify(err)],
//			}));
//		},
//	}
//
//	return t;
//}
//
//var curlang='en';
//function createLangSelect(list,cbchg){
//
//	var sel=quickhtml({
//		tag:'select',
//	});
//	var opt=[]
//	for(var s in list){
//		var p=quickhtml({
//			target:sel,
//			tag:'option',
//			attr:{value:s},
//			sub:[list[s]]
//		});
//		if(s==curlang)p.setAttribute('selected','selected');
//		opt.push(p);
//	}
//	sel.onchange=()=>{
//		curlang=opt[sel.selectedIndex].getAttribute('value');
//		if(cbchg)cbchg(curlang);
//	}
//	
//	return sel;
//}
//
//var genrelist=null;
//function extractGenre(t,xml){
//	var u={id:null,parent:null,sub:[],nom:{},btn:null,chk:null,lab:null}
//	for(var sub of xml.children){
//		if(sub.tagName=='id')u.id=sub.innerHTML;
//		else if(sub.tagName=='parent'){
//			u.parent=sub.innerHTML;
//		}
//		else if(sub.tagName.substring(0,4)=='nom_'){
//			u.nom[sub.tagName.substring(4)]=sub.innerHTML;
//		}
//	}
//	if(!u.id){
//		console.log('missing id');
//		return;
//	}
//	if(t.flat[u.id]){
//		console.log('id dubbed; '+u.id);
//		return;
//	}
//	u.btn={
//		view:quickhtml({
//			target:panel_syslist,
//			tag:'span',
//			attr:{class:'genre_off'},
//			sub:[u.nom[curlang]??u.nom.en]
//		}),
//		_on:false,
//		isOn:()=>u.btn._on,
//		cbclick:null,
//		setToggle:(f)=>{
//			u.btn._on=f;
//			u.btn.view.setAttribute('class',f?'genre_on':'genre_off');
//		},
//		setLang:(lang)=>{
//			u.btn.view.innerHTML=u.nom[lang]??u.nom.en;
//		},
//		click:()=>{
//			var f=!u.btn.isOn();
//			u.btn.setToggle(f);
//			return f;
//		}
//	}
//	u.btn.view.onclick=()=>{
//		var f=u.btn.click();
//		if(u.btn.cbclick)u.btn.cbclick(f);
//		if(f){
//			if(u.parent)t.flat[u.parent].btn.setToggle(true);
//		}
//		else{
//			for(var sub of u.sub)t.flat[sub.id].btn.setToggle(false);
//		}
//	}
//	t.flat[u.id]=u;
//}
//function buildGenreView(view,u){
//
//	var dt=quickhtml({
//		target:view,
//		tag:u.parent?'span':'p',
//		attr:{class:'genregroup'},
//		sub:[' ',u.btn.view]
//	});
//	if(u.sub.length<1)return;
//
//	var dd=quickhtml({
//		target:dt,
//		tag:'div',
//	});
//	for(var sub of u.sub){
//		buildGenreView(dd,sub);
//	}
//}
//function buildGenreList(xml,onsubmit){
//	var t={flat:{},tree:[]}
//	t.view=quickhtml({
//		tag:'div',
//	});
//
//	quickhtml({
//		target:t.view,
//		tag:'div',
//		attr:{class:'langslect'},
//		sub:[createLangSelect(es_caps.GenreLanguages,(lang)=>{
//			for(var id in t.flat){
//				t.flat[id].btn.view.innerHTML=t.flat[id].nom[lang]??t.flat[id].nom.en;
//		}})]
//	});
//
//	var dl=quickhtml({
//		target:t.view,
//		tag:'p',
//		attr:{class:'genretree'}
//	});
//
//	xml=xml.children[0];
//	if(!xml){
//		console.log('empty xml');
//		return t;
//	}
//	if(xml.tagName!='genres'){
//		console.log('not genres');
//		return t;
//	}
//	for(var g of xml.children){
//		if(g.tagName!='genre'){
//			console.log('not genre; '+g.tagName);
//			continue;
//		}
//		extractGenre(t,g);
//	}
//
//	for(var id in t.flat){
//		var u=t.flat[id];
//		if(!u.parent)t.tree.push(u);
//		else if(t.flat[u.parent]){
//			t.flat[u.parent].sub.push(u);
//		}
//		else{
//			console.log('missing parent; '+u.parent+'~'+u.id);
//		}
//	}
//
//	for(var u of t.tree){
//		buildGenreView(dl,u);
//	}
//
//	btn=quickhtml({
//		target:dl,
//		tag:'button',
//		sub:['Submit'],
//	});
//	btn.onclick=()=>{
//		if(onsubmit){
//			var ids=[]
//			var tree={}
//			for(var id in t.flat){
//				var u=t.flat[id];
//				if(u.btn.isOn()){
//					ids.push(id);
//					if(u.parent){
//						if(!tree[u.parent])tree[u.parent]=[]
//						tree[u.parent].push(id);
//					}
//					else{
//						if(!tree[id])tree[id]=[]
//					}
//				}
//			}
//
//			var nms=[]
//			for(var id1 in tree){
//				var u1=t.flat[id1]
//				if(tree[id1].length<1){
//					nms.push(u1.nom.en);
//					continue;
//				}
//
//				if(es_caps.SaveGenreByIDs){
//					var a=[]
//					for(var id2 of tree[id1]){
//						var u2=t.flat[id2]
//						a.push(u2.nom.en);
//					}
//					nms.push(u1.nom.en+'('+a.join('; ')+')');
//				}
//				else{
//					for(var id2 of tree[id1]){
//						var u2=t.flat[id2]
//						nms.push(u1.nom.en+' / '+u2.nom.en);
//					}
//				}
//			}
//
//			onsubmit(ids,nms.join(', '));
//		}
//	}
//
//	return t;
//}
//function updateGenreList(gs){
//	var t=genrelist;
//
//	for(var id in t.flat){
//		var u=t.flat[id];
//		u.btn.setToggle(false);
//	}
//	for(var id of gs){
//		var u=t.flat[id];
//		if(!u)continue;
//		u.btn.setToggle(true);
//	}
//}
//
//function updateGenreEditor(gt,gs,onsubmit){
//	gs=gs?gs.split(','):[];
//
//	main.innerHTML='';
//	panel_genreeditor.innerHTML='';
//
//	quickhtml({
//		target:panel_genreeditor,
//		tag:'div',
//		attr:{class:'systemcaption'},
//		sub:[getSystemCaption(gt)]
//	});
//	quickhtml({
//		target:panel_genreeditor,
//		tag:'div',
//		attr:{class:'gamecaption'},
//		sub:[getGameCaption(gt)]
//	});
//
//	var btn=quickhtml({
//		target:panel_genreeditor,
//		tag:'button',
//		sub:['Quit'],
//	});
//	btn.onclick=()=>{
//		main.innerHTML='';
//		main.append(panel_metaeditor);
//	}
//
//	quickhtml({
//		target:panel_genreeditor,
//		tag:'p',
//		attr:{class:'editorcaption'},
//		sub:['Genre Select'],
//	});
//
//	var view=quickhtml({
//		target:panel_genreeditor,
//		tag:'p',
//	});
//
//	main.append(panel_genreeditor);
//	if(genrelist){
//		updateGenreList(gs);
//		view.innerHTML='';
//		view.append(genrelist.view);
//	}
//	else{
//		view.innerHTML='Now Loading...';
//		http_get_xml('/resources/genres.xml',(xml)=>{
//			genrelist=buildGenreList(xml,(ids,nms)=>{
//				if(onsubmit)onsubmit(ids,nms);
//				main.innerHTML='';
//				main.append(panel_metaeditor);
//			});
//			updateGenreList(gs);
//			view.innerHTML='';
//			view.append(genrelist.view);
//		},(err)=>{
//			view.innerHTML=JSON.stringify(err.toString());
//		});
//	}
//}
//
//function updateMetaEditor(gt,onsubmit){
//
//	main.innerHTML='';
//	panel_metaeditor.innerHTML='';
//
//	quickhtml({
//		target:panel_metaeditor,
//		tag:'div',
//		attr:{class:'systemcaption'},
//		sub:[getSystemCaption(gt)]
//	});
//	quickhtml({
//		target:panel_metaeditor,
//		tag:'div',
//		attr:{class:'gamecaption'},
//		sub:[getGameCaption(gt)]
//	});
//
//	var btn=quickhtml({
//		target:panel_metaeditor,
//		tag:'button',
//		sub:['Quit'],
//	});
//	btn.onclick=()=>{
//		main.innerHTML='';
//		main.append(panel_mainboard);
//	}
//
//	quickhtml({
//		target:panel_metaeditor,
//		tag:'p',
//		attr:{class:'editorcaption'},
//		sub:['Meta Editor'],
//	});
//
//	const romdir='/userdata/roms/'+gt.systemName+'/';
//	const romfile=gt.path.substring(romdir.length);
//	var dst={}
//
//	var tbl=quickhtml({
//		target:panel_metaeditor,
//		tag:'table',
//		attr:{align:'center',border:'border'},
//	});
//
//	var meta={
//		systemName:{capt:'Platform',type:'label'},
//		romfile:{capt:'File',type:'val',func:()=>romfile},
//		arcadesystemname:{capt:'Powered by',type:'lineinput'},
//		name:{capt:'Captional Title',type:'lineinput'},
//		title:{capt:'Formal Title',type:'lineinput'},
//		sortname:{capt:'Sortable Title',type:'lineinput'},
//		family:{capt:'Family',type:'lineinput'},
//		desc:{capt:'Description',type:'textinput'},
//		rating:{capt:'Rating',type:'rating'},
//		flags:{capt:'Flags',type:'flags'},
//		region:{capt:'Region',type:'lineinput'},
//		lang:{capt:'Language',type:'lineinput'},
//		releasedate:{capt:'Release Date',type:'date'},
//		developer:{capt:'Developer',type:'lineinput'},
//		publisher:{capt:'Publisher',type:'lineinput'},
//		genres:{capt:'Genres',type:'genres'},
//		players:{capt:'Players',type:'lineinput'},
//	}
//	for(var it in es_caps.Texts){
//		meta[it]={capt:es_caps.Texts[it],type:'textinput'}
//	}
//
//	for(var it in meta){
//		var mt=meta[it]
//		var sub=[quickhtml({tag:'th',sub:[mt.capt]})]
//		switch(mt.type){
//			case 'label':
//			sub.push(quickhtml({tag:'td',sub:[gt[it]]}));
//			break;
//
//			case 'val':
//			sub.push(quickhtml({tag:'td',sub:[mt.func()]}));
//			break;
//
//			case 'lineinput':
//			var ui=quickhtml({tag:'input',attr:{type:'text',class:'metatextbox',name:it,value:gt[it]??''}});
//			((it_,ui_)=>{ui_.onchange=()=>{dst[it_]=ui_.value;}})(it,ui);
//			sub.push(ui);
//			break;
//
//			case 'textinput':
//			var ui=quickhtml({tag:'textarea',attr:{name:it,wrap:'off',class:'metatextarea'},sub:[gt[it]??'']});
//			((it_,ui_)=>{ui_.onchange=()=>{dst[it_]=ui_.value;}})(it,ui);
//			sub.push(ui);
//			break;
//
//			case 'date':
//			var d=parseDate(gt[it]);
//			d=(!d)?'':(new Date(d).toISOString().substring(0,10));
//			var ui=quickhtml({tag:'input',attr:{type:'text',class:'metatextbox',name:it,value:d}});
//			((it_,ui_)=>{ui_.onchange=()=>{
//				d=parseDate(ui_.value);
//				dst[it_]=(!d)?'':(new Date(d).toISOString().substring(0,10));
//			}})(it,ui);
//			sub.push(ui);
//			break;
//
//			case 'rating':
//			var c_rating=createRatingControl(gt,(score)=>{
//				dst.rating=ratingscore[score];
//			});
//			sub.push(c_rating.view);
//			break;
//
//			case 'flags':
//			if(es_caps.Flags.runnable){
//				var c_runnable=createRunnableButton(gt,(f)=>{
//					dst.runnable=f?'true':'false';
//				});
//				sub.push(c_runnable.view);
//			}
//			var c_kidgame=createKidGameButton(gt,(f)=>{
//				dst.kidgame=f?'true':'false';
//			});
//			sub.push(c_kidgame.view);
//			var c_favorite=createFavoriteButton(gt,(f)=>{
//				dst.favorite=f?'true':'false';
//			});
//			sub.push(c_favorite.view);
//			var c_hidden=createHiddenButton(gt,(f)=>{
//				dst.hidden=f?'true':'false';
//			});
//			sub.push(c_hidden.view);
//			break;
//
//			case 'genres':
//			var btn=quickhtml({tag:'button',sub:['Edit']});
//			var gv=quickhtml({tag:'span',sub:[gt.genre]});
//			((gs_,gv_)=>{btn.onclick=()=>{
//				updateGenreEditor(gt,gs_,(ids,nms)=>{
//					dst.genres=ids.join(',');
//					dst.genre=nms;
//					gv_.innerHTML=dst.genre;
//				});
//			}})(gt.genres,gv);
//			sub.push(quickhtml({tag:'td',sub:[gv,' ',btn,]}));
//			break;
//		}
//		quickhtml({target:tbl,tag:'tr',sub:sub});
//	}
//
//	btn=quickhtml({
//		target:panel_metaeditor,
//		tag:'button',
//		sub:['Submit'],
//	});
//	btn.onclick=()=>{
//		main.innerHTML='';
//		if(onsubmit)onsubmit(dst);
//		main.append(panel_mainboard);
//	}
//
//	main.append(panel_metaeditor);
//}
//
//function updateMediaCaption(loc,label,url=null){
//
//	quickhtml({
//		target:loc,
//		tag:url?'a':'span',
//		attr:url?{target:'_blank',href:url,class:'mediacaption'}:{class:'mediacaption'},
//		sub:[label]
//	});
//}
//
//function showReplacerButton(loc,onclick){
//
//	var btn=quickhtml({
//		target:loc,
//		tag:'button',
//		sub:['Edit']
//	});
//	btn.onclick=onclick;
//}
//
//function updateMediaView(gt,it,tray,path){
//
//	tray.loc.innerHTML='';
//	if(!path)return;
//
//	if(tray.elem)tray.elem.remove();
//	tray.elem=quickhtml({
//		target:tray.loc,
//		tag:'p',
//		attr:{class:'mediatray'},
//		sub:[
//			(it=='video')?
//				quickhtml({tag:'video',attr:{controls:'controls'},sub:[
//					quickhtml({tag:'source',attr:{src:gt[it]}})
//				]}):
//			quickhtml({tag:'img',attr:{src:gt[it]},style:{'max-width':'100%'}})
//		],
//	});
//}
//
//function updateLaunchControl(launchloc,confirmloc,cbok,cbng){
//
//	var btn=quickhtml({
//		target:launchloc,
//		tag:'button',
//		sub:['Launch'],
//	});
//	btn.onclick=()=>{
//		launchloc.innerHTML='';
//		confirmloc.innerHTML='';
//		showConfirmPanel(confirmloc,'Launch the Game',()=>{
//			confirmloc.innerHTML='';
//			if(cbok)cbok();
//			updateLaunchControl(launchloc,confirmloc,cbok,cbng);
//		},()=>{
//			confirmloc.innerHTML='';
//			if(cbng)cbng();
//			updateLaunchControl(launchloc,confirmloc,cbok,cbng);
//		});
//	}
//}
//
//function updateGameView(gt,cbquit,cbchg,cberr){
//
//	panel_sysview.innerHTML='';
//	panel_gameview.innerHTML='';
//
//	quickhtml({
//		target:panel_gameview,
//		tag:'div',
//		attr:{class:'systemcaption'},
//		sub:[getSystemCaption(gt)]
//	});
//	quickhtml({
//		target:panel_gameview,
//		tag:'div',
//		attr:{class:'gamecaption'},
//		sub:[getGameCaption(gt)]
//	});
//
//	var btntray=quickhtml({
//		target:panel_gameview,
//		tag:'div',
//		attr:{class:'buttontray'}
//	});
//	var launchloc=quickhtml({
//		target:btntray,
//		tag:'span',
//	});
//
//	var btn=null;
//	if(gt.jukeboxAvailable=='true'){
//		btn=quickhtml({
//			target:btntray,
//			tag:'button',
//			sub:['JukeBox'],
//		});
//		btn.onclick=()=>{
//			var url=getGameURL(gt);
//			updateJukeBox(url+'/scraper/jukebox',0,(data)=>{
//				var a={base:url+'/scraper/jukebox/',dir:[],file:[]}
//				for(var b of data.dirs){
//					// from ./ 
//					a.dir.push(b.substring(2));
//				}
//				for(var b of data.files){
//					// from ./ 
//					a.file.push(b.substring(2));
//				}
//				return a;
//			},()=>{
//				main.innerHTML='';
//				main.append(panel_mainboard);
//			});
//		}
//	}
//
//	if(gt.slideshowAvailable=='true'){
//		btn=quickhtml({
//			target:btntray,
//			tag:'button',
//			sub:['SlideShow'],
//		});
//		btn.onclick=()=>{
//			var url=getGameURL(gt);
//			updateImageViewer(url+'/scraper/slideshow',0,(data)=>{
//				var a={base:url+'/scraper/slideshow/',dir:[],file:[]}
//				for(var b of data.dirs){
//					// from ./ 
//					a.dir.push(b.substring(2));
//				}
//				for(var b of data.files){
//					// from ./ 
//					a.file.push(b.substring(2));
//				}
//				return a;
//			},()=>{
//				main.innerHTML='';
//				main.append(panel_mainboard);
//			});
//		}
//	}
//
//	btntray.append(createMetaButton(gt,(dst)=>{
//		if(dst.title=='')delete dst.title;
//		if(dst.sortname=='')delete dst.sortname;
//		for(var k in dst)gt[k]=dst[k];
//		if(cbchg)cbchg(dst);
//		var url='/systems/'+system_ctrl[gt.systemName].src.name+'/games';
//		var post2=url+'/'+gt.id;
//		http_post_json(post2,dst,null,(err)=>{
//			if(cberr)cberr(err);
//		});
//	}));
//
//	btn=quickhtml({
//		target:btntray,
//		tag:'button',
//		sub:['Quit'],
//	});
//	btn.onclick=()=>{
//		if(cbquit)cbquit();
//	}
//	var confirmloc=quickhtml({
//		target:panel_gameview,
//		tag:'div',
//	});
//
//	updateLaunchControl(launchloc,confirmloc,()=>{
//		var launch=()=>{
//			launchGame(gt.path,()=>{
//				quickhtml({
//					target:confirmloc,
//					tag:'span',
//					sub:['enjoy!']
//				});
//			},(err)=>{
//				showError(confirmloc,err);
//			});
//		}
//		killGame(()=>{launch();},()=>{launch();});
//	},()=>{
//	});
//
//
//	for(var it in es_caps.Books){
//		var frm=quickhtml({
//			target:panel_gameview,
//			tag:'p',
//		});
//
//		var path=gt[it];
//		var captloc=quickhtml({
//			target:frm,
//			tag:'span',
//		});
//		updateMediaCaption(captloc,es_caps.Books[it],path);
//		quickhtml({target:frm,tag:'span',sub:[' ']});
//		var btnloc=quickhtml({
//			target:frm,
//			tag:'span',
//		});
//		var pnlloc=quickhtml({
//			target:frm,
//			tag:'div',
//		});
//		((it_)=>{
//			updateReplacer(gt,it_,btnloc,pnlloc,filterType('text','es'),(url)=>{
//				updateMediaCaption(captloc,es_caps.Books[it_]??'',url);
//			});
//		})(it);
//	}
//
//	if(gt.docsAvailable=='true'){
//		quickhtml({target:panel_gameview,tag:'hr'});
//
//		var list=quickhtml({target:panel_gameview,tag:'div',sub:['Now Loading...']});
//
//		var pref='/systems/'+gt.systemName+'/games/'+gt.id+'/scraper/';
//		http_get_json(pref+'docs.json',(data)=>{
//			list.innerHTML='';
//			for(var it in data){
//				var path=data[it];
//				var frm=quickhtml({
//					target:list,
//					tag:'p',
//				});
//				updateMediaCaption(frm,it,(path.indexOf(':')<0)?(pref+encodeURI(path)):path);
//			}
//		},(err)=>{
//			list.innerHTML='';
//			list.append(quickhtml({
//				tag:'span',
//				attr:{class:'instanterror'},
//				sub:[JSON.stringify(err)],
//			}));
//		});
//	}
//
//	for(var it in es_caps.Videos){
//		var frm=quickhtml({
//			target:panel_gameview,
//			tag:'div',
//			attr:{class:'imgframe'},
//		});
//
//		var path=gt[it];
//
//		updateMediaCaption(frm,es_caps.Videos[it]);
//		quickhtml({target:frm,tag:'span',sub:[' ']});
//		var btnloc=quickhtml({
//			target:frm,
//			tag:'span',
//		});
//		var pnlloc=quickhtml({
//			target:frm,
//			tag:'div',
//		});
//		var imgloc=quickhtml({
//			target:frm,
//			tag:'div',
//		});
//		var imgtray={loc:imgloc,elem:null};
//		((it_,imgtray_)=>{
//			updateReplacer(gt,it_,btnloc,pnlloc,filterType('video','es'),(url)=>{
//				updateMediaView(gt,it_,imgtray_,url);
//			});
//		})(it,imgtray);
//		updateMediaView(gt,it,imgtray,path);
//	}
//	for(var it in es_caps.Images){
//		var frm=quickhtml({
//			target:panel_gameview,
//			tag:'div',
//			attr:{class:'imgframe'},
//		});
//
//		var path=gt[it];
//
//		updateMediaCaption(frm,es_caps.Images[it]);
//		quickhtml({target:frm,tag:'span',sub:[' ']});
//		var btnloc=quickhtml({
//			target:frm,
//			tag:'span',
//		});
//		var pnlloc=quickhtml({
//			target:frm,
//			tag:'div',
//		});
//		var imgloc=quickhtml({
//			target:frm,
//			tag:'div',
//		});
//		var imgtray={loc:imgloc,elem:null};
//		((it_,imgtray_)=>{
//			updateReplacer(gt,it_,btnloc,pnlloc,filterType('image','es'),(url)=>{
//				updateMediaView(gt,it_,imgtray_,url);
//			});
//		})(it,imgtray);
//		updateMediaView(gt,it,imgtray,path);
//	}
//
//	var btn=quickhtml({
//		target:panel_gameview,
//		tag:'button',
//		sub:['Quit'],
//	});
//	btn.onclick=()=>{
//		if(cbquit)cbquit();
//	}
//
//	panel_sysview.append(panel_gameview);
//}
//
//function exportTSV(st,data){
//	var cols=['ID','Platform','Path','Powered','Caption','Title','Sortable','Family','Rating','Runa','Favo','Hide','Kids','Reg','Lang','Date','Developer','Publisher','Players']
//	var t=[cols.join("\t")]
//
//	for(var gt of data){
//		if(!gt.id)continue;
//		if(!gt.systemName)continue;
//		if(!gt.path)continue;
//		var d=[]
//		d.push(gt.id);
//		d.push(gt.systemName);
//		// from /userdata/roms/SystemName/ 
//		d.push(gt.path.substring(16+gt.systemName.length));
//		d.push(gt.arcadesystemname??'');
//		d.push(gt.name??'');
//		d.push(gt.title??'');
//		d.push(gt.sortname??'');
//		d.push(gt.family??'');
//		var rating=parseFloat(gt.rating);
//		if(isNaN(rating))rating='';
//		else rating=Math.floor(rating*5+0.5);
//		if(!rating)rating='';
//		d.push(rating);
//		d.push((gt.runnable=='true')?1:0);
//		d.push((gt.favorite=='true')?1:0);
//		d.push((gt.hidden=='true')?1:0);
//		d.push((gt.kidgame=='true')?1:0);
//		d.push(gt.region??'');
//		d.push(gt.lang??'');
//		var date=parseDate(gt.releasedate);
//		d.push(isNaN(d)?'':(new Date(date).toISOString().substring(0,10)));
//		t.push(d.join("\t"));
//		d.push(gt.developer??'');
//		d.push(gt.publisher??'');
//		d.push(gt.players??'');
//	}
//
//	return t.join("\n")+"\n";
//}
//
//function importTSV(st,data,tsv,cbok,cbng){
//
//	var lines=tsv.split("\n");
//	if(lines.length<2){
//		console.log('no enough lines');
//		return;
//	}
//	var hd={}
//	var ha=lines.shift().trimEnd().split("\t");
//	for(var i in ha)hd[ha[i]]=i;
//
//	if(!('ID' in hd) && !('Platform' in hd) && !('Path' in hd)){
//		console.log('no enough columns');
//		return;
//	}
//	var dd={}
//	for(var i in data)dd[data[i].id]=i;
//	for(var s of lines){
//		if(!s)continue;
//		var sa=s.trimEnd().split("\t");
//		var id=sa[hd.ID];
//console.log(id+'; '+sa[hd.Path]);
//		if(!(id in dd)){
//			console.log(id+': not found');
//			continue;
//		}
//		var gt=data[dd[id]];
//		if(sa[hd.Platform]!=gt.systemName){
//			console.log(id+': System misimatch; '+sa[hd.System]+'/'+gt.systemName);
//			continue;
//		}
//		var dpath=gt.path.substring(16+gt.systemName.length);
//		if(sa[hd.Path]!=dpath){
//			console.log(id+': System misimatch; '+sa[hd.Path]+'/'+dpath);
//			continue;
//		}
//		var dst={}
//		// 単純文字列系 
//		var meta={
//			'Powered':'arcadesystemname',
//			'Caption':'name',
//			'Title':'title',
//			'Sortable':'sortname',
//			'Family':'family',
//			'Reg':'region',
//			'Lang':'lang',
//			'Developer':'developer',
//			'Publisher':'publisher',
//			'Players':'players',
//		}
//		for(var m in meta){
//			if(!(m in hd))continue;
//			var sv=sa[hd[m]]??'';
//			var dv=gt[meta[m]]??'';
//			if(sv!=dv)dst[meta[m]]=sv;
//		}
//		// フラグ系 
//		meta={
//			'Runa':'runnable',
//			'Favo':'favorite',
//			'Hide':'hidden',
//			'Kids':'kidgame',
//		}
//		for(var m in meta){
//			if(!(m in hd))continue;
//			var sv=sa[hd[m]]??'';
//			if(sv!='')sv=(parseInt(sv))?'true':'false';
//			var dv=gt[meta[m]]??'';
//			if(sv!=dv)dst[meta[m]]=sv;
//		}
//		// 特殊 
//		if('Rating' in hd){
//			if(!(m in hd))continue;
//			var sv=parseInt(sa[hd.Rating])??0;
//			if(isNaN(sv))sv=0;
//			else sv=ratingscore[sv];
//			var dv=gt.rating??0;
//			if(sv!=dv)dst.rating=sv;
//		}
//		if('Date' in hd){
//			if(!(m in hd))continue;
//			var sv=parseDate(sa[hd.Date]??'');
//			var dv=parseDate(gt.releasedate??'');
//			if(sv!=dv)dst.releasedate=sv?(new Date(sv).toISOString()):'';
//		}
//		for(var k in dst)gt[k]=dst[k];
//		var url='/systems/'+gt.systemName+'/games/'+gt.id;
//		http_post_json(url,dst,(data)=>{
//			if(cbok)cbok();
//		},(err)=>{
//			console.log(err.toString()+'; '+url+': '+JSON.stringify(dst));
//			if(cbng)cbng(err);
//		});
//	}
//}
//
//function updateGameList(ctrl){
//
//	panel_sysview.innerHTML='';
//	panel_gamelist.innerHTML='';
//
//	var st=ctrl.src;
//	quickhtml({
//		target:panel_gamelist,
//		tag:'div',
//		sub:[quickhtml({
//			tag:'img',
//			attr:{src:st.logo,alt:st.fullname,class:'systemicon'},
//		})],
//	});
//
//	var games=quickhtml({
//		target:panel_gamelist,
//		tag:'div',
//		sub:['Now Loading...'],
//	});
//
//	var url='/systems/'+st.name+'/games';
//	http_get_json(url,(data)=>{
//
//		if(data.length<1){
//			games.innerHTML='no entries';
//			return;
//		}
//
//		data.sort((a,b)=>{return a.name<b.name?-1:1});
//
//		games.innerHTML='';
//
//		var saver=quickhtml({
//			target:games,
//			tag:'a',
//		});
//
//		var btn=quickhtml({
//			target:games,
//			tag:'button',
//			sub:['Export'],
//		});
//		btn.onclick=()=>{
//			var blob=new Blob([exportTSV(st,data)],{type:'text/tab-separated-values'});
//			saver.href=URL.createObjectURL(blob);
//			saver.download=st.name+'.tsv';
//			saver.click();
//		}
//
////		var srcfile=null;
//		btn=quickhtml({
//			target:games,
//			tag:'button',
//			sub:['Import'],
//		});
//		var chsloc=quickhtml({
//			target:games,
//			tag:'span',
//		});
//		var pnlloc=quickhtml({
//			target:games,
//			tag:'div',
//		});
//
//		var chooser=createFileChooser(false,chsloc,pnlloc,'.tsv','Import',(n,tsv)=>{
//			importTSV(st,data,tsv,()=>{
//				updateGameList(ctrl);
//			},(err)=>{
//				updateGameList(ctrl);
//			});
//		},()=>{
//			updateGameList(ctrl)
//		});
//		btn.onclick=()=>{
//			chooser.open();
//		}
//
//		var tbl=quickhtml({
//			target:games,
//			tag:'table',
//			attr:{border:'border',class:'gamelist'},
//		});
//
//		var tr=quickhtml({
//			target:tbl,
//			tag:'tr',
//			sub:[
//				quickhtml({tag:'th',sub:['Name']}),
//				quickhtml({tag:'th',sub:['System']}),
//				quickhtml({tag:'th',sub:['Count']}),
//				quickhtml({tag:'th',sub:['Total Time']}),
//				quickhtml({tag:'th',sub:['Last Played']}),
//				quickhtml({tag:'th',sub:['Rating']}),
//				quickhtml({tag:'th',sub:['Etc']}),
//			],
//		});
//
//		for(var gt of data){
//			((gt_)=>{
//				var post2=url+'/'+gt_.id;
//				var errview=createInstantErrorView(7);
//				var c_rating=createRatingControl(gt_,(score)=>{
//					gt_.rating=ratingscore[score];
//					errview.clear();
//					http_post_json(post2,{rating:gt_.rating},null,(err)=>{
//						errview.put(err);
//					});
//				});
//				var c_favorite=createFavoriteButton(gt_,(f)=>{
//					gt_.favorite=f?'true':'false';
//					errview.clear();
//					http_post_json(post2,{favorite:gt_.favorite},null,(err)=>{
//						errview.put(err);
//					});
//				});
//				var c_hidden=createHiddenButton(gt_,(f)=>{
//					gt_.hidden=f?'true':'false';
//					errview.clear();
//					http_post_json(post2,{hidden:gt_.hidden},null,(err)=>{
//						errview.put(err);
//					});
//				});
//				tr=quickhtml({
//					target:tbl,
//					tag:'tr',
//					sub:[
//						quickhtml({tag:'td',attr:{class:'tblcapt'},sub:[gt_.name]}),
//						quickhtml({tag:'td',attr:{class:'tblcapt'},sub:[gt_.systemName]}),
//						quickhtml({tag:'td',attr:{class:'tblnum'},sub:[gt_.playcount]}),
//						quickhtml({tag:'td',attr:{class:'tblnum'},sub:[createSecondsTime(gt_.gametime)]}),
//						quickhtml({tag:'td',attr:{class:'tblnum'},sub:[createDateTime(gt_.lastplayed)]}),
//						quickhtml({tag:'td',attr:{class:'tblstar'},sub:[c_rating.view]}),
//						quickhtml({tag:'td',attr:{class:'tbltool'},sub:[
//							c_favorite.view,
//							c_hidden.view,
//							createDetailButton(gt_,()=>{
//								panel_sysview.innerHTML='';
//								panel_sysview.append(panel_gamelist);
//							},(dst)=>{
//								errview.clear();
//								c_rating.set(Math.floor(dst.rating*5+0.5));
//								c_favorite.set(dst.favorite=='true');
//								c_hidden.set(dst.hidden=='true');
//							},(err)=>{
//								errview.put(err);
//							}),
//						]}),
//					],
//				});
//				tr=quickhtml({target:tbl,tag:'tr',sub:[errview.view]});
//			})(gt);
//		}
//	},(err)=>{
//		games.innerHTML=JSON.stringify(err);
//	});
//
//	panel_sysview.append(panel_gamelist);
//}
//
//function updateJukeBox(url,depth,onload,onquit){
//
//	panel_imageviewer.innerHTML='';
//	main.innerHTML='';
//
//	var head=quickhtml({
//		target:panel_imageviewer,
//		tag:'div',
//		attr:{class:'audiohead'},
//	});
//	var tool=quickhtml({
//		target:head,
//		tag:'div',
//		attr:{class:'imagetool'},
//	});
//	var ctrl=quickhtml({
//		target:tool,
//		tag:'div',
//		attr:{class:'audioctrl'},
//	});
//	var btns=quickhtml({
//		target:tool,
//		tag:'div',
//		attr:{class:'imagebtns'},
//	});
//	var btnq=quickhtml({
//		target:btns,
//		tag:'button',
//		attr:{class:'imagebtn'},
//		sub:['×']
//	});
//	var view=quickhtml({
//		target:panel_imageviewer,
//		tag:'div',
//		attr:{class:'imageview'},
//	});
//	var dirsel=quickhtml({
//		target:view,
//		tag:'div',
//		attr:{class:'imagedir'},
//	});
//	var selector=quickhtml({
//		target:view,
//		tag:'div',
//	});
//	main.append(panel_imageviewer);
//
//	btnq.onclick=()=>{
//		onquit();
//	}
//
//	ctrl.innerHTML='Now Loading...';
//	http_get_json(url,(data)=>{
//		var attr=onload(data);
//
//		attr.dir.sort((a,b)=>{return (a<b)?-1:1});
//		attr.file.sort((a,b)=>{return (a<b)?-1:1});
//
//		ctrl.innerHTML='';
//		var titleboard=quickhtml({
//			target:ctrl,
//			tag:'div',
//			attr:{class:'music_title'},
//		});
//		var playboard=quickhtml({
//			target:ctrl,
//			tag:'div',
//			attr:{class:'music_play'},
//		});
//		var optboard=quickhtml({
//			target:ctrl,
//			tag:'div',
//			attr:{class:'music_opt'},
//		});
//
//		var playmode='';
//		var playnext=()=>{}
//		var optbtns={
//			manual:quickhtml({
//				target:optboard,
//				tag:'button',
//				attr:{class:'music_mode_off'},
//				sub:['Manual']
//			}),
//			repeat:quickhtml({
//				target:optboard,
//				tag:'button',
//				attr:{class:'music_mode_off'},
//				sub:['Repeat']
//			}),
//			sequence:quickhtml({
//				target:optboard,
//				tag:'button',
//				attr:{class:'music_mode_off'},
//				sub:['Sequence']
//			}),
//			random:quickhtml({
//				target:optboard,
//				tag:'button',
//				attr:{class:'music_mode_off'},
//				sub:['Random']
//			}),
//		}
//
//		var to=null;
//		var opt_select=(mode)=>{
//			if(mode==playmode)return false;
//			if(playmode)optbtns[playmode].setAttribute('class','music_mode_off');
//			playmode=mode;
//			optbtns[mode].setAttribute('class','music_mode_on');
//			return true;
//		}
//		optbtns.manual.onclick=()=>{
//			if(!opt_select('manual'))return;
//			if(to)to.abort();
//			to=null;
//			playnext=()=>{}
//		}
//		optbtns.repeat.onclick=()=>{
//			if(!opt_select('repeat'))return;
//			if(to)to.abort();
//			to=null;
//			playnext=()=>{show(cur,true);}
//		}
//		optbtns.sequence.onclick=()=>{
//			if(!opt_select('sequence'))return;
//			playnext=()=>{
//				var next=parseInt(cur)+1;
//				if(next>=max)next=0;
//				if(to)to.abort();
//				to=delayExec(3000,()=>{show(next,true);});
//			}
//		}
//		optbtns.random.onclick=()=>{
//			if(!opt_select('random'))return;
//			playnext=()=>{
//				var next=Math.floor(Math.random()*max);
//				if(to)to.abort();
//				to=delayExec(3000,()=>{show(next,true);});
//			}
//		}
//		optbtns.manual.click();
//
//		var cur=-1;
//		var show=(idx,play)=>{
//			var name=attr.file[idx];
//			var url=attr.base+name;
//			titleboard.innerHTML=name;
//			playboard.innerHTML='';
//			var p=quickhtml({
//				target:playboard,
//				tag:'audio',
//				attr:{controls:'controls'},
//				sub:[quickhtml({tag:'source',attr:{src:url}})
//			]});
//			p.onended=(ev)=>{playnext();}
//			if(cur>=0)trs[cur].setAttribute('class','music_listed');
//			cur=idx;
//			trs[idx].setAttribute('class','music_current');
//			if(play)p.setAttribute('autoplay','autoplay');
//		}
//
//		var dirs=attr.dir;
//		if(depth>0)dirs.unshift('..');
//		for(var name of dirs){
//			var btn=quickhtml({
//				target:dirsel,
//				tag:'button',
//				sub:[name]
//			});
//			((name_,btn_)=>btn_.onclick=()=>{
//				var url=attr.base+name_+'/';
//				updateJukeBox(url,depth+((name=='..')?-1:+1),(data)=>{
//					var a={base:url,dir:[],file:[]}
//					for(var b of data.dirs){
//						// from ./ 
//						a.dir.push(b.substring(2));
//					}
//					for(var b of data.files){
//						// from ./ 
//						a.file.push(b.substring(2));
//					}
//					return a;
//				},onquit);
//			})(name,btn);
//		}
//
//		var tbl=quickhtml({
//			target:selector,
//			tag:'table',
//			attr:{class:'music_list',align:'center',border:'border'},
//		});
//		var trs=[]
//		for(var idx in attr.file){
//			var tr=quickhtml({
//				target:tbl,
//				tag:'tr',
//				attr:{class:'music_listed'},
//			});
//			trs.push(tr);
//			var btntray=quickhtml({
//				target:tr,
//				tag:'td',
//			});
//			quickhtml({
//				target:tr,
//				tag:'td',
//				sub:[attr.file[idx]]
//			});
//			var btn=quickhtml({
//				target:btntray,
//				tag:'button',
//				sub:['Play']
//			});
//			((idx_)=>{
//				btn.onclick=()=>{show(idx_,true);}
//			})(idx);
//		}
//
//		var max=attr.file.length;
//		if(max>0){
//			show(0,false);
//		}
//		else{
//			titleboard.innerHTML='(empty)';
//		}
//
//	},(err)=>{
//		ctrl.innerHTML=JSON.stringify(err);
//	});
//}
//
//function showImage(title,canvas,capt,url,play,onend){
//
//	title.innerHTML=capt;
//	canvas.innerHTML='';
//
//	var to=null;
//	switch(getMajorMediaType(url)){
//		case 'video':
//		var p=quickhtml({
//			target:canvas,
//			tag:'video',
//			attr:{controls:'controls'},
//			style:{'max-width':'100%'},
//			sub:[quickhtml({tag:'source',attr:{src:url}})
//		]});
//		p.onended=(ev)=>{
//			if(onend)onend();
//		}
//		if(play)p.setAttribute('autoplay','autoplay');
//		break;
//
//		case 'audio':
//		var p=quickhtml({
//			target:canvas,
//			tag:'audio',
//			attr:{controls:'controls'},
//			sub:[quickhtml({tag:'source',attr:{src:url}})
//		]});
//		p.onended=(ev)=>{
//			if(onend)onend();
//		}
//		if(play)p.setAttribute('autoplay','autoplay');
//		break;
//
//		case 'image':
//		quickhtml({
//			target:canvas,
//			tag:'img',
//			attr:{src:url},
//			style:{'max-width':'100%'},
//		});
//		to=delayExec(2000,()=>{
//			if(onend)onend();
//		});
//		break;
//
//		default:
//		quickhtml({
//			target:canvas,
//			tag:'div',
//			sub:['(Unknown Type)']
//		});
//	}
//	return to;
//}
//
//function updateImageViewer(url,depth,onload,onquit){
//
//	panel_imageviewer.innerHTML='';
//	main.innerHTML='';
//
//	var head=quickhtml({
//		target:panel_imageviewer,
//		tag:'div',
//		attr:{class:'imagehead'},
//	});
//	var tool=quickhtml({
//		target:head,
//		tag:'div',
//		attr:{class:'imagetool'},
//	});
//	var ctrl=quickhtml({
//		target:tool,
//		tag:'div',
//		attr:{class:'imagectrl'},
//	});
//	var btnbar=quickhtml({
//		target:tool,
//		tag:'div',
//		attr:{class:'imagebtns'},
//	});
//	var btns={
//		ss_off:quickhtml({
//			target:btnbar,
//			tag:'button',
//			attr:{class:'ssmode_off'},
//			sub:['Off']
//		}),
//		ss_seq:quickhtml({
//			target:btnbar,
//			tag:'button',
//			attr:{class:'ssmode_off'},
//			sub:['Seq']
//		}),
//		ss_rnd:quickhtml({
//			target:btnbar,
//			tag:'button',
//			attr:{class:'ssmode_off'},
//			sub:['Rnd']
//		}),
//		left:quickhtml({
//			target:btnbar,
//			tag:'button',
//			attr:{class:'imagebtn'},
//			sub:['←']
//		}),
//		right:quickhtml({
//			target:btnbar,
//			tag:'button',
//			attr:{class:'imagebtn'},
//			sub:['→']
//		}),
//		quit:quickhtml({
//			target:btnbar,
//			tag:'button',
//			attr:{class:'imagebtn'},
//			sub:['×']
//		}),
//	}
//	var view=quickhtml({
//		target:panel_imageviewer,
//		tag:'div',
//		attr:{class:'imageview'},
//	});
//	var dirsel=quickhtml({
//		target:view,
//		tag:'div',
//		attr:{class:'imagedir'},
//	});
//	var canvas=quickhtml({
//		target:view,
//		tag:'div',
//		attr:{class:'imagecanvas'},
//	});
//	main.append(panel_imageviewer);
//
//	btns.quit.onclick=()=>{
//		onquit();
//	}
//
//	ctrl.innerHTML='Now Loading...';
//	http_get_json(url,(data)=>{
//		var attr=onload(data);
//		var cur=0;
//
//		attr.dir.sort((a,b)=>{return (a<b)?-1:1});
//		attr.file.sort((a,b)=>{return (a<b)?-1:1});
//
//		var to=null;
//		var show=(idx,play)=>{
//			cur=idx;
//			var name=attr.file[idx];
//			var url=attr.base+name;
//			if(to)to.abort();
//			to=showImage(ctrl,canvas,name,url,play,ssnext);
//		}
//
//		var dirs=attr.dir;
//		if(depth>0)dirs.unshift('..');
//		for(var name of dirs){
//			var btn=quickhtml({
//				target:dirsel,
//				tag:'button',
//				sub:[name]
//			});
//			((name_,btn_)=>btn_.onclick=()=>{
//				var url=attr.base+name_+'/';
//				updateImageViewer(url,depth+((name=='..')?-1:+1),(data)=>{
//					var a={base:url,dir:[],file:[]}
//					for(var b of data.dirs){
//						// from ./ 
//						a.dir.push(b.substring(2));
//					}
//					for(var b of data.files){
//						// from ./ 
//						a.file.push(b.substring(2));
//					}
//					return a;
//				},onquit);
//			})(name,btn);
//		}
//
//		var max=attr.file.length;
//		if(max>0){
//			show(cur,false);
//			btns.left.onclick=()=>{
//				cur=(cur+max-1)%max;
//				show(cur,false);
//			}
//			btns.right.onclick=()=>{
//				cur=(cur+1)%max;
//				show(cur,false);
//			}
//		}
//		else{
//			ctrl.innerHTML='(empty)';
//			btns.left.onclick=()=>{}
//			btns.right.onclick=()=>{}
//			return;
//		}
//
//		var ssmode='';
//		var ssnext=()=>{}
//		var ss_select=(mode)=>{
//			if(mode==ssmode)return false;
//			if(ssmode)btns['ss_'+ssmode].setAttribute('class','ssmode_off');
//			ssmode=mode;
//			btns['ss_'+ssmode].setAttribute('class','ssmode_on');
//			return true;
//		}
//		btns.ss_off.onclick=()=>{
//			if(!ss_select('off'))return;
//			if(to)to.abort();
//			to=null;
//			ssnext=()=>{}
//		}
//		btns.ss_seq.onclick=()=>{
//			if(!ss_select('seq'))return;
//			if(to)to.abort();
//			to=null;
//			ssnext=()=>{
//				var next=(cur+1)%max;
//				to=delayExec(3000,()=>{show(next,true);});
//			}
//			ssnext();
//		}
//		btns.ss_rnd.onclick=()=>{
//			if(!ss_select('rnd'))return;
//			if(to)to.abort();
//			to=null;
//			ssnext=()=>{
//				var next=Math.floor(Math.random()*max);
//				to=delayExec(3000,()=>{show(next,true);});
//			}
//			ssnext();
//		}
//		btns.ss_off.click();
//
//	},(err)=>{
//		ctrl.innerHTML=JSON.stringify(err);
//	});
//}

var objviewopt={
	style_field:'objview_field',
	style_caption:'objview_caption',
	style_key:'objview_key',
	style_value:'objview_value',
}

var rightpane_requesting=null;

function unrequest(){

	if(rightpane_requesting){
		rightpane_requesting.abort();
		rightpane_requesting=null;
	}
}

function crumbview(src){

	var div=quickhtml({tag:'div'});
	safeeachobject(src,(k,v)=>{
		var btn=quickhtml({
			target:div,
			tag:'button',
			sub:[k]
		});
		if(v){
			btn.onclick=v;
		}
		else{
			btn.setAttribute('disabled','disabled');
		}
		return true;
	});
	return div;
}

function progress(cbreq){

	unrequest();

	panel_rightpane.innerHTML='';
	quickhtml({
		target:panel_rightpane,
		tag:'div',
		sub:['Wait for it...']
	});
	var btn=quickhtml({
		target:panel_rightpane,
		tag:'button',
		sub:['Cancel']
	});

	var prc={
		ok:(view)=>{
			panel_rightpane.innerHTML='';
			panel_rightpane.append(view);
		},
		ng:(err)=>{
			panel_rightpane.innerHTML='';
			panel_rightpane.append(err.toString());
		},
	}

	rightpane_requesting=cbreq();
	btn.onclick=()=>{
		rightpane_requesting.abort();
		rightpane_requesting=null;
	}
	return prc;
}

function callGet(path){

	var prc=progress(()=>es_client.get_text(path,
	(data)=>{
		prc.ok('Done');
	},
	(err)=>{
		prc.ng(err);
	}));
}

function getText(path){

	var prc=progress(()=>es_client.get_text(path,
	(data)=>{
		prc.ok(data);
	},
	(err)=>{
		prc.ng(err);
	}));
}

function getJSON(path){

	var prc=progress(()=>es_client.get_json(path,
	(data)=>{
		prc.ok(objview(data,objviewopt));
	},
	(err)=>{
		prc.ng(err);
	}));
}

function getCaps(path){

	var prc=progress(()=>es_client.get_json(path,
	(data)=>{
		if(!data.Flags)data.Flags=es_caps.Flags;
		if(!data.Texts)data.Texts=es_caps.Texts;
		if(!data.Videos)data.Videos=es_caps.Videos;
		if(!data.Images)data.Images=es_caps.Images;
		es_caps=data;
		prc.ok(objview(data,objviewopt));
	},
	(err)=>{
		prc.ng(err);
	}));
}

function mediaview(url,type=null){

	if(!type)type=getMajorMediaType(url);
	switch(type){
		case 'image':
		return quickhtml({
			tag:'img',
			attr:{src:url},
			style:{'max-width':'100%'},
		});

		case 'video':
		return quickhtml({
			tag:'video',
			attr:{controls:'controls',autoplay:'autoplay'},
			style:{'max-width':'100%'},
			sub:[quickhtml({tag:'source',attr:{src:url}})
		]});

		case 'audio':
		return quickhtml({
			tag:'audio',
			attr:{controls:'controls',autoplay:'autoplay'},
			sub:[quickhtml({tag:'source',attr:{src:url}})
		]});
	}

	return quickhtml({
		tag: 'div',
		sub:['Unknown type for '+url]
	});
}

function getAGame(sdata,gid){

	var sname=sdata.name;

	var prc=progress(()=>es_client.get_json('/systems/'+sname+'/games/'+gid,
	(data)=>{
		var div=quickhtml({tag:'div'});
		var crumb={}
		crumb['Systems']=()=>{getSystems();}
		crumb[sname]=()=>{getASystem(sname);}
		crumb['Games']=()=>{getGames(sdata);}
		crumb['launch']=()=>{
			es_client.post_text('/launch',data.path);
		}
		div.append(crumbview(crumb));
		if(sname=='imageviewer'){
			div.append(quickhtml({
				tag:'fieldset',
				sub:[
					quickhtml({tag:'legend',sub:['Image']}),
					mediaview(es_client.makeurl(data.path.substring(9))),
				]
			}));
		}
		else{
			div.append(metaedit(data));
		}
		prc.ok(div);
	},
	(err)=>{
		prc.ng(err);
	}));
}

function getGames(sdata,page=0){

	var sname=sdata.name;

	var pgsuf='';
	if(gamelist_pagenation && es_caps.PartialGameList){
		pgsuf='_partial/'+(page*gamelist_pagenation)+'/'+gamelist_pagenation;
	}

	var prc=progress(()=>es_client.get_json('/systems/'+sname+'/games'+pgsuf,
	(data)=>{
		var div=quickhtml({tag:'div'});
		var crumb={}
		crumb['Systems']=()=>{getSystems();}
		crumb[sname]=()=>{getASystem(sname);}
		div.append(crumbview(crumb));
		if(gamelist_pagenation && es_caps.PartialGameList){
			crumb={}
			var pages=Math.ceil(sdata.visibleGames/gamelist_pagenation);
console.log(''+(page+1)+'/'+pages+' in '+sdata.visibleGames+' titles');
			safeeachnumber(0,pages,1,(i)=>{
				crumb[i+1]=(i==page)?null:()=>{getGames(sdata,i);}
				return true;
			});
			div.append(crumbview(crumb));
		}
		safeeacharray(data,(gt)=>{
			var ov=objview(gt,objviewopt);
			var lg=quickhtml({target:ov,tag:'legend'});
			var btn=quickhtml({target:lg,tag:'button',sub:[gt.name]});
			btn.onclick=()=>getAGame(sdata,gt.id);
			div.append(ov);
			return true;
		});
		prc.ok(div);
	},
	(err)=>{
		prc.ng(err);
	}));
}

function getASystem(sname){

	var prc=progress(()=>es_client.get_json('/systems/'+sname,
	(data)=>{
		var div=quickhtml({tag:'div',});
		div.append(crumbview({
			'Systems':()=>{getSystems();},
			'Games':()=>{getGames(data);},
		}));
		div.append(objview(data,objviewopt,sname));
		div.append(quickhtml({
			tag:'fieldset',
			sub:[
				quickhtml({tag:'legend',sub:['Logo']}),
				quickhtml({
					tag:'img',
					attr:{src:es_client.makeurl('/systems/'+sname+'/logo')},
					style:{'max-width':'100%'},
				})
			]
		}));
		prc.ok(div);
	},
	(err)=>{
		prc.ng(err);
	}));
}

function getSystems(){

	var prc=progress(()=>es_client.get_json('/systems',
	(data)=>{
		var div=quickhtml({tag:'div'});
		safeeacharray(data,(st)=>{
			var ov=objview(st,objviewopt);
			var lg=quickhtml({target:ov,tag:'legend'});
			var btn=quickhtml({target:lg,tag:'button',sub:[st.name]});
			btn.onclick=()=>getASystem(st.name);
			div.append(ov);
			return true;
		});
		prc.ok(div);
	},
	(err)=>{
		prc.ng(err);
	}));
}

function notify(){

	unrequest();

	panel_rightpane.innerHTML='';

	var btn_n=quickhtml({tag:'button',sub:['Notify']});
	var btn_m=quickhtml({tag:'button',sub:['Message']});
	var form_n=quickhtml({tag:'input',attr:{type:'text'}});
	var form_m=quickhtml({tag:'textarea'});

	btn_n.onclick=()=>{
		es_client.post_text('/notify',form_n.value);
	}
	btn_m.onclick=()=>{
		es_client.post_text('/messagebox',form_m.value);
	}

	quickhtml({
		target:panel_rightpane,
		tag:'fieldset',
		sub:[
			quickhtml({tag:'legend',sub:[btn_n]}),
			form_n
		]
	});

	quickhtml({
		target:panel_rightpane,
		tag:'fieldset',
		sub:[
			quickhtml({tag:'legend',sub:[btn_m]}),
			form_m
		]
	});
}

var testlist=[
	{caption:'Capability',func:()=>getCaps('/caps')},
	{caption:'Systems',func:()=>getSystems()},
	{caption:'RunningGame',func:()=>getJSON('/runningGame')},
	{caption:'ReloadGames',func:()=>callGet('/reloadgames')},
	{caption:'Notify',func:()=>notify()},
	{caption:'EmuKill',func:()=>callGet('/emukill')},
	{caption:'Restart',func:()=>callGet('/restart')},
	{caption:'Quit',func:()=>callGet('/quit')},
]

function updateTestList(){

	panel_leftpane.innerHTML='';

	safeeacharray(testlist,(t)=>{
		var d1=quickhtml({
			target:panel_leftpane,
			tag:'div'
		});
		var btn=quickhtml({
			target:d1,
			tag:'button',
			sub:[t.caption],
		});
		btn.onclick=t.func;
		return true;
	});

	panel_mainboard.append(panel_leftpane);
}

function updateHomeView(){

	panel_rightpane.innerHTML='';
	panel_mainboard.append(panel_rightpane);
}

function runAPITest(main){

	main.innerHTML='';
	main.append(panel_mainboard);

	panel_mainboard.innreHTML='';
	updateTestList();
	updateHomeView();
}

const apitest_ready=true;
