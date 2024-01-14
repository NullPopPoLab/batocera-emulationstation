// † EmulationStation NullPopPoCustom † //
// required: 1stkit.js objview.js

const gamelist_pagenation=100;

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
			div.append(metaview(sname,gid,data));
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
