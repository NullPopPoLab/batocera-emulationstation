// † EmulationStation NullPopPoCustom † //
// GUI main //

const ratingscore=['0','0.2','0.4','0.6','0.8','1']
var caps={
	Version:'unknown (maybe official)',
	GenreLanguages:{
		'de':'Deutsch',
		'en':'English',
		'es':'Español',
		'fr':'Français',
		'ja':'日本語',
		'pt':'Português',
	},
	Flags:{
		'kidgame':"Kid's Game",
		'favorite':'Favorite',
		'hidden':'Hidden'
	},
	Texts:{},
	Books:{
		'manual':'Manual',
		'magazine':'Magazine'
	},
	Videos:{'video':'Video'},
	Images:{
		'thumbnail':'Box',
		'image':'Image',
		'titleshot':'Title shot',
		'bezel':'Bezel (16:9)',
		'marquee':'Logo',
		'boxart':'Alt Boxart',
		'boxback':'Box backside',
		'cartridge':'Cartridge',
		'wheel':'Wheel',
		'fanart':'Fan art',
		'mix':'Mix',
		'map':'Map',
	},
}

var system_ctrl={}
var selected_system='';

var main=document.getElementById('mainboard');

const content_type={
	audio:{
		'.mp3':{es:'audio/mpeg',fe:'audio/mpeg'},
		'.ogg':{es:'audeo/ogg',fe:'audio/ogg'},
		'.wav':{es:'audio/wav',fe:'audio/wav'},
	},
	video:{
		'.avi':{es:'video/x-msvideo',fe:'video/x-msvideo'},
		'.mkv':{es:'video/AV1',fe:'video/AV1'},
		'.mp4':{es:'video/H264',fe:'video/H264'},
		'.webm':{es:'video/webm',fe:'video/webm'},
	},
	image:{
		'.gif':{es:'image/gif',fe:'image/gif'},
		'.jpg':{es:'image/jpeg',fe:'image/jpeg'},
		'.jpeg':{es:'image/jpeg',fe:'image/jpeg'},
		'.png':{es:'image/png',fe:'image/png'},
		'.svg':{es:'image/svg+xml',fe:'image/svg+xml'},
		'.svg+sml':{es:'image/svg+xml',fe:'image/svg+xml'},
	},
	text:{
		'.cbz':{es:'application/x-cbz',fe:'vnd.comicbook+zip'},
		'.htm':{es:null,fe:'text/html'},
		'.html':{es:null,fe:'text/html'},
		'.pdf':{es:'application/pdf',fe:'application/pdf'},
		'.txt':{es:null,fe:'text/plain'},
	},
}

function filter_type(type,uc){
	var t=[]
	var reg=content_type[type]
	for(var k in reg){
		if(reg[k][uc])t.push(reg[k][uc]);
	}
	return t.join(',');
}

function getFullMediaType(path,uc){
	var p=path.lastIndexOf('.');
	var ext=(p<0)?'':path.substring(p).toLowerCase();
	if(content_type.audio[ext])return content_type.audio[ext][uc];
	if(content_type.video[ext])return content_type.video[ext][uc];
	if(content_type.image[ext])return content_type.image[ext][uc];
	if(content_type.text[ext])return content_type.text[ext][uc];
	return '';
}

function getMajorMediaType(path){
	var p=path.lastIndexOf('.');
	var ext=(p<0)?'':path.substring(p).toLowerCase();
	if(content_type.audio[ext])return 'audio';
	if(content_type.video[ext])return 'video';
	if(content_type.image[ext])return 'image';
	if(content_type.text[ext])return 'text';
	return '';
}

function delayExec(delay,exec){

	var t={
		abf:false,
		toid:setTimeout(()=>{
			if(t.abf)return;
			t.abf=true;
			if(exec)exec();
		},delay),
		abort:()=>{
			if(t.abf)return;
			t.abf=true;
			clearTimeout(t.toid);
		}
	}
	return t;
}

function retrieveCaps(cbok,cbng){

	http_get_json('/caps',(data)=>{
		if(cbok)cbok(data);
	},(err)=>{
		if(cbng)cbng(err);
	});
}

function retrieveSystems(cbok,cbng){

	http_get_json('/systems',(data)=>{
		if(cbok)cbok(data);
	},(err)=>{
		if(cbng)cbng(err);
	});
}

function retrieveRunning(cbok,cbng){

	http_get_json('/runningGame',(data)=>{
		if(cbok)cbok(data);
	},(err)=>{
		if(cbng)cbng(err);
	});
}

function reloadGames(cbok,cbng){

	http_get_text('/reloadgames',()=>{
		if(cbok)cbok();
	},(err)=>{
		if(cbng)cbng(err);
	});
}

function restartGame(cbok,cbng){

	http_get_text('/restart',()=>{
		if(cbok)cbok();
	},(err)=>{
		if(cbng)cbng(err);
	});
}

function quitGame(cbok,cbng){

	http_get_text('/quit',()=>{
		if(cbok)cbok();
	},(err)=>{
		if(cbng)cbng(err);
	});
}

function killGame(cbok,cbng){

	http_get_text('/emukill',()=>{
		if(cbok)cbok();
	},(err)=>{
		if(cbng)cbng(err);
	});
}

function launchGame(path,cbok,cbng){

	http_post_text('/launch',path,()=>{
		if(cbok)cbok();
	},(err)=>{
		if(cbng)cbng(err);
	});
}

function notify(path,cbok,cbng){

	http_post_text('/notify',path,()=>{
		if(cbok)cbok();
	},(err)=>{
		if(cbng)cbng(err);
	});
}

function message(path,cbok,cbng){

	http_post_text('/messagebox',path,()=>{
		if(cbok)cbok();
	},(err)=>{
		if(cbng)cbng(err);
	});
}

const panel_progress=quickhtml({
	tag:'div',
	sub:['Now Loading...'],
});

const panel_mainboard=quickhtml({
	tag:'div',
	attr:{class:'mainboard'},
});

const panel_modalview=quickhtml({
	tag:'div',
	attr:{class:'modalview'},
});

const panel_syslist=quickhtml({
	target:panel_mainboard,
	tag:'div',
	attr:{class:'systemlist'},
});
const panel_sysview=quickhtml({
	target:panel_mainboard,
	tag:'div',
	attr:{class:'systemview'},
});
const panel_homeview=quickhtml({
	tag:'div',
	attr:{class:'homeview'},
});
const panel_screenshots=quickhtml({
	tag:'div',
	attr:{class:'screenshots'},
});
const panel_workspace=quickhtml({
	tag:'div',
	attr:{class:'workspace'},
});
const panel_imageviewer=quickhtml({
	tag:'div',
	attr:{class:'imageviewer'},
});
const panel_gamelist=quickhtml({
	tag:'div',
	attr:{class:'gamelist'},
});
const panel_gameview=quickhtml({
	tag:'div',
	attr:{class:'gameview'},
});
const panel_genreeditor=quickhtml({
	tag:'div',
	attr:{class:'genreeditor'},
});
const panel_metaeditor=quickhtml({
	tag:'div',
	attr:{class:'metaeditor'},
});
const panel_mediaviewer=quickhtml({
	tag:'div',
	attr:{class:'mediaviewer'},
});
const panel_doclist=quickhtml({
	tag:'div',
	attr:{class:'doclist'},
});

function getSystemCaption(gt){
	return system_ctrl[gt.systemName].src.fullname;
}

function getGameCaption(gt){
	return gt.title?gt.title:gt.name;
}

function getSyetemURL(gt){
	return '/systems/'+system_ctrl[gt.systemName].src.name;
}

function getGameURL(gt){
	return getSyetemURL(gt)+'/games/'+gt.id;
}

function createSecondsTime(v){
	var h=Math.floor(v/3600);
	v-=h*3600;
	var m=Math.floor(v/60);
	v-=m*60;
	var s=Math.floor(v);
	var m2='0'+m;
	var s2='0'+s;
	return ''+h+':'+m2.substring(m2.length-2)+':'+s2.substring(s2.length-2);
}

function parseDate(v){
	if(!v)return '';
	var yp=0;
	var mp=4;
	var dp=6;
	var tp=8;
	var hp=9;
	var ip=11;
	var sp=13;
	switch(v.length){
		// YYYYMMDDThhmmss 
		case 8: case 15: break;

		// YYYY-MM-DDThh:mm:ss 
		case 10: case 19:
		mp+=1;
		dp+=2;
		tp+=2;
		hp+=2;
		ip+=3;
		sp+=4;
		break;

		default:
		return '';
	}

	var y=parseInt(v.substring(yp,yp+4));
	if(isNaN(y))return '';
	var m=parseInt(v.substring(mp,mp+2));
	if(isNaN(m))return '';
	var d=parseInt(v.substring(dp,dp+2));
	if(isNaN(d))return '';
	var t=new Date(y,m-1,d);
	if(v.substring(tp,tp+1)!='T')return t;

	var h=parseInt(v.substring(hp,hp+2));
	if(isNaN(h))return t;
	var i=parseInt(v.substring(ip,ip+2));
	if(isNaN(i))return t;
	var s=parseInt(v.substring(sp,sp+2));
	if(isNaN(s))return t;
	t.setHours(h);
	t.setMinutes(i);
	t.setSeconds(s);
	return t;
}

function createDateTime(v){
	v=parseDate(v);
	if(!v)return '';
	var t=new Date(v);
	var y=''+t.getFullYear();
	var m='0'+(t.getMonth()+1);
	var d='0'+t.getDate();
	var h='0'+t.getHours();
	var i='0'+t.getMinutes();
	var s='0'+t.getSeconds();
	return y.substring(y.length-2,y.length)+'-'+
		m.substring(m.length-2,m.length)+'-'+
		d.substring(d.length-2,d.length)+' '+
		h.substring(h.length-2,h.length)+':'+
		i.substring(i.length-2,i.length)+':'+
		s.substring(s.length-2,s.length);
}

function showError(target,err){

	quickhtml({
		target:target,
		tag:'div',
		attr:{class:'instanterror'},
		sub:[JSON.stringify(err)]
	});
}

function createRatingControl(gt,onchange){

	var v=Math.floor(gt.rating*5+0.5);
	var s=[]
	var t={
		view:quickhtml({
			tag:'span',
			attr:{title:v},
		}),
		set:(v2)=>{
			v=v2;
			for(var i=0;i<5;++i){
				s[i].setAttribute('src',
					'/resources/star_'+((i<v)?'filled.svg':'unfilled.svg'));
			}
			t.view.setAttribute('title',v);
		},
	}

	for(var i=0;i<5;++i){
		var f=(i+1)<=v;
		s[i]=quickhtml({
			target:t.view,
			tag:'img',
			attr:{src:'/resources/star_'+(f?'filled.svg':'unfilled.svg')},
		});
		((i_)=>{
			s[i_].onclick=()=>{
				var i2=(i_==0 && v==1)?(i_-1):i_;
				v=i2+1;
				t.set(v);
				onchange(v);
			}
		})(i);
	}

	return t;
}

function createFavoriteButton(gt,onchange){

	var f=gt.favorite=='true';
	var t={
		view:quickhtml({tag:'button',attr:{class:f?'btn_favorite':'btn_normal'},sub:['Favorite']}),
		set:(f2)=>{
			f=f2;
			t.view.setAttribute('class',f?'btn_favorite':'btn_normal');
		},
	}
	t.view.onclick=()=>{
		f=!f;
		t.set(f);
		onchange(f);
	}
	return t;
}

function createHiddenButton(gt,onchange){

	var f=gt.hidden=='true';
	var t={
		view:quickhtml({tag:'button',attr:{class:f?'btn_hidden':'btn_normal'},sub:['Hidden']}),
		set:(f2)=>{
			f=f2;
			t.view.setAttribute('class',f?'btn_hidden':'btn_normal');
		},
	}
	t.view.onclick=()=>{
		f=!f;
		t.set(f);
		onchange(f);
	}
	return t;
}

function createRunnableButton(gt,onchange){

	var f=gt.runnable=='true';
	var t={
		view:quickhtml({tag:'button',attr:{class:f?'btn_runnable':'btn_normal'},sub:['Runnable']}),
		set:(f2)=>{
			f=f2;
			t.view.setAttribute('class',f?'btn_runnable':'btn_normal');
		},
	}
	t.view.onclick=()=>{
		f=!f;
		t.set(f);
		onchange(f);
	}
	return t;
}

function createKidGameButton(gt,onchange){

	var f=gt.kidgame=='true';
	var t={
		view:quickhtml({tag:'button',attr:{class:f?'btn_kidgame':'btn_normal'},sub:["Kid's Game"]}),
		set:(f2)=>{
			f=f2;
			t.view.setAttribute('class',f?'btn_kidgame':'btn_normal');
		},
	}
	t.view.onclick=()=>{
		f=!f;
		t.set(f);
		onchange(f);
	}
	return t;
}

function createMetaButton(gt,onsubmit){

	var btn=quickhtml({tag:'button',sub:['Meta']});
	btn.onclick=()=>{
		updateMetaEditor(gt,onsubmit);
	}
	return btn;
}

function createDetailButton(gt,onquit,onsubmit,onerr){

	var btn=quickhtml({tag:'button',sub:['Detail']});
	btn.onclick=()=>{
		updateGameView(gt,onquit,onsubmit,onerr);
	}
	return btn;
}

function createInstantErrorView(cols)
{
	var t={
		view:quickhtml({tag:'td',attr:{colspan:cols}}),
		clear:()=>{t.view.innerHTML='';},
		put:(err)=>{
			t.view.innerHTML='';
			t.view.append(quickhtml({
				tag:'span',
				attr:{class:'instanterror'},
				sub:[JSON.stringify(err)],
			}));
		},
	}

	return t;
}

var curlang='en';
function createLangSelect(list,cbchg){

	var sel=quickhtml({
		tag:'select',
	});
	var opt=[]
	for(var s in list){
		var p=quickhtml({
			target:sel,
			tag:'option',
			attr:{value:s},
			sub:[list[s]]
		});
		if(s==curlang)p.setAttribute('selected','selected');
		opt.push(p);
	}
	sel.onchange=()=>{
		curlang=opt[sel.selectedIndex].getAttribute('value');
		if(cbchg)cbchg(curlang);
	}
	
	return sel;
}

var genrelist=null;
function extractGenre(t,xml){
	var u={id:null,parent:null,sub:[],nom:{},btn:null,chk:null,lab:null}
	for(var sub of xml.children){
		if(sub.tagName=='id')u.id=sub.innerHTML;
		else if(sub.tagName=='parent'){
			u.parent=sub.innerHTML;
		}
		else if(sub.tagName.substring(0,4)=='nom_'){
			u.nom[sub.tagName.substring(4)]=sub.innerHTML;
		}
	}
	if(!u.id){
		console.log('missing id');
		return;
	}
	if(t.flat[u.id]){
		console.log('id dubbed; '+u.id);
		return;
	}
	u.btn={
		view:quickhtml({
			target:panel_syslist,
			tag:'span',
			attr:{class:'genre_off'},
			sub:[u.nom[curlang]??u.nom.en]
		}),
		_on:false,
		isOn:()=>u.btn._on,
		cbclick:null,
		setToggle:(f)=>{
			u.btn._on=f;
			u.btn.view.setAttribute('class',f?'genre_on':'genre_off');
		},
		setLang:(lang)=>{
			u.btn.view.innerHTML=u.nom[lang]??u.nom.en;
		},
		click:()=>{
			var f=!u.btn.isOn();
			u.btn.setToggle(f);
			return f;
		}
	}
	u.btn.view.onclick=()=>{
		var f=u.btn.click();
		if(u.btn.cbclick)u.btn.cbclick(f);
		if(f){
			if(u.parent)t.flat[u.parent].btn.setToggle(true);
		}
		else{
			for(var sub of u.sub)t.flat[sub.id].btn.setToggle(false);
		}
	}
	t.flat[u.id]=u;
}
function buildGenreView(view,u){

	var dt=quickhtml({
		target:view,
		tag:u.parent?'span':'p',
		attr:{class:'genregroup'},
		sub:[' ',u.btn.view]
	});
	if(u.sub.length<1)return;

	var dd=quickhtml({
		target:dt,
		tag:'div',
	});
	for(var sub of u.sub){
		buildGenreView(dd,sub);
	}
}
function buildGenreList(xml,onsubmit){
	var t={flat:{},tree:[]}
	t.view=quickhtml({
		tag:'div',
	});

	quickhtml({
		target:t.view,
		tag:'div',
		attr:{class:'langslect'},
		sub:[createLangSelect(caps.GenreLanguages,(lang)=>{
			for(var id in t.flat){
				t.flat[id].btn.view.innerHTML=t.flat[id].nom[lang]??t.flat[id].nom.en;
		}})]
	});

	var dl=quickhtml({
		target:t.view,
		tag:'p',
		attr:{class:'genretree'}
	});

	xml=xml.children[0];
	if(!xml){
		console.log('empty xml');
		return t;
	}
	if(xml.tagName!='genres'){
		console.log('not genres');
		return t;
	}
	for(var g of xml.children){
		if(g.tagName!='genre'){
			console.log('not genre; '+g.tagName);
			continue;
		}
		extractGenre(t,g);
	}

	for(var id in t.flat){
		var u=t.flat[id];
		if(!u.parent)t.tree.push(u);
		else if(t.flat[u.parent]){
			t.flat[u.parent].sub.push(u);
		}
		else{
			console.log('missing parent; '+u.parent+'~'+u.id);
		}
	}

	for(var u of t.tree){
		buildGenreView(dl,u);
	}

	btn=quickhtml({
		target:dl,
		tag:'button',
		sub:['Submit'],
	});
	btn.onclick=()=>{
		if(onsubmit){
			var ids=[]
			var tree={}
			for(var id in t.flat){
				var u=t.flat[id];
				if(u.btn.isOn()){
					ids.push(id);
					if(u.parent){
						if(!tree[u.parent])tree[u.parent]=[]
						tree[u.parent].push(id);
					}
					else{
						if(!tree[id])tree[id]=[]
					}
				}
			}

			var nms=[]
			for(var id1 in tree){
				var u1=t.flat[id1]
				if(tree[id1].length<1){
					nms.push(u1.nom.en);
					continue;
				}

				if(caps.SaveGenreByIDs){
					var a=[]
					for(var id2 of tree[id1]){
						var u2=t.flat[id2]
						a.push(u2.nom.en);
					}
					nms.push(u1.nom.en+'('+a.join('; ')+')');
				}
				else{
					for(var id2 of tree[id1]){
						var u2=t.flat[id2]
						nms.push(u1.nom.en+' / '+u2.nom.en);
					}
				}
			}

			onsubmit(ids,nms.join(', '));
		}
	}

	return t;
}
function updateGenreList(gs){
	var t=genrelist;

	for(var id in t.flat){
		var u=t.flat[id];
		u.btn.setToggle(false);
	}
	for(var id of gs){
		var u=t.flat[id];
		if(!u)continue;
		u.btn.setToggle(true);
	}
}

function updateGenreEditor(gt,gs,onsubmit){
	gs=gs?gs.split(','):[];

	main.innerHTML='';
	panel_genreeditor.innerHTML='';

	quickhtml({
		target:panel_genreeditor,
		tag:'div',
		attr:{class:'systemcaption'},
		sub:[getSystemCaption(gt)]
	});
	quickhtml({
		target:panel_genreeditor,
		tag:'div',
		attr:{class:'gamecaption'},
		sub:[getGameCaption(gt)]
	});

	var btn=quickhtml({
		target:panel_genreeditor,
		tag:'button',
		sub:['Quit'],
	});
	btn.onclick=()=>{
		main.innerHTML='';
		main.append(panel_metaeditor);
	}

	quickhtml({
		target:panel_genreeditor,
		tag:'p',
		attr:{class:'editorcaption'},
		sub:['Genre Select'],
	});

	var view=quickhtml({
		target:panel_genreeditor,
		tag:'p',
	});

	main.append(panel_genreeditor);
	if(genrelist){
		updateGenreList(gs);
		view.innerHTML='';
		view.append(genrelist.view);
	}
	else{
		view.innerHTML='Now Loading...';
		http_get_xml('/resources/genres.xml',(xml)=>{
			genrelist=buildGenreList(xml,(ids,nms)=>{
				if(onsubmit)onsubmit(ids,nms);
				main.innerHTML='';
				main.append(panel_metaeditor);
			});
			updateGenreList(gs);
			view.innerHTML='';
			view.append(genrelist.view);
		},(err)=>{
			view.innerHTML=JSON.stringify(err.toString());
		});
	}
}

function updateMetaEditor(gt,onsubmit){

	main.innerHTML='';
	panel_metaeditor.innerHTML='';

	quickhtml({
		target:panel_metaeditor,
		tag:'div',
		attr:{class:'systemcaption'},
		sub:[getSystemCaption(gt)]
	});
	quickhtml({
		target:panel_metaeditor,
		tag:'div',
		attr:{class:'gamecaption'},
		sub:[getGameCaption(gt)]
	});

	var btn=quickhtml({
		target:panel_metaeditor,
		tag:'button',
		sub:['Quit'],
	});
	btn.onclick=()=>{
		main.innerHTML='';
		main.append(panel_mainboard);
	}

	quickhtml({
		target:panel_metaeditor,
		tag:'p',
		attr:{class:'editorcaption'},
		sub:['Meta Editor'],
	});

	const romdir='/userdata/roms/'+gt.systemName+'/';
	const romfile=gt.path.substring(romdir.length);
	var dst={}

	var tbl=quickhtml({
		target:panel_metaeditor,
		tag:'table',
		attr:{align:'center',border:'border'},
	});

	var meta={
		systemName:{capt:'Platform',type:'label'},
		romfile:{capt:'File',type:'val',func:()=>romfile},
		arcadesystemname:{capt:'Powered by',type:'lineinput'},
		name:{capt:'Captional Title',type:'lineinput'},
		title:{capt:'Formal Title',type:'lineinput'},
		sortname:{capt:'Sortable Title',type:'lineinput'},
		family:{capt:'Family',type:'lineinput'},
		desc:{capt:'Description',type:'textinput'},
		rating:{capt:'Rating',type:'rating'},
		flags:{capt:'Flags',type:'flags'},
		region:{capt:'Region',type:'lineinput'},
		lang:{capt:'Language',type:'lineinput'},
		releasedate:{capt:'Release Date',type:'date'},
		developer:{capt:'Developer',type:'lineinput'},
		publisher:{capt:'Publisher',type:'lineinput'},
		genres:{capt:'Genres',type:'genres'},
		players:{capt:'Players',type:'lineinput'},
	}
	for(var it in caps.Texts){
		meta[it]={capt:caps.Texts[it],type:'textinput'}
	}

	for(var it in meta){
		var mt=meta[it]
		var sub=[quickhtml({tag:'th',sub:[mt.capt]})]
		switch(mt.type){
			case 'label':
			sub.push(quickhtml({tag:'td',sub:[gt[it]]}));
			break;

			case 'val':
			sub.push(quickhtml({tag:'td',sub:[mt.func()]}));
			break;

			case 'lineinput':
			var ui=quickhtml({tag:'input',attr:{type:'text',class:'metatextbox',name:it,value:gt[it]??''}});
			((it_,ui_)=>{ui_.onchange=()=>{dst[it_]=ui_.value;}})(it,ui);
			sub.push(ui);
			break;

			case 'textinput':
			var ui=quickhtml({tag:'textarea',attr:{name:it,wrap:'off',class:'metatextarea'},sub:[gt[it]??'']});
			((it_,ui_)=>{ui_.onchange=()=>{dst[it_]=ui_.value;}})(it,ui);
			sub.push(ui);
			break;

			case 'date':
			var d=parseDate(gt[it]);
			d=(!d)?'':(new Date(d).toISOString().substring(0,10));
			var ui=quickhtml({tag:'input',attr:{type:'text',class:'metatextbox',name:it,value:d}});
			((it_,ui_)=>{ui_.onchange=()=>{
				d=parseDate(ui_.value);
				var d2=new Date(d).toISOString();
				var dh=d2.substring(0,4);
				var dm=d2.substring(5,7);
				var ds=d2.substring(8,10);
				dst[it_]=(!d)?'':(''+dh+dm+ds);
			}})(it,ui);
			sub.push(ui);
			break;

			case 'rating':
			var c_rating=createRatingControl(gt,(score)=>{
				dst.rating=ratingscore[score];
			});
			sub.push(c_rating.view);
			break;

			case 'flags':
			if(caps.Flags.runnable){
				var c_runnable=createRunnableButton(gt,(f)=>{
					dst.runnable=f?'true':'false';
				});
				sub.push(c_runnable.view);
			}
			var c_kidgame=createKidGameButton(gt,(f)=>{
				dst.kidgame=f?'true':'false';
			});
			sub.push(c_kidgame.view);
			var c_favorite=createFavoriteButton(gt,(f)=>{
				dst.favorite=f?'true':'false';
			});
			sub.push(c_favorite.view);
			var c_hidden=createHiddenButton(gt,(f)=>{
				dst.hidden=f?'true':'false';
			});
			sub.push(c_hidden.view);
			break;

			case 'genres':
			var btn=quickhtml({tag:'button',sub:['Edit']});
			var gv=quickhtml({tag:'span',sub:[gt.genre]});
			((gs_,gv_)=>{btn.onclick=()=>{
				updateGenreEditor(gt,gs_,(ids,nms)=>{
					dst.genres=ids.join(',');
					dst.genre=nms;
					gv_.innerHTML=dst.genre;
				});
			}})(gt.genres,gv);
			sub.push(quickhtml({tag:'td',sub:[gv,' ',btn,]}));
			break;
		}
		quickhtml({target:tbl,tag:'tr',sub:sub});
	}

	btn=quickhtml({
		target:panel_metaeditor,
		tag:'button',
		sub:['Submit'],
	});
	btn.onclick=()=>{
		main.innerHTML='';
		if(onsubmit)onsubmit(dst);
		main.append(panel_mainboard);
	}

	main.append(panel_metaeditor);
}

function updateMediaCaption(loc,label,url=null){

	loc.innerHTML='';
	quickhtml({
		target:loc,
		tag:url?'a':'span',
		attr:url?{target:'_blank',href:url,class:'mediacaption'}:{class:'mediacaption'},
		sub:[label]
	});
}

function showReplacerButton(loc,onclick){

	var btn=quickhtml({
		target:loc,
		tag:'button',
		sub:['Edit']
	});
	btn.onclick=onclick;
}

function showConfirmPanel(loc,capt,cbok,cbng){

	quickhtml({
		target:loc,
		tag:'div',
		sub:[capt]
	});

	var okbtn=quickhtml({
		target:loc,
		tag:'button',
		sub:['OK']
	});
	var ngbtn=quickhtml({
		target:loc,
		tag:'button',
		sub:['Do not']
	});

	okbtn.onclick=()=>{
		loc.innerHTML='';
		if(cbok)cbok();
	}
	ngbtn.onclick=()=>{
		loc.innerHTML='';
		if(cbng)cbng();
	}
}

function createFileChooser(bin,buttonloc,panelloc,filter,action,onload=null,oncancel=null){

	var t={
		Selected:null,
		View:null,
	}
	t.open=()=>{
		if(t.View){
			t.View.click();
			return;
		}

		t.View=quickhtml({
			target:buttonloc,
			tag:'input',
			attr:{type:'file',accept:filter},
		});
		t.View.addEventListener('cancel',()=>{
			buttonloc.innerHTML='';
			panelloc.innerHTML='';
			if(oncancel)oncancel();
		});
		t.View.addEventListener('change',(e)=>{
			var fs=e.target.files;
			if(fs<1)return;
			t.Selected=e.target.files[0];
			buttonloc.innerHTML='';
			if(!t.Selected)return;
			t.View=null;
			panelloc.innerHTML='';
			showConfirmPanel(panelloc,action+' ['+t.Selected.name+']',()=>{
//				var fd=new FileReader();
				if(onload)onload(t.Selected);

//				if(bin){
//					fd.readAsArrayBuffer(t.Selected);
//					fd.addEventListener('load',()=>{
//						if(onload)onload(t.Selected.name,fd.result);
//					});
//				}
//				else{
//					fd.readAsText(t.Selected);
//					fd.addEventListener('load',()=>{
//						if(onload)onload(t.Selected.name,fd.result);
//					});
//				}
			},()=>{
				if(oncancel)oncancel();
			});
		});
		t.View.click();
	}

	return t;
}

function showReplacerPanel(gt,it,btnloc,pnlloc,filter,cbchg){

	btnloc.innerHTML='';
	pnlloc.innerHTML='';

	var path=gt[it];
	var abbtn=quickhtml({
		target:pnlloc,
		tag:'button',
		sub:['Abort']
	});
	if(path && caps.RemoveMedia){
		var rmbtn=quickhtml({
			target:pnlloc,
			tag:'button',
			sub:['Remove']
		});
		rmbtn.onclick=()=>{
			pnlloc.innerHTML='';
			showConfirmPanel(pnlloc,'Remove this',()=>{
				var url=getGameURL(gt)+'/media/'+it;
				http_delete(url,()=>{
					if(gt[it])delete gt[it];
					if(cbchg)cbchg(null);
					updateReplacer(gt,it,btnloc,pnlloc,filter,cbchg);
				},(err)=>{
					quickhtml({
						target:pnlloc,
						tag:'div',
						sub:[err]
					});
					updateReplacer(gt,it,btnloc,pnlloc,filter,cbchg);
				});
			},()=>{
				showReplacerPanel(gt,it,btnloc,pnlloc,filter,cbchg);
			});
		}
	}
	var rgbtn=quickhtml({
		target:pnlloc,
		tag:'button',
		sub:[path?'Replace':'Register']
	});
	var chsloc=quickhtml({
		target:pnlloc,
		tag:'span',
	});

	abbtn.onclick=()=>{
		pnlloc.innerHTML='';
		updateReplacer(gt,it,btnloc,pnlloc,filter,cbchg);
	}

	var chooser=createFileChooser(true,chsloc,pnlloc,filter,'Upload',(file)=>{
		var url=getGameURL(gt)+'/media/'+it;
		http_post_file(url,true,file,()=>{
			gt[it]=url;
			if(cbchg)cbchg(url);
			updateReplacer(gt,it,btnloc,pnlloc,filter,cbchg);
		},(err)=>{
			quickhtml({
				target:pnlloc,
				tag:'div',
				attr:{class:'instanterror'},
				sub:[JSON.stringify(err)]
			});
			updateReplacer(gt,it,btnloc,pnlloc,filter,cbchg);
		});
	},()=>{
		showReplacerPanel(gt,it,btnloc,pnlloc,filter,cbchg);
	});
	rgbtn.onclick=()=>{
		chooser.open();
	}
}

function updateReplacer(gt,it,btnloc,pnlloc,filter,cbchg){

	showReplacerButton(btnloc,()=>{
		showReplacerPanel(gt,it,btnloc,pnlloc,filter,cbchg);
	});
}

function updateMediaView(gt,it,tray,path){

	tray.loc.innerHTML='';
	if(!path)return;

	if(tray.elem)tray.elem.remove();
	tray.elem=quickhtml({
		target:tray.loc,
		tag:'p',
		attr:{class:'mediatray'},
		sub:[
			(it=='video')?
				quickhtml({tag:'video',attr:{controls:'controls'},sub:[
					quickhtml({tag:'source',attr:{src:gt[it]}})
				]}):
			quickhtml({tag:'img',attr:{src:gt[it]},style:{'max-width':'100%'}})
		],
	});
}

function updateLaunchControl(launchloc,confirmloc,cbok,cbng){

	var btn=quickhtml({
		target:launchloc,
		tag:'button',
		sub:['Launch'],
	});
	btn.onclick=()=>{
		launchloc.innerHTML='';
		confirmloc.innerHTML='';
		showConfirmPanel(confirmloc,'Launch the Game',()=>{
			confirmloc.innerHTML='';
			if(cbok)cbok();
			updateLaunchControl(launchloc,confirmloc,cbok,cbng);
		},()=>{
			confirmloc.innerHTML='';
			if(cbng)cbng();
			updateLaunchControl(launchloc,confirmloc,cbok,cbng);
		});
	}
}

function updateGameView(gt,cbquit,cbchg,cberr){

	panel_sysview.innerHTML='';
	panel_gameview.innerHTML='';

	quickhtml({
		target:panel_gameview,
		tag:'div',
		attr:{class:'systemcaption'},
		sub:[getSystemCaption(gt)]
	});
	quickhtml({
		target:panel_gameview,
		tag:'div',
		attr:{class:'gamecaption'},
		sub:[getGameCaption(gt)]
	});

	var btntray=quickhtml({
		target:panel_gameview,
		tag:'div',
		attr:{class:'buttontray'}
	});
	var launchloc=quickhtml({
		target:btntray,
		tag:'span',
	});

	var btn=null;
	if(gt.jukeboxAvailable=='true'){
		btn=quickhtml({
			target:btntray,
			tag:'button',
			sub:['JukeBox'],
		});
		btn.onclick=()=>{
			var url=getGameURL(gt);
			updateJukeBox(url+'/media/jukebox',0,(data)=>{
				var a={base:url+'/media/jukebox/',dir:[],file:[]}
				for(var b of data.dirs){
					// from ./ 
					a.dir.push(b.substring(2));
				}
				for(var b of data.files){
					// from ./ 
					a.file.push(b.substring(2));
				}
				return a;
			},()=>{
				main.innerHTML='';
				main.append(panel_mainboard);
			});
		}
	}

	if(gt.slideshowAvailable=='true'){
		btn=quickhtml({
			target:btntray,
			tag:'button',
			sub:['SlideShow'],
		});
		btn.onclick=()=>{
			var url=getGameURL(gt);
			updateImageViewer(url+'/media/slideshow',0,(data)=>{
				var a={base:url+'/media/slideshow/',dir:[],file:[]}
				for(var b of data.dirs){
					// from ./ 
					a.dir.push(b.substring(2));
				}
				for(var b of data.files){
					// from ./ 
					a.file.push(b.substring(2));
				}
				return a;
			},()=>{
				main.innerHTML='';
				main.append(panel_mainboard);
			});
		}
	}

	btntray.append(createMetaButton(gt,(dst)=>{
		if(dst.title=='')delete dst.title;
		if(dst.sortname=='')delete dst.sortname;
		for(var k in dst)gt[k]=dst[k];
		if(cbchg)cbchg(dst);
		var url='/systems/'+system_ctrl[gt.systemName].src.name+'/games';
		var post2=url+'/'+gt.id;
		http_post_json(post2,dst,null,(err)=>{
			if(cberr)cberr(err);
		});
	}));

	btn=quickhtml({
		target:btntray,
		tag:'button',
		sub:['Quit'],
	});
	btn.onclick=()=>{
		if(cbquit)cbquit();
	}
	var confirmloc=quickhtml({
		target:panel_gameview,
		tag:'div',
	});

	updateLaunchControl(launchloc,confirmloc,()=>{
		var launch=()=>{
			launchGame(gt.path,()=>{
				quickhtml({
					target:confirmloc,
					tag:'span',
					sub:['enjoy!']
				});
			},(err)=>{
				showError(confirmloc,err);
			});
		}
		killGame(()=>{launch();},()=>{launch();});
	},()=>{
	});


	for(var it in caps.Books){
		var frm=quickhtml({
			target:panel_gameview,
			tag:'p',
		});

		var path=gt[it];
		var captloc=quickhtml({
			target:frm,
			tag:'span',
		});
		updateMediaCaption(captloc,caps.Books[it],path);
		quickhtml({target:frm,tag:'span',sub:[' ']});
		var btnloc=quickhtml({
			target:frm,
			tag:'span',
		});
		var pnlloc=quickhtml({
			target:frm,
			tag:'div',
		});
		((it_,captloc_,btnloc_,pnlloc_)=>{
			updateReplacer(gt,it_,btnloc_,pnlloc_,filter_type('text','es'),(url)=>{
				updateMediaCaption(captloc_,caps.Books[it_]??'',url);
			});
		})(it,captloc,btnloc,pnlloc);
	}

	if(gt.docsAvailable=='true'){
		quickhtml({target:panel_gameview,tag:'hr'});

		var list=quickhtml({target:panel_gameview,tag:'div',sub:['Now Loading...']});

		var pref='/systems/'+gt.systemName+'/games/'+gt.id+'/media/';
		http_get_json(pref+'docs.json',(data)=>{
			list.innerHTML='';
			for(var it in data){
				var path=data[it];
				var frm=quickhtml({
					target:list,
					tag:'p',
				});
				updateMediaCaption(frm,it,(path.indexOf(':')<0)?(pref+encodeURI(path)):path);
			}
		},(err)=>{
			list.innerHTML='';
			list.append(quickhtml({
				tag:'span',
				attr:{class:'instanterror'},
				sub:[JSON.stringify(err)],
			}));
		});
	}

	for(var it in caps.Videos){
		var frm=quickhtml({
			target:panel_gameview,
			tag:'div',
			attr:{class:'imgframe'},
		});

		var path=gt[it];

		updateMediaCaption(frm,caps.Videos[it]);
		quickhtml({target:frm,tag:'span',sub:[' ']});
		var btnloc=quickhtml({
			target:frm,
			tag:'span',
		});
		var pnlloc=quickhtml({
			target:frm,
			tag:'div',
		});
		var imgloc=quickhtml({
			target:frm,
			tag:'div',
		});
		var imgtray={loc:imgloc,elem:null};
		((it_,imgtray_)=>{
			updateReplacer(gt,it_,btnloc,pnlloc,filter_type('video','es'),(url)=>{
				updateMediaView(gt,it_,imgtray_,url);
			});
		})(it,imgtray);
		updateMediaView(gt,it,imgtray,path);
	}
	for(var it in caps.Images){
		var frm=quickhtml({
			target:panel_gameview,
			tag:'div',
			attr:{class:'imgframe'},
		});

		var path=gt[it];

		updateMediaCaption(frm,caps.Images[it]);
		quickhtml({target:frm,tag:'span',sub:[' ']});
		var btnloc=quickhtml({
			target:frm,
			tag:'span',
		});
		var pnlloc=quickhtml({
			target:frm,
			tag:'div',
		});
		var imgloc=quickhtml({
			target:frm,
			tag:'div',
		});
		var imgtray={loc:imgloc,elem:null};
		((it_,imgtray_)=>{
			updateReplacer(gt,it_,btnloc,pnlloc,filter_type('image','es'),(url)=>{
				updateMediaView(gt,it_,imgtray_,url);
			});
		})(it,imgtray);
		updateMediaView(gt,it,imgtray,path);
	}

	var btn=quickhtml({
		target:panel_gameview,
		tag:'button',
		sub:['Quit'],
	});
	btn.onclick=()=>{
		if(cbquit)cbquit();
	}

	panel_sysview.append(panel_gameview);
}

function exportTSV(st,data){
	var cols=['ID','Platform','Path','Powered','Caption','Title','Sortable','Family','Rating','Runa','Favo','Hide','Kids','Reg','Lang','Date','Developer','Publisher','Players']
	var t=[cols.join("\t")]

	for(var gt of data){
		if(!gt.id)continue;
		if(!gt.systemName)continue;
		if(!gt.path)continue;
		var d=[]
		d.push(gt.id);
		d.push(gt.systemName);
		// from /userdata/roms/SystemName/ 
		d.push(gt.path.substring(16+gt.systemName.length));
		d.push(gt.arcadesystemname??'');
		d.push(gt.name??'');
		d.push(gt.title??'');
		d.push(gt.sortname??'');
		d.push(gt.family??'');
		var rating=parseFloat(gt.rating);
		if(isNaN(rating))rating='';
		else rating=Math.floor(rating*5+0.5);
		if(!rating)rating='';
		d.push(rating);
		d.push((gt.runnable=='true')?1:0);
		d.push((gt.favorite=='true')?1:0);
		d.push((gt.hidden=='true')?1:0);
		d.push((gt.kidgame=='true')?1:0);
		d.push(gt.region??'');
		d.push(gt.lang??'');
		var date=parseDate(gt.releasedate);
		d.push(isNaN(d)?'':(new Date(date).toISOString().substring(0,10)));
		d.push(gt.developer??'');
		d.push(gt.publisher??'');
		d.push(gt.players??'');
		t.push(d.join("\t"));
	}

	return t.join("\n")+"\n";
}

function importTSV(st,data,tsv,cbok,cbng){

	var lines=tsv.split("\n");
	if(lines.length<2){
		console.log('no enough lines');
		return;
	}
	var hd={}
	var ha=lines.shift().trimEnd().split("\t");
	for(var i in ha)hd[ha[i]]=i;

	if(!('ID' in hd) && !('Platform' in hd) && !('Path' in hd)){
		console.log('no enough columns');
		return;
	}
	var dd={}
	for(var i in data)dd[data[i].id]=i;
	for(var s of lines){
		if(!s)continue;
		var sa=s.trimEnd().split("\t");
		var id=sa[hd.ID];
		if(!(id in dd)){
			console.log(id+': not found');
			continue;
		}
		var gt=data[dd[id]];
		if(sa[hd.Platform]!=gt.systemName){
			console.log(id+': System misimatch; '+sa[hd.System]+'/'+gt.systemName);
			continue;
		}
		var dpath=gt.path.substring(16+gt.systemName.length);
		if(sa[hd.Path]!=dpath){
			console.log(id+': System misimatch; '+sa[hd.Path]+'/'+dpath);
			continue;
		}
		var dst={}
		// 単純文字列系 
		var meta={
			'Powered':'arcadesystemname',
			'Caption':'name',
			'Title':'title',
			'Sortable':'sortname',
			'Family':'family',
			'Reg':'region',
			'Lang':'lang',
			'Developer':'developer',
			'Publisher':'publisher',
			'Players':'players',
		}
		for(var m in meta){
			if(!(m in hd))continue;
			var sv=sa[hd[m]]??'';
			var dv=gt[meta[m]]??'';
			if(sv!=dv)dst[meta[m]]=sv;
		}
		// フラグ系 
		meta={
			'Runa':'runnable',
			'Favo':'favorite',
			'Hide':'hidden',
			'Kids':'kidgame',
		}
		for(var m in meta){
			if(!(m in hd))continue;
			var sv=sa[hd[m]]??'';
			if(sv!='')sv=(parseInt(sv))?'true':'false';
			var dv=gt[meta[m]]??'';
			if(sv!=dv)dst[meta[m]]=sv;
		}
		// 特殊 
		if('Rating' in hd){
			if(!(m in hd))continue;
			var sv=parseInt(sa[hd.Rating])??0;
			if(isNaN(sv))sv=0;
			else sv=ratingscore[sv];
			var dv=gt.rating??0;
			if(sv!=dv)dst.rating=sv;
		}
		if('Date' in hd){
			if(!(m in hd))continue;
			var sv=parseDate(sa[hd.Date]??'');
			var dv=parseDate(gt.releasedate??'');
			if(sv!=dv)dst.releasedate=sv?(new Date(sv).toISOString()):'';
		}
		for(var k in dst)gt[k]=dst[k];
		var url='/systems/'+gt.systemName+'/games/'+gt.id;
		http_post_json(url,dst,(data)=>{
			if(cbok)cbok();
		},(err)=>{
			console.log(err.toString()+'; '+url+': '+JSON.stringify(dst));
			if(cbng)cbng(err);
		});
	}
}

function updateGameList(ctrl){

	panel_sysview.innerHTML='';
	panel_gamelist.innerHTML='';

	var st=ctrl.src;
	quickhtml({
		target:panel_gamelist,
		tag:'div',
		sub:[quickhtml({
			tag:'img',
			attr:{src:st.logo,alt:st.fullname,class:'systemicon'},
		})],
	});

	var games=quickhtml({
		target:panel_gamelist,
		tag:'div',
		sub:['Now Loading...'],
	});

	var url='/systems/'+st.name+'/games';
	http_get_json(url,(data)=>{

		if(data.length<1){
			games.innerHTML='no entries';
			return;
		}

		data.sort((a,b)=>{return a.name<b.name?-1:1});

		games.innerHTML='';

		var saver=quickhtml({
			target:games,
			tag:'a',
		});

		var btn=quickhtml({
			target:games,
			tag:'button',
			sub:['Export'],
		});
		btn.onclick=()=>{
			var blob=new Blob([exportTSV(st,data)],{type:'text/tab-separated-values'});
			saver.href=URL.createObjectURL(blob);
			saver.download=st.name+'.tsv';
			saver.click();
		}

//		var srcfile=null;
		btn=quickhtml({
			target:games,
			tag:'button',
			sub:['Import'],
		});
		var chsloc=quickhtml({
			target:games,
			tag:'span',
		});
		var pnlloc=quickhtml({
			target:games,
			tag:'div',
		});

		var chooser=createFileChooser(false,chsloc,pnlloc,'.tsv','Import',(file)=>{
			importTSV(st,data,tsv,()=>{
				updateGameList(ctrl);
			},(err)=>{
				updateGameList(ctrl);
			});
		},()=>{
			updateGameList(ctrl)
		});
		btn.onclick=()=>{
			chooser.open();
		}

		var tbl=quickhtml({
			target:games,
			tag:'table',
			attr:{border:'border',class:'gamelist'},
		});

		var tr=quickhtml({
			target:tbl,
			tag:'tr',
			sub:[
				quickhtml({tag:'th',sub:['Name']}),
				quickhtml({tag:'th',sub:['System']}),
				quickhtml({tag:'th',sub:['Count']}),
				quickhtml({tag:'th',sub:['Total Time']}),
				quickhtml({tag:'th',sub:['Last Played']}),
				quickhtml({tag:'th',sub:['Rating']}),
				quickhtml({tag:'th',sub:['Etc']}),
			],
		});

		for(var gt of data){
			((gt_)=>{
				var post2=url+'/'+gt_.id;
				var errview=createInstantErrorView(7);
				var c_rating=createRatingControl(gt_,(score)=>{
					gt_.rating=ratingscore[score];
					errview.clear();
					http_post_json(post2,{rating:gt_.rating},null,(err)=>{
						errview.put(err);
					});
				});
				var c_favorite=createFavoriteButton(gt_,(f)=>{
					gt_.favorite=f?'true':'false';
					errview.clear();
					http_post_json(post2,{favorite:gt_.favorite},null,(err)=>{
						errview.put(err);
					});
				});
				var c_hidden=createHiddenButton(gt_,(f)=>{
					gt_.hidden=f?'true':'false';
					errview.clear();
					http_post_json(post2,{hidden:gt_.hidden},null,(err)=>{
						errview.put(err);
					});
				});
				tr=quickhtml({
					target:tbl,
					tag:'tr',
					sub:[
						quickhtml({tag:'td',attr:{class:'tblcapt'},sub:[gt_.name]}),
						quickhtml({tag:'td',attr:{class:'tblcapt'},sub:[gt_.systemName]}),
						quickhtml({tag:'td',attr:{class:'tblnum'},sub:[gt_.playcount]}),
						quickhtml({tag:'td',attr:{class:'tblnum'},sub:[createSecondsTime(gt_.gametime)]}),
						quickhtml({tag:'td',attr:{class:'tblnum'},sub:[createDateTime(gt_.lastplayed)]}),
						quickhtml({tag:'td',attr:{class:'tblstar'},sub:[c_rating.view]}),
						quickhtml({tag:'td',attr:{class:'tbltool'},sub:[
							c_favorite.view,
							c_hidden.view,
							createDetailButton(gt_,()=>{
								panel_sysview.innerHTML='';
								panel_sysview.append(panel_gamelist);
							},(dst)=>{
								errview.clear();
								c_rating.set(Math.floor(dst.rating*5+0.5));
								c_favorite.set(dst.favorite=='true');
								c_hidden.set(dst.hidden=='true');
							},(err)=>{
								errview.put(err);
							}),
						]}),
					],
				});
				tr=quickhtml({target:tbl,tag:'tr',sub:[errview.view]});
			})(gt);
		}
	},(err)=>{
		games.innerHTML=JSON.stringify(err);
	});

	panel_sysview.append(panel_gamelist);
}

function updateJukeBox(url,depth,onload,onquit){

	panel_imageviewer.innerHTML='';
	main.innerHTML='';

	var head=quickhtml({
		target:panel_imageviewer,
		tag:'div',
		attr:{class:'audiohead'},
	});
	var tool=quickhtml({
		target:head,
		tag:'div',
		attr:{class:'imagetool'},
	});
	var ctrl=quickhtml({
		target:tool,
		tag:'div',
		attr:{class:'audioctrl'},
	});
	var btns=quickhtml({
		target:tool,
		tag:'div',
		attr:{class:'imagebtns'},
	});
	var btnq=quickhtml({
		target:btns,
		tag:'button',
		attr:{class:'imagebtn'},
		sub:['×']
	});
	var view=quickhtml({
		target:panel_imageviewer,
		tag:'div',
		attr:{class:'imageview'},
	});
	var dirsel=quickhtml({
		target:view,
		tag:'div',
		attr:{class:'imagedir'},
	});
	var selector=quickhtml({
		target:view,
		tag:'div',
	});
	main.append(panel_imageviewer);

	btnq.onclick=()=>{
		onquit();
	}

	ctrl.innerHTML='Now Loading...';
	http_get_json(url,(data)=>{
		var attr=onload(data);

		attr.dir.sort((a,b)=>{return (a<b)?-1:1});
		attr.file.sort((a,b)=>{return (a<b)?-1:1});

		ctrl.innerHTML='';
		var titleboard=quickhtml({
			target:ctrl,
			tag:'div',
			attr:{class:'music_title'},
		});
		var playboard=quickhtml({
			target:ctrl,
			tag:'div',
			attr:{class:'music_play'},
		});
		var optboard=quickhtml({
			target:ctrl,
			tag:'div',
			attr:{class:'music_opt'},
		});

		var playmode='';
		var playnext=()=>{}
		var optbtns={
			manual:quickhtml({
				target:optboard,
				tag:'button',
				attr:{class:'music_mode_off'},
				sub:['Manual']
			}),
			repeat:quickhtml({
				target:optboard,
				tag:'button',
				attr:{class:'music_mode_off'},
				sub:['Repeat']
			}),
			sequence:quickhtml({
				target:optboard,
				tag:'button',
				attr:{class:'music_mode_off'},
				sub:['Sequence']
			}),
			random:quickhtml({
				target:optboard,
				tag:'button',
				attr:{class:'music_mode_off'},
				sub:['Random']
			}),
		}

		var to=null;
		var opt_select=(mode)=>{
			if(mode==playmode)return false;
			if(playmode)optbtns[playmode].setAttribute('class','music_mode_off');
			playmode=mode;
			optbtns[mode].setAttribute('class','music_mode_on');
			return true;
		}
		optbtns.manual.onclick=()=>{
			if(!opt_select('manual'))return;
			if(to)to.abort();
			to=null;
			playnext=()=>{}
		}
		optbtns.repeat.onclick=()=>{
			if(!opt_select('repeat'))return;
			if(to)to.abort();
			to=null;
			playnext=()=>{show(cur,true);}
		}
		optbtns.sequence.onclick=()=>{
			if(!opt_select('sequence'))return;
			playnext=()=>{
				var next=parseInt(cur)+1;
				if(next>=max)next=0;
				if(to)to.abort();
				to=delayExec(3000,()=>{show(next,true);});
			}
		}
		optbtns.random.onclick=()=>{
			if(!opt_select('random'))return;
			playnext=()=>{
				var next=Math.floor(Math.random()*max);
				if(to)to.abort();
				to=delayExec(3000,()=>{show(next,true);});
			}
		}
		optbtns.manual.click();

		var cur=-1;
		var show=(idx,play)=>{
			var name=attr.file[idx];
			var url=attr.base+name;
			titleboard.innerHTML=name;
			playboard.innerHTML='';
			var p=quickhtml({
				target:playboard,
				tag:'audio',
				attr:{controls:'controls'},
				sub:[quickhtml({tag:'source',attr:{src:url}})
			]});
			p.onended=(ev)=>{playnext();}
			if(cur>=0)trs[cur].setAttribute('class','music_listed');
			cur=idx;
			trs[idx].setAttribute('class','music_current');
			if(play)p.setAttribute('autoplay','autoplay');
		}

		var dirs=attr.dir;
		if(depth>0)dirs.unshift('..');
		for(var name of dirs){
			var btn=quickhtml({
				target:dirsel,
				tag:'button',
				sub:[name]
			});
			((name_,btn_)=>btn_.onclick=()=>{
				var url=attr.base+name_+'/';
				updateJukeBox(url,depth+((name=='..')?-1:+1),(data)=>{
					var a={base:url,dir:[],file:[]}
					for(var b of data.dirs){
						// from ./ 
						a.dir.push(b.substring(2));
					}
					for(var b of data.files){
						// from ./ 
						a.file.push(b.substring(2));
					}
					return a;
				},onquit);
			})(name,btn);
		}

		var tbl=quickhtml({
			target:selector,
			tag:'table',
			attr:{class:'music_list',align:'center',border:'border'},
		});
		var trs=[]
		for(var idx in attr.file){
			var tr=quickhtml({
				target:tbl,
				tag:'tr',
				attr:{class:'music_listed'},
			});
			trs.push(tr);
			var btntray=quickhtml({
				target:tr,
				tag:'td',
			});
			quickhtml({
				target:tr,
				tag:'td',
				sub:[attr.file[idx]]
			});
			var btn=quickhtml({
				target:btntray,
				tag:'button',
				sub:['Play']
			});
			((idx_)=>{
				btn.onclick=()=>{show(idx_,true);}
			})(idx);
		}

		var max=attr.file.length;
		if(max>0){
			show(0,false);
		}
		else{
			titleboard.innerHTML='(empty)';
		}

	},(err)=>{
		ctrl.innerHTML=JSON.stringify(err);
	});
}

function showImage(title,canvas,capt,url,play,onend){

	title.innerHTML=capt;
	canvas.innerHTML='';

	var to=null;
	switch(getMajorMediaType(url)){
		case 'video':
		var p=quickhtml({
			target:canvas,
			tag:'video',
			attr:{controls:'controls'},
			style:{'max-width':'100%'},
			sub:[quickhtml({tag:'source',attr:{src:url}})
		]});
		p.onended=(ev)=>{
			if(onend)onend();
		}
		if(play)p.setAttribute('autoplay','autoplay');
		break;

		case 'audio':
		var p=quickhtml({
			target:canvas,
			tag:'audio',
			attr:{controls:'controls'},
			sub:[quickhtml({tag:'source',attr:{src:url}})
		]});
		p.onended=(ev)=>{
			if(onend)onend();
		}
		if(play)p.setAttribute('autoplay','autoplay');
		break;

		case 'image':
		quickhtml({
			target:canvas,
			tag:'img',
			attr:{src:url},
			style:{'max-width':'100%'},
		});
		to=delayExec(2000,()=>{
			if(onend)onend();
		});
		break;

		default:
		quickhtml({
			target:canvas,
			tag:'div',
			sub:['(Unknown Type)']
		});
	}
	return to;
}

function updateImageViewer(url,depth,onload,onquit){

	panel_imageviewer.innerHTML='';
	main.innerHTML='';

	var head=quickhtml({
		target:panel_imageviewer,
		tag:'div',
		attr:{class:'imagehead'},
	});
	var tool=quickhtml({
		target:head,
		tag:'div',
		attr:{class:'imagetool'},
	});
	var ctrl=quickhtml({
		target:tool,
		tag:'div',
		attr:{class:'imagectrl'},
	});
	var btnbar=quickhtml({
		target:tool,
		tag:'div',
		attr:{class:'imagebtns'},
	});
	var btns={
		ss_off:quickhtml({
			target:btnbar,
			tag:'button',
			attr:{class:'ssmode_off'},
			sub:['Off']
		}),
		ss_seq:quickhtml({
			target:btnbar,
			tag:'button',
			attr:{class:'ssmode_off'},
			sub:['Seq']
		}),
		ss_rnd:quickhtml({
			target:btnbar,
			tag:'button',
			attr:{class:'ssmode_off'},
			sub:['Rnd']
		}),
		left:quickhtml({
			target:btnbar,
			tag:'button',
			attr:{class:'imagebtn'},
			sub:['←']
		}),
		right:quickhtml({
			target:btnbar,
			tag:'button',
			attr:{class:'imagebtn'},
			sub:['→']
		}),
		quit:quickhtml({
			target:btnbar,
			tag:'button',
			attr:{class:'imagebtn'},
			sub:['×']
		}),
	}
	var view=quickhtml({
		target:panel_imageviewer,
		tag:'div',
		attr:{class:'imageview'},
	});
	var dirsel=quickhtml({
		target:view,
		tag:'div',
		attr:{class:'imagedir'},
	});
	var canvas=quickhtml({
		target:view,
		tag:'div',
		attr:{class:'imagecanvas'},
	});
	main.append(panel_imageviewer);

	btns.quit.onclick=()=>{
		onquit();
	}

	ctrl.innerHTML='Now Loading...';
	http_get_json(url,(data)=>{
		var attr=onload(data);
		var cur=0;

		attr.dir.sort((a,b)=>{return (a<b)?-1:1});
		attr.file.sort((a,b)=>{return (a<b)?-1:1});

		var to=null;
		var show=(idx,play)=>{
			cur=idx;
			var name=attr.file[idx];
			var url=attr.base+name;
			if(to)to.abort();
			to=showImage(ctrl,canvas,name,url,play,ssnext);
		}

		var dirs=attr.dir;
		if(depth>0)dirs.unshift('..');
		for(var name of dirs){
			var btn=quickhtml({
				target:dirsel,
				tag:'button',
				sub:[name]
			});
			((name_,btn_)=>btn_.onclick=()=>{
				var url=attr.base+name_+'/';
				updateImageViewer(url,depth+((name=='..')?-1:+1),(data)=>{
					var a={base:url,dir:[],file:[]}
					for(var b of data.dirs){
						// from ./ 
						a.dir.push(b.substring(2));
					}
					for(var b of data.files){
						// from ./ 
						a.file.push(b.substring(2));
					}
					return a;
				},onquit);
			})(name,btn);
		}

		var max=attr.file.length;
		if(max>0){
			show(cur,false);
			btns.left.onclick=()=>{
				cur=(cur+max-1)%max;
				show(cur,false);
			}
			btns.right.onclick=()=>{
				cur=(cur+1)%max;
				show(cur,false);
			}
		}
		else{
			ctrl.innerHTML='(empty)';
			btns.left.onclick=()=>{}
			btns.right.onclick=()=>{}
			return;
		}

		var ssmode='';
		var ssnext=()=>{}
		var ss_select=(mode)=>{
			if(mode==ssmode)return false;
			if(ssmode)btns['ss_'+ssmode].setAttribute('class','ssmode_off');
			ssmode=mode;
			btns['ss_'+ssmode].setAttribute('class','ssmode_on');
			return true;
		}
		btns.ss_off.onclick=()=>{
			if(!ss_select('off'))return;
			if(to)to.abort();
			to=null;
			ssnext=()=>{}
		}
		btns.ss_seq.onclick=()=>{
			if(!ss_select('seq'))return;
			if(to)to.abort();
			to=null;
			ssnext=()=>{
				var next=(cur+1)%max;
				to=delayExec(3000,()=>{show(next,true);});
			}
			ssnext();
		}
		btns.ss_rnd.onclick=()=>{
			if(!ss_select('rnd'))return;
			if(to)to.abort();
			to=null;
			ssnext=()=>{
				var next=Math.floor(Math.random()*max);
				to=delayExec(3000,()=>{show(next,true);});
			}
			ssnext();
		}
		btns.ss_off.click();

	},(err)=>{
		ctrl.innerHTML=JSON.stringify(err);
	});
}

function updateRunningControlError(loc,err,cbupd){

	loc.innerHTML='';

	showError(loc,err);

	var updbtn=quickhtml({
		target:loc,
		tag:'button',
		sub:['Refresh']
	});

	updbtn.onclick=()=>{
		if(cbupd)cbupd();
	}
}

function updateRunningControl(loc,cbupd){

	loc.innerHTML='';

	var updbtn=quickhtml({
		target:loc,
		tag:'button',
		sub:['Refresh']
	});
	var killbtn=quickhtml({
		target:loc,
		tag:'button',
		sub:['Terminate']
	});

	updbtn.onclick=()=>{
		if(cbupd)cbupd();
	}
	killbtn.onclick=()=>{
		showConfirmPanel(loc,'Terminate the Game Process',()=>{
			killGame(()=>{
				updateRunningControl(loc,cbupd);
			},(err)=>{
				updateRunningControlError(loc,err,cbupd)
			});
		},()=>{
			updateRunningControl(loc,cbupd);
		});
	}


}

function updateIdlingControl(loc,cbupd){

	loc.innerHTML='';

	var updbtn=quickhtml({
		target:loc,
		tag:'button',
		sub:['Refresh']
	});
	var rstbtn=quickhtml({
		target:loc,
		tag:'button',
		sub:['Restart']
	});
	var quitbtn=quickhtml({
		target:loc,
		tag:'button',
		sub:['Quit']
	});

	updbtn.onclick=()=>{
		if(cbupd)cbupd();
	}
	rstbtn.onclick=()=>{
		showConfirmPanel(loc,'Restart EmulationStation',()=>{
			restartGame(()=>{
				updateIdlingControl(loc,cbupd);
			},(err)=>{
				updateRunningControlError(loc,err,cbupd)
			});
		},()=>{
			updateIdlingControl(loc,cbupd);
		});
	}
	quitbtn.onclick=()=>{
		showConfirmPanel(loc,'Quit EmulationStation',()=>{
			quitGame(()=>{
				updateIdlingControl(loc,cbupd);
			},(err)=>{
				updateRunningControlError(loc,err,cbupd)
			});
		},()=>{
			updateIdlingControl(loc,cbupd);
		});
	}

	var msgloc=quickhtml({
		target:loc,
		tag:'div',
	});
	var msgbox=quickhtml({
		target:msgloc,
		tag:'textarea',
	});
	var btn_msg=quickhtml({
		target:loc,
		tag:'button',
		sub:['Message']
	});
	var btn_noti=quickhtml({
		target:loc,
		tag:'button',
		sub:['Notify']
	});
	var msgerr=quickhtml({
		target:loc,
		tag:'div',
	});
	btn_msg.onclick=()=>{
		msgerr.innerHTML='';
		message(msgbox.value,()=>{
			msgbox.value='';
		},(err)=>{
			showError(msgerr,err);
		});
	}
	btn_noti.onclick=()=>{
		msgerr.innerHTML='';
		notify(msgbox.value,()=>{
			msgbox.value='';
		},(err)=>{
			showError(msgerr,err);
		});
	}
}

function updateGameThumb(gt,loc){

	var url=null;
	if(gt.marquee)url=gt.marquee;
	else if(gt.thumb)url=gt.thumb;
	else if(gt.image)url=gt.image;
	else if(gt.ingameshot)url=gt.ingameshot;
	else if(gt.titleshot)url=gt.titleshot;

	if(!url)return;

	quickhtml({
		target:loc,
		tag:'img',
		attr:{src:url,class:'gamethumb'},
	})
}

function updateRunningInfo(loc){

	loc.innerHTML='';

	var curgame=quickhtml({
		target:loc,
		tag:'div',
		attr:{class:'currentgame'},
		sub:['Now Loading...']
	});
	var notrun=()=>{
		quickhtml({
			target:curgame,
			tag:'div',
			attr:{class:'curgamecaption'},
			sub:['...Now Idling...']
		});

		var runinfo=quickhtml({
			target:curgame,
			tag:'div',
		});
		updateIdlingControl(runinfo,()=>{
			updateRunningInfo(loc);
		});
	}
	retrieveRunning((gt)=>{
		curgame.innerHTML='';
		if(!gt.systemName){
			notrun();
			return;
		}

		quickhtml({
			target:curgame,
			tag:'div',
			attr:{class:'curgamecaption'},
			sub:['Now Playing']
		});
		quickhtml({
			target:curgame,
			tag:'div',
			attr:{class:'systemcaption'},
			sub:[getSystemCaption(gt)]
		});
		quickhtml({
			target:curgame,
			tag:'div',
			attr:{class:'gamecaption'},
			sub:[gt.title?gt.title:gt.name]
		});

		var runinfo=quickhtml({
			target:curgame,
			tag:'div',
			attr:{class:'buttontray'},
		});
		updateRunningControl(runinfo,()=>{
			updateRunningInfo(loc);
		});

		var metactrl=quickhtml({
			target:curgame,
			tag:'div',
			attr:{class:'buttontray'},
		});
		var ratingtray=quickhtml({
			target:curgame,
			tag:'div',
			attr:{class:'ratingtray'},
		});

		var url='/systems/'+gt.systemName+'/games/'+gt.id;
		metactrl.append(createDetailButton(gt,()=>{
			panel_sysview.innerHTML='';
			panel_sysview.append(panel_homeview);
		},(dst)=>{
			metaerr.innerHTML='';
		},(err)=>{
			showError(metaerr,err);
		}));
		if(caps.Flags.runnable){
			metactrl.append(createRunnableButton(gt,(f)=>{
				gt.runnable=f?'true':'false';
				metaerr.innerHTML='';
				http_post_json(url,{runnable:gt.runnable},null,(err)=>{
					showError(metaerr,err);
				});
			}).view);
		}
		metactrl.append(createKidGameButton(gt,(f)=>{
			gt.kidgame=f?'true':'false';
			metaerr.innerHTML='';
			http_post_json(url,{kidgame:gt.kidgame},null,(err)=>{
				showError(metaerr,err);
			});
		}).view);
		metactrl.append(createFavoriteButton(gt,(f)=>{
			gt.favorite=f?'true':'false';
			metaerr.innerHTML='';
			http_post_json(url,{favorite:gt.favorite},null,(err)=>{
				showError(metaerr,err);
			});
		}).view);
		metactrl.append(createHiddenButton(gt,(f)=>{
			gt.hidden=f?'true':'false';
			metaerr.innerHTML='';
			http_post_json(url,{hidden:gt.hidden},null,(err)=>{
				showError(metaerr,err);
			});
		}).view);
		ratingtray.append(createRatingControl(gt,(score)=>{
			gt.rating=ratingscore[score];
			metaerr.innerHTML='';
			http_post_json(url,{rating:gt.rating},null,(err)=>{
				showError(metaerr,err);
			});
		}).view);

		var metaerr=quickhtml({
			target:curgame,
			tag:'div',
		});

		var thumb=quickhtml({
			target:curgame,
			tag:'div',
		})
		updateGameThumb(gt,thumb);

	},(err)=>{
		curgame.innerHTML='';
		if(err.code==404 || err.code==201){
		}
		else{
			showError(curgame,err);
		}

		notrun();
	});
}

function updateHomeView(){

	panel_sysview.innerHTML='';
	panel_homeview.innerHTML='';

	quickhtml({
		target:panel_homeview,
		tag:'div',
		attr:{class:'homecaption'},
		sub:['Batocera.linux']
	});
	quickhtml({
		target:panel_homeview,
		tag:'div',
		attr:{class:'secondcaption'},
		sub:[caps.Version?caps.Version:'']
	});

	var backctrl=quickhtml({
		target:panel_homeview,
		tag:'div',
	});

	var runinfo=quickhtml({
		target:panel_homeview,
		tag:'div',
	});
	updateRunningInfo(runinfo);

	var reloadbtn=quickhtml({
		target:panel_homeview,
		tag:'button',
		sub:['Reload the Game List']
	});
	var reloaderr=quickhtml({
		target:panel_homeview,
		tag:'div',
		attr:{class:'instanterror'}
	});
	reloadbtn.onclick=()=>{
		reloadGames(()=>{
			retrieveSystems((data)=>{
				updateSystemList(data);
			},(err)=>{
				showError(reloaderr,err);
			});
		},(err)=>{
			showError(reloaderr,err);
		});
	}

	panel_sysview.append(panel_homeview);
}

function updateSystemList(data){

	panel_syslist.innerHTML='';
	system_ctrl={}

	var st={'':[{name:'',fullname:'Home'}],Gallery:[],Collection:[]}
	for(var src of data){
		switch(src.manufacturer){
			case 'Collections': st.Collection.push(src); break;
			case 'Gallery': st.Gallery.push(src); break;
			default:
			if(!st[src.hardwareType])st[src.hardwareType]=[]
			st[src.hardwareType].push(src);
		}
	}

	for(var k in st){
		if(st[k].length<1)continue;
		if(k)quickhtml({target:panel_syslist,tag:'div',attr:{class:'cardgroup'},sub:k});
		for(var src of st[k]){
			var n=src.name;
			var t=system_ctrl[n]={
				src:src,
			}
			t.btn=quickhtml({target:panel_syslist,tag:'div',attr:{class:(n==selected_system)?'card_selected':'card_others'},sub:src.fullname});
			((n_,t_)=>{
				t_.btn.onclick=()=>{
					if(n_==selected_system)return;
					if(selected_system!==null)system_ctrl[selected_system].btn.setAttribute('class','card_others');
					system_ctrl[n_].btn.setAttribute('class','card_selected');
					selected_system=n_;
					panel_screenshots.innerHTML='Now Loading...';
					if(n_==''){
						updateHomeView();
					}
					else if(n_=='imageviewer' && caps.GetScreenshot){
						updateImageViewer('/systems/imageviewer/games',0,(data)=>{
							var a={base:'/screenshots/',dir:[],file:[]}
							for(var b of data){
								// from /userdata/screenshots/ 
								a.file.push(b.path.substring(22));
							}
							return a;
						},()=>{
							if(selected_system!==null)system_ctrl[selected_system].btn.setAttribute('class','card_others');
							panel_screenshots.innerHTML='';
							selected_system='';
							main.innerHTML='';
							main.append(panel_mainboard);
						});
						panel_sysview.append(panel_screenshots);
					}
					else updateGameList(t_);
				}
			})(n,t);
		}
	}
}

function updateMain(){

	retrieveSystems((data)=>{
		updateSystemList(data);
		updateHomeView();
		main.innerHTML='';
		main.append(panel_mainboard);
	},(err)=>{
		main.innerHTML='';
		showError(main,err);
	});
}

function runESNC(){

	main.append(panel_progress);
	retrieveCaps((data)=>{
		caps=data;
		updateMain();
	},(err)=>{
		updateMain();
	});
}
