// † EmulationStation NullPopPoCustom † //
// API test //

ipl_modules.load('xsv.js');
ipl_modules.load('objview.js');
ipl_modules.load('metaedit.js');
ipl_modules.load('htmlut.js');
ipl_modules.load('http_client.js');
ipl_modules.load('es_client.js');
ipl_modules.load('mediatype.js');
ipl_modules.load('langsel.js');
ipl_modules.load('genres.js');
ipl_modules.load('confirming.js');
ipl_modules.load('slideshow.js');
ipl_modules.load('jukebox.js');

const gamelist_pagenation=200;

var sortid=0;

var objviewopt={
	style_field:'objview_field',
	style_caption:'objview_caption',
	style_key:'objview_key',
	style_value:'objview_value',
}

function crumbview(src,dst=null){

	var div=dst?dst:quickhtml({tag:'div'});
	safeobjectiter(src,(k,v)=>{
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

function progress(main,cbreq){

	main.abort();
	main.rightpane.view.innerHTML='';

	quickhtml({
		target:main.rightpane.view,
		tag:'div',
		sub:['Wait for it...']
	});
	var prgbar=quickhtml({
		target:main.rightpane.view,
		tag:'meter',
		attr:{value:0,min:0,max:1},
		style:{width:'100%'},
	});
	var btn=quickhtml({
		target:main.rightpane.view,
		tag:'button',
		sub:['Cancel']
	});

	var prc={
		ok:(view)=>{
			main.rightpane.view.innerHTML='';
			main.rightpane.view.append(view);
		},
		ng:(err)=>{
			main.rightpane.view.innerHTML='';
			main.rightpane.view.append(err.toString());
		},
	}

	main.requesting=cbreq();
	engine_launch(()=>{
		if(!main.requesting)return false;
		prgbar.value=main.requesting.progress();
		return !main.requesting.end;
	},null,null);
	btn.onclick=()=>{
		main.abort();
	}
	return prc;
}

function callGet(main,path){

	var prc=progress(main,()=>es_client.get_text(path,
	(data)=>{
		prc.ok('Done');
	},
	(err)=>{
		prc.ng(err);
	}));
}

function getText(main,path){

	var prc=progress(main,()=>es_client.get_text(path,
	(data)=>{
		prc.ok(data);
	},
	(err)=>{
		prc.ng(err);
	}));
}

function callGetJSON(main,path){

	var prc=progress(main,()=>es_client.get_json(path,
	(data)=>{
		prc.ok(objview(data,objviewopt));
	},
	(err)=>{
		prc.ng(err);
	}));
}

function callGetCaps(main,path){

	var prc=progress(main,()=>es_client.get_json(path,
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

var tsvproc=null;

function tsvproc_init(){

	tsvproc={
		ID:xsv_proc_string('id'),
		Platform:xsv_proc_string('systemName'),
		Path:{
			key:'path',
			export:(row,key)=>{
				var v=row[key];
				if(!v)return '';
				return v.substring(16+row.systemName.length);
			},
			import:(row,key,val)=>{
				// for index 
				// don't import 
				return true;
			},
		},
		Powered:xsv_proc_string('arcadesystemname'),
		Caption:xsv_proc_string('name'),
		Title:xsv_proc_string('title'),
		Sortable:xsv_proc_string('sortname'),
		Family:xsv_proc_string('family'),
		Rating:{
			key:'rating',
			export:(row,key)=>{
				var v=row[key];
				if(!v)return '';
				var n=Math.floor(v*5+0.5);
				return n;
			},
			import:(row,key,val)=>{
				var n=parseInt(val);
				if(n>5)n=5;
				row[key]=ratingscore[n];
				return true;
			},
		},
		Runa:xsv_proc_bool('runable',{import_true:'true',import_false:'false'}),
		Favo:xsv_proc_bool('favorite',{import_true:'true',import_false:'false'}),
		Hide:xsv_proc_bool('hidden',{import_true:'true',import_false:'false'}),
		Kids:xsv_proc_bool('kidgame',{import_true:'true',import_false:'false'}),
		Reg:xsv_proc_string('region'),
		Lang:xsv_proc_string('lang'),
		Date:xsv_proc_string('releasedate'),
		Developer:xsv_proc_string('developer'),
		Publisher:xsv_proc_string('publisher'),
		Players:xsv_proc_string('players'),
	}
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

function exportGames(main){

	var showerr=(err)=>{
		ctrl.view.innerHTML='';
		quickhtml({
			target:ctrl.view,
			tag:'div',
			sub:[err.toString()]
		});
		var btn=quickhtml({
			target:ctrl.view,
			tag:'button',
			sub:['Cancel']
		});
		btn.onclick=()=>{
			ctrl.view.close();
		}
	}

	var ctrl={
		view:quickhtml({
			target:main.rightpane.view,
			tag:'dialog',
			attr:{class:'dialog'},
		}),

		exec:(sdata,cbdone)=>{
			ctrl.view.innerHTML='';
			quickhtml({
				target:ctrl.view,
				tag:'div',
				sub:['Wait for it...']
			});
			var prgbar=quickhtml({
				target:ctrl.view,
				tag:'meter',
				attr:{value:0,min:0,max:1},
				style:{width:'100%'},
			});
			var btn=quickhtml({
				target:ctrl.view,
				tag:'button',
				sub:['Cancel']
			});
			btn.onclick=()=>{
				req.abort();
			}
			ctrl.view.showModal();

			var sname=sdata.name;
			var req=es_client.get_json('/systems/'+sname+'/games',(data)=>{
				ctrl.view.innerHTML='';
				var tsv=xsv_export_full(data,tsvproc);
				var blob=new Blob([tsv],{type:'text/tab-separated-values'});

				var saver=quickhtml({
					target:ctrl.view,
					tag:'a',
				});
				saver.href=URL.createObjectURL(blob);
				saver.download=sname+'.tsv';
				saver.click();
				ctrl.view.close();
				if(cbdone)cbdone();
			},
			(err)=>{
				showerr(err);
			});
			engine_launch(()=>{
				prgbar.value=req.progress();
				return !req.end;
			},null,null);
		}
	}
	return ctrl;
}

function importGames(main,target){

	var showerr=(err,filebtn)=>{
		ctrl.view.innerHTML='';
		quickhtml({
			target:ctrl.view,
			tag:'div',
			sub:[err.toString()]
		});
		var btn=quickhtml({
			target:ctrl.view,
			tag:'button',
			sub:['End']
		});
		btn.onclick=()=>{
			ctrl.view.close();
			filebtn.show();
		}
	}

	var ctrl={
		view:quickhtml({
			target:target,
			tag:'dialog',
			attr:{class:'dialog'},
		}),

		seton:(target,sdata)=>{
			var opt=({
				target:target,
				filter:'.tsv',
				caption_select:'Import',
				cbselect:(ctrl2,files)=>{
					var path=files[0].name;
					ctrl.view.innerHTML=path;
					btn.confirm();
				},
				cbcancel:(ctrl2,files)=>{
					ctrl.view.close();
					btn.show();
				},
				cbexec:(ctrl2,files)=>{
					ctrl.view.innerHTML='Wait for it...';
					var prgbar=quickhtml({
						target:ctrl.view,
						tag:'meter',
						attr:{value:0,min:0,max:1},
						style:{width:'100%'},
					});
					var btn1=quickhtml({
						target:ctrl.view,
						tag:'button',
						sub:['Cancel']
					});
					btn1.onclick=()=>{
						http.abort();
					}
					ctrl.view.showModal();
	
					var http=http_controller({
						secure:es_client.secure,
						base:es_client.base,
						limit:10,
						interval:25,
					});
					var fr=new FileReader();
					fr.onerror=()=>{
						showerr(fr.error,btn);
					}
					fr.onload=()=>{
						var data=xsv_import_full(fr.result,tsvproc);
						if(!data){
							showerr('format error',btn);
						}
						else{
							var sname=sdata.name;
							for(var row of data){
								if(sname!=row.systemName)continue;
								var gid=row.id;
								var dst={}
								for(var k in row){
									if(k=='id')continue;
									if(k=='path')continue;
									if(k=='systemName')continue;
									dst[k]=row[k];
								}

								var url='/systems/'+sname+'/games/'+gid;
								http.post_json(url,dst);
							}
							http.sync(
								()=>{
									prgbar.value=http.progress();
								},
								()=>{
									if(http.is_ng()){
										showerr(''+http.count_ng()+' entries failure',btn);
									}
									else{
										ctrl.view.close();
										btn.show();
									}
								}
							);
						}
					}
					fr.readAsText(files[0]);
				},
			});
			var btn=htmlut_filebutton(opt);
		}
	}

	return ctrl;
}

function getAGame(main,sdata,gid){

	var sname=sdata.name;

	var url='/systems/'+sname+'/games/'+gid;
	var prc=progress(main,()=>es_client.get_json(url,
	(data)=>{
		var div=quickhtml({tag:'div'});
		var crumb={}
		crumb['Systems']=()=>{callGetSystems(main);}
		crumb[sname]=()=>{callGetASystem(main,sname);}
		crumb['Games']=()=>{callGetGames(main,sdata);}
		if(booleanize(data.slideshowAvailable)){
			crumb['slideshow']=()=>{
				main.slideshow.open(url+'/res/slideshow/');
			}
		}
		if(booleanize(data.jukeboxAvailable)){
			crumb['jukebox']=()=>{
				main.jukebox.open(url+'/res/jukebox/');
			}
		}
		if(booleanize(data.docsAvailable)){
			crumb['document']=()=>{
			}
		}
		crumb['launch']=()=>{
			es_client.post_text('/launch',data.path);
		}
		crumbview(crumb,div);
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

function callGetGames(main,sdata,page=0){

	var sname=sdata.name;

	var pgsuf='';
	if(gamelist_pagenation && es_caps.PartialGameList){
		pgsuf='_partial/'+(page*gamelist_pagenation)+'/'+gamelist_pagenation+'/'+sortid;
	}

	var prc=progress(main,()=>es_client.get_json('/systems/'+sname+'/games'+pgsuf,
	(data)=>{
		var div=quickhtml({tag:'div'});
		var div1=quickhtml({tag:'div',target:div});
		var crumb={}
		crumb['Systems']=()=>{callGetSystems(main);}
		crumb[sname]=()=>{callGetASystem(main,sname);}
		crumb['Export']=()=>{exportGames(main).exec(sdata);}
		crumbview(crumb,div1);

		var importer=importGames(main,div1);
		importer.seton(div1,sdata);

		var div2=quickhtml({tag:'div',target:div});
		if(gamelist_pagenation && es_caps.PartialGameList){
			crumb={}
			var pages=Math.ceil(sdata.visibleGames/gamelist_pagenation);
			safestepiter(0,pages,1,(i)=>{
				crumb[i+1]=(i==page)?null:()=>{callGetGames(main,sdata,i);}
				return true;
			});
			crumbview(crumb,div2);
		}

		if(es_caps.GameSorts){
			var idxs=[]
			var sel=quickhtml({
				target:div2,
				tag:'select',
				style:{align:'right'},
			});
			for(var i in es_caps.GameSorts){
				idxs.push(i);
				var attr={value:i}
				if(i==sortid)attr.selected='selected';
				var opt=quickhtml({
					target:sel,
					tag:'option',
					attr:attr,
					sub:[es_caps.GameSorts[i]]
				});
			}
			sel.onchange=()=>{
				sortid=idxs[sel.selectedIndex];
				callGetGames(main,sdata,page);
			}
		}

		safearrayiter(data,(gt)=>{
			var ov=objview(gt,objviewopt);
			var lg=quickhtml({target:ov,tag:'legend'});
			var btn=quickhtml({target:lg,tag:'button',sub:[gt.name]});
			btn.onclick=()=>getAGame(main,sdata,gt.id);
			div2.append(ov);
			return true;
		});

		prc.ok(div);
	},
	(err)=>{
		prc.ng(err);
	}));
}

function callGetScreenshots(main){

	var url='/screenshots';
	main.slideshow.open(url);
}

function callGetASystem(main,sname){

	var prc=progress(main,()=>es_client.get_json('/systems/'+sname,
	(data)=>{
		var div=quickhtml({tag:'div'});
		crumbview({
			'Systems':()=>{callGetSystems(main);},
			'Games':()=>{callGetGames(main,data);},
		},div);
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

function callGetSystems(main){

	var prc=progress(main,()=>es_client.get_json('/systems',
	(data)=>{
		var div=quickhtml({tag:'div'});
		safearrayiter(data,(st)=>{
			var ov=objview(st,objviewopt);
			var lg=quickhtml({target:ov,tag:'legend'});
			var btn=quickhtml({target:lg,tag:'button',sub:[st.name]});
			btn.onclick=()=>callGetASystem(main,st.name);
			div.append(ov);
			return true;
		});
		prc.ok(div);
	},
	(err)=>{
		prc.ng(err);
	}));
}

function callNotify(main){

	main.abort();
	main.rightpane.view.innerHTML='';

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
		target:main.rightpane.view,
		tag:'fieldset',
		sub:[
			quickhtml({tag:'legend',sub:[btn_n]}),
			form_n
		]
	});

	quickhtml({
		target:main.rightpane.view,
		tag:'fieldset',
		sub:[
			quickhtml({tag:'legend',sub:[btn_m]}),
			form_m
		]
	});
}

function setupLeftPane(main){

	var ctrl={
		view:quickhtml({
			target:main.view,
			tag:'div',
			attr:{class:'leftpane'},
		}),
	}

	var testlist=[
		{caption:'Capability',func:()=>callGetCaps(main,'/caps')},
		{caption:'Systems',func:()=>callGetSystems(main)},
		{caption:'Screenshots',func:()=>callGetScreenshots(main)},
		{caption:'Splash',func:()=>{main.slideshow.open('/splash');}},
		{caption:'Music',func:()=>{main.jukebox.open('/music');}},
		{caption:'JukeBox',func:()=>{main.jukebox.reopen();}},
		{caption:'RunningGame',func:()=>callGetJSON(main,'/runningGame')},
		{caption:'ReloadGames',func:()=>callGet(main,'/reloadgames')},
		{caption:'Notify',func:()=>callNotify(main)},
		{caption:'EmuKill',func:()=>callGet(main,'/emukill')},
		{caption:'Restart',func:()=>callGet(main,'/restart')},
		{caption:'Quit',func:()=>callGet(main,'/quit')},
	]

	safearrayiter(testlist,(t)=>{
		var d1=quickhtml({
			target:ctrl.view,
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

	return ctrl;
}

function setupRightPane(main){

	var ctrl={
		view:quickhtml({
			target:main.view,
			tag:'div',
			attr:{class:'rightpane'},
		})
	}

	return ctrl;
}

function runAPITest(view){

	tsvproc_init();
	es_init();

	var main={
		requesting:null,
		view:quickhtml({
			tag:'div',
			attr:{class:'mainboard'},
		}),

		abort:()=>{
			if(!main.requesting)return;
			main.requesting.abort();
			main.requesting=null;
		}
	}

	view.innerHTML='';
	view.append(main.view);
	main.view.innreHTML='';

	main.leftpane=setupLeftPane(main);
	main.rightpane=setupRightPane(main);
	main.slideshow=slideshow_setup(main.view);
	main.jukebox=jukebox_setup(main.view);
}

const apitest_ready=true;
