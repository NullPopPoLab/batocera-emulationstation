// † Web Fitst Kit † //

function booleanize(val){
	if(val=='0')return false;
	if(val=='false')return false;
	return !!val;
}

function zerofill(val,col){
	var s='0'.repeat(col-1)+val;
	return s.substring(s.length-col);
}

function safeeachnumber(bgn,end,step,cbiter){

	var abort=false;
	for(var i=bgn;i<end;i+=step){
		if(abort)return;
		((i_)=>{
			if(!cbiter(i_))abort=true;
		})(i);
	}
}

function safeeacharray(src,cbiter){

	var abort=false;
	for(var t of src){
		if(abort)return;
		((t_)=>{
			if(!cbiter(t_))abort=true;
		})(t);
	}
}

function safeeachobject(src,cbiter){

	var abort=false;
	for(var k in src){
		if(abort)return;
		((k_)=>{
			if(!cbiter(k_,src[k_]))abort=true;
		})(k);
	}
}

log_level_name=['TICK','TRACE','DEBUG','INFO','NOTICE','WARN','FATAL','CRIT','ALERT','EMERG']
log_level={}
for(var i=0 in log_level_name)log_level[log_level_name[i]]=i;
log_level['NEVER']=log_level.length;

var log_showable=log_level.INFO;
function log_tick(msg){log_put(log_level.TICK,msg);}
function log_trace(msg){log_put(log_level.TRACE,msg);}
function log_debug(msg){log_put(log_level.DEBUG,msg);}
function log_info(msg){log_put(log_level.INFO,msg);}
function log_notice(msg){log_put(log_level.NOTICE,msg);}
function log_warn(msg){log_put(log_level.WARN,msg);}
function log_fatal(msg){log_put(log_level.FATAL,msg);}
function log_crit(msg){log_put(log_level.CRIT,msg);}
function log_alert(msg){log_put(log_level.ALERT,msg);}
function log_emerg(msg){log_put(log_level.EMERG,msg);}

function log_format(lev,msg){
	var lln=log_level_name[lev]??('?'+lev+'?');
	return '['+lln+'] '+msg;
}

var log_func=(lev,msg)=>{
	console.log(log_format(lev,msg));
}

function log_put(lev,msg){
	if(lev<log_showable)return;
	log_func(lev,msg);
}

function error_msg(s){
	var e={msg:s}
	e.toString=()=>{return s;}
	return e;
}

function error_obj(src){
	var e={obj:src}
	e.toString=()=>{return src.toString();}
	return e;
}

function error_http(res){
	var e={code:res.status,msg:res.statusText}
	e.toString=()=>{return '['+e.code+'] '+e.msg;}
	return e;
}

function http_request(url,opt,cbres=null,cbok=null,cbng=null){

	var ctx={
		url:url,
		opt:opt,
		end:false,
		abort:()=>{
			end=true;
		},
	}

	fetch(url,opt)
		.then((res)=>{
			if(ctx.end)return res;
			if(res.status==200){
				var r=cbres?cbres(res):res;
				if(r!==null)return r;
			}
			ctx.end=true;
			if(cbng)cbng(error_http(res));
			else console.log(JSON.stringify(err));
		})
		.then((data)=>{
			if(ctx.end)return;
			ctx.end=true;
			if(cbok)cbok(data);
		})
		.catch((err)=>{
			if(ctx.end)return;
			ctx.end=true;
			if(cbng)cbng(error_obj(err));
			else console.log(err.toString());
		});

	return ctx;
}

function http_get_text(url,cbok=null,cbng=null){

	return http_request(url,{
		method:'GET',
	},(res)=>{
		return (res.status==200)?res.text():null;
	},cbok,cbng);
}

function http_get_json(url,cbok=null,cbng=null){

	return http_request(url,{
		method:'GET',
	},(res)=>{
		return (res.status==200)?res.json():null;
	},cbok,cbng);
}

function http_get_xml(url,cbok=null,cbng=null){

	return http_request(url,{
		method:'GET',
	},(res)=>{
		return (res.status==200)?res:null;
	},(res)=>{
		return res.text().then((xml)=>{
			var psr=new DOMParser();
			var data=psr.parseFromString(xml, "text/xml");
			if(cbok)cbok(data);
		});
	},cbng);
}

function http_post_text(url,text,cbok=null,cbng=null){

	return http_request(url,{
		method:'POST',
		headers:{'Content-Type':'text/plain'},
		body:text
	},(res)=>{
		return (res.status>=200 && res.status<300)?res:null;
	},cbok,cbng);
}

function http_post_json(url,data,cbok=null,cbng=null){

	return http_request(url,{
		method:'POST',
		headers:{'Content-Type':'application/json'},
		body:JSON.stringify(data)
	},(res)=>{
		return (res.status>=200 && res.status<300)?res:null;
	},cbok,cbng);
}

function http_post_file(url,type,data,cbok=null,cbng=null){

	return http_request(url,{
		method:'POST',
		headers:{'Content-Type':type?type:'application/octet-stream'},
		body:data
	},(res)=>{
		return (res.status>=200 && res.status<300)?res:null;
	},cbok,cbng);
}

function quickhtml(prm){

	if(!prm.tag){
		if(prm.target && prm.sub){
			for(var sub of prm.sub){
				if(sub===null){}
				else if(typeof sub==='object')prm.target.append(sub);
				else prm.target.innerHTML+=sub;
			}
		}
		return null;
	}

	var el=document.createElement(prm.tag);
	if(prm.attr){
		for(var k in prm.attr){
			el.setAttribute(k,prm.attr[k]);
		}
	}
	if(prm.style){
		for(var k in prm.style){
			el.style[k]=prm.style[k];
		}
	}
	if(prm.sub){
		for(var t of prm.sub){
			if(t===null){}
			else if(typeof t==='object')el.append(t);
			else el.innerHTML+=t;
		}
	}
	if(prm.target)prm.target.append(el);
	return el;
}

var engine=[]
var engine_toid=null;

function proc_new(cbpoll,cbdone,cbabort){

	if(!cbpoll){
		log_warn('empty pollee');
	}

	var proc={
		end:false,
		cbpoll:cbpoll,
		cbdone:cbdone,
		cbabort:cbabort,

		abort:()=>{
			if(proc.end)return;
			proc.end=true;
			if(proc.cbabort)proc.cbabort();
		},
	}
	return proc;
}

function engine_launch(cbpoll,cbdone,cbabort){
	var proc=proc_new(cbpoll,cbdone,cbabort);
	engine.push(proc);
	return proc;
}

function start_engine(){

	engine_toid=setInterval(()=>{

		if(engine.length<1)return;

		var proc=engine.shift();
		var r=(proc.cbpoll && !proc.end)?proc.cbpoll():false;
		if(r)engine.push(proc);
		else if(!proc.end){
			proc.end=true;
			if(proc.cbdone)proc.cbdone();
		}
	},1);
}

function stop_engine(){

	if(engine_toid){
		clearInterval(engine_toid);
		engine_toid=null;
	}

	for(var proc of engine){
		proc.abort();
	}
	engine=[]
}

ipl_managers={}

function ipl_unmanage(mng){

	if(!mng.working)return;
	mng.working=false;
}

function ipl_manage(cate,ctor,dtor){

	var mng={
		working:true,
		ctor:ctor,
		dtor:dtor,
		target:{},
		loading:[],
	}
	mng.unload=(handle)=>{
		if(!handle.open)return;
		handle.open=false;
		if(!mng.target[handle.path])return;

		var unit=mng.target[handle.path];
		if(--unit.cnt>0)return;
		if(mng.dtor)mng.dtor(unit.inst);
		unit.abort();
		unit.inst=null;
		delete mng.target[handle.path];
	}
	mng.load=(path,cbok,cbng)=>{
		var handle={
			path:path,
			open:true,
			cbok:cbok,
			cbng:cbng,
		}
		handle.abend=(err)=>{
			handle.open=false;
			if(cbng)cbng(err);
		}

		var unit=mng.target[path];
		if(unit){
			++unit.cnt;
		}
		else{
			unit={
				path:path,
				ready:false,
				cnt:1,
				inst:null,
				err:null,
			}
			mng.target[path]=unit;

			http_get_text(path,(text)=>{
				if(mng.ctor){
					try{
						unit.inst=mng.ctor(text);
						unit.ready=!!unit.inst;
					}
					catch(err){
						unit.err=err;
						handle.abend(err);
					}
				}
				else{
					unit.ready=true;
				}
			},(err)=>{
				unit.err=err;
				handle.abend(err);
			});
		}
		mng.loading.push(handle);

		return handle;
	}
	mng.poll=()=>{
		if(mng.loading.length<1)return true;
		var handle=mng.loading.shift();
		var unit=mng.target[handle.path];
		if(unit.ready){
			if(handle.cbok)handle.cbok();
			return true;
		}
		mng.loading.push(handle);
		return true;
	}

	ipl_managers[cate]=mng;
	engine_launch(()=>mng.poll());
	return mng;
}

var style_holder=document.getElementById('styles');
var ipl_styles=ipl_manage('style',(text)=>{
	var el=document.createElement('style');
	el.innerHTML=text;
	style_holder.append(el);
	return el;
},(el)=>{
	el.remove();
});

var module_holder=document.getElementById('modules');
var ipl_modules=ipl_manage('module',(text)=>{
	var el=document.createElement('script');
	el.innerHTML="<!--\n"+text+'//-->';
	module_holder.append(el);
	return el;
},(el)=>{
	el.remove();
});

function ipl_isready(){

	var done=true;
	safeeachobject(ipl_managers,(cate,mng)=>{
		if(mng.loading.length>0)done=false;
		else safeeachobject(mng.target,(path,unit)=>{
			if(!unit.ready)done=false;
			return done;
		});
		return done;
	});
	return done;
}

function ipl_monitor(view){

	var tbl=quickhtml({
		tag:'table',
		attr:{border:'border'},
		sub:[
			quickhtml({tag:'tr',sub:[
				quickhtml({tag:'th',sub:['Category']}),
				quickhtml({tag:'th',sub:['Label']}),
				quickhtml({tag:'th',sub:['Condition']}),
			]}),
		]
	});
	safeeachobject(ipl_managers,(cate,mng)=>{
		safeeachobject(mng.target,(path,unit)=>{
			var tr=quickhtml({
				target:tbl,
				tag:'tr',
				sub:[
					quickhtml({tag:'td',sub:[cate]}),
					quickhtml({tag:'td',sub:[unit.path]}),
				]
			});

			var s='';
			if(unit.ready)s='OK';
			else if(unit.err)s=unit.err.toString();
			else s='...';
			quickhtml({target:tr,tag:'td',sub:[s]});
			return true;
		});
		return true;
	});
	view.innerHTML='';
	view.append(tbl);
}

function ipl_wait4ready(view,cbdone){

	return engine_launch(
		()=>{
			var r=ipl_isready();
			if(view)ipl_monitor(view);
			return !r;
		},
		()=>{
			if(cbdone)cbdone();
		},
	);
}

start_engine();
