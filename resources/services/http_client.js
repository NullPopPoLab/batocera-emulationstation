// † EmulationStation NullPopPoCustom † //
// required: 1stkit.js

function http_request_context(cbreq,cbok,cbng){

	var rqc={
		done:false,
		end:false,
		err:null,
		cbreq:cbreq,
		cbok:cbok,
		cbng:cbng,

		abort:()=>{
			if(rqc.end)return;
			rqc.end=true;
			if(!rqc.err)rqc.err=error_msg('Aborted');
			if(rqc.cbng)rqc.cbng(rqc.err);
		},
	}
	return rqc;
}

function http_respond_ok(rqc,data){
	if(rqc.end)return;
	rqc.end=true;
	rqc.done=true;
	if(rqc.cbok)rqc.cbok(data);
}

function http_respond_ng(rqc,err){
	if(rqc.end)return;
	rqc.end=true;
	if(!rqc.err)rqc.err=err;
	if(rqc.cbng)rqc.cbng(err);
}

function http_controller_new(opt={}){

	var ctrl={
		end:false,
		secure:opt.secure??false,
		base:opt.base??'',
		limit:opt.limit??null,
		interval:opt.interval??500,
		wip:[],
		queue:[],
		proc:engine_launch(()=>http_controller_poll(ctrl),()=>http_controller_abort(ctrl)),

		abort:()=>{
			ctrl.proc.abort();
		},

		makeurl:(path)=>{
			if(!ctrl.base)return path;
			var scheme=ctrl.secure?'https':'http';
			return scheme+'://'+ctrl.base+path;
		},

		get_text:(path,cbok,cbng)=>{
			var url=ctrl.makeurl(path);
			var rqc=http_request_context(
				()=>http_get_text(url,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctrl.queue.push(rqc);
			return rqc;
		},
		get_json:(path,cbok,cbng)=>{
			var url=ctrl.makeurl(path);
			var rqc=http_request_context(
				()=>http_get_json(url,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctrl.queue.push(rqc);
			return rqc;
		},
		get_xml:(path,cbok,cbng)=>{
			var url=ctrl.makeurl(path);
			var rqc=http_request_context(
				()=>http_get_xml(url,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctrl.queue.push(rqc);
			return rqc;
		},

		post_text:(path,text,cbok,cbng)=>{
			var url=ctrl.makeurl(path);
			var rqc=http_request_context(
				()=>http_post_text(url,text,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctrl.queue.push(rqc);
			return rqc;
		},
		post_json:(path,json,cbok,cbng)=>{
			var url=ctrl.makeurl(path);
			var rqc=http_request_context(
				()=>http_post_json(url,json,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctrl.queue.push(rqc);
			return rqc;
		},
		post_file:(path,bin,file,cbok,cbng)=>{
			var url=ctrl.makeurl(path);
			var rqc=http_request_context(
				()=>http_post_file(url,bin,file,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctrl.queue.push(rqc);
			return rqc;
		},

		delete:(path,cbok,cbng)=>{
			var url=ctrl.makeurl(path);
			var rqc=http_request_context(
				()=>http_delete(url,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctrl.queue.push(rqc);
			return rqc;
		},
	}
	ctrl.last_launched=Date.now()-ctrl.interval;
	return ctrl;
}

function http_controller_poll(ctrl){

	if(ctrl.end)return false;

	var cont=[]
	for(var rqc of ctrl.wip){
		if(rqc.end)continue;
		cont.push(rqc);
	}
	ctrl.wip=cont;

	while(ctrl.queue.length>0){
		if(ctrl.limit!==null && ctrl.wip.length>=ctrl.limit)break;
		if(Date.now()<ctrl.last_launched+ctrl.interval)break;
		var rqc=ctrl.queue.shift();
		ctrl.wip.push(rqc);
		rqc.cbreq();
	}

	return true;
}

function http_controller_abort(ctrl){

	if(ctrl.end)return;
	ctrl.end=true;

	for(var proc of ctrl.wip)proc.abort();
	for(var proc of ctrl.queue)proc.abort();

	log_info('end of client controller');
}

function http_controller(opt={}){
	var ctrl=http_controller_new(opt);

	engine_launch(
		()=>http_controller_poll(ctrl),
		null,
		()=>http_controller_abort(ctrl)
	);

	return ctrl;
}

function http_multi(){
	var count_ok=0;
	var count_ng=0;
	var cur=null;
	var cbprg=[];
	var cbend=[];
	var wip=[]
	var oked=[]
	var nged=[]

	var ctrl={
		count_ok:()=>{return count_ok;},
		count_ng:()=>{return count_ng;},
		count_all:()=>{return count_ok+count_ng+wip.length+(cur?1:0);},
		is_ng:()=>{return count_ng>0;},
		is_ok:()=>{return count_ng<1 && wip.length<1;},
		progress:()=>{
			var d=ctrl.count_all();
			if(d<1)return 1.0;
			var m=ctrl.count_ok();
			return m/d;
		},

		push:(rqc)=>{wip.push(rqc);},
		wait_all:(cbp,cbe)=>{cbprg.push(cbp); cbend.push(cbe);},
	}

	engine_launch(()=>{
		var pf=false;
		for(var i=0;i<wip.length;++i){
			if(wip.length<1)break;
			cur=wip.shift();
			if(!cur.end)wip.push(cur);
			else if(cur.done){pf=true; ++count_ok; oked.push(cur);}
			else{pf=true; ++count_ng; nged.push(cur);}
			cur=null;
		}

		if(pf){
			for(var cb of cbprg)cb(oked,nged);
		}
		if(wip.length<1 && cbend.length>0){
			var cbe=cbend;
			cbend=[]
			for(var cb of cbe)cb(oked,nged);
			cbprg=[]
		}

		return true;
	});

	return ctrl;
}

const http_client_ready=true;
