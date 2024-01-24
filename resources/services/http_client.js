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
	if(rqc.cbok)rqc.cbok(data);
}

function http_respond_ng(rqc,err){
	if(rqc.end)return;
	rqc.end=true;
	if(!rqc.err)rqc.err=err;
	if(rqc.cbng)rqc.cbng(err);
}

function http_controller_new(opt={}){

	var ctl={
		end:false,
		secure:opt.secure??false,
		base:opt.base??'',
		limit:opt.limit??null,
		interval:opt.interval??500,
		wip:[],
		queue:[],
		proc:engine_launch(()=>http_controller_poll(ctl),()=>http_controller_abort(ctl)),

		abort:()=>{
			ctl.proc.abort();
		},

		makeurl:(path)=>{
			if(!ctl.base)return path;
			var scheme=ctl.secure?'https':'http';
			return scheme+'://'+ctl.base+path;
		},

		get_text:(path,cbok,cbng)=>{
			var url=ctl.makeurl(path);
			var rqc=http_request_context(
				()=>http_get_text(url,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctl.queue.push(rqc);
			return rqc;
		},
		get_json:(path,cbok,cbng)=>{
			var url=ctl.makeurl(path);
			var rqc=http_request_context(
				()=>http_get_json(url,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctl.queue.push(rqc);
			return rqc;
		},
		get_xml:(path,cbok,cbng)=>{
			var url=ctl.makeurl(path);
			var rqc=http_request_context(
				()=>http_get_xml(url,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctl.queue.push(rqc);
			return rqc;
		},

		post_text:(path,text,cbok,cbng)=>{
			var url=ctl.makeurl(path);
			var rqc=http_request_context(
				()=>http_post_text(url,text,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctl.queue.push(rqc);
			return rqc;
		},
		post_json:(path,json,cbok,cbng)=>{
			var url=ctl.makeurl(path);
			var rqc=http_request_context(
				()=>http_post_json(url,json,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctl.queue.push(rqc);
			return rqc;
		},
		post_file:(path,bin,file,cbok,cbng)=>{
			var url=ctl.makeurl(path);
			var rqc=http_request_context(
				()=>http_post_file(url,bin,file,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctl.queue.push(rqc);
			return rqc;
		},

		delete:(path,cbok,cbng)=>{
			var url=ctl.makeurl(path);
			var rqc=http_request_context(
				()=>http_delete(url,
					(data)=>http_respond_ok(rqc,data),
					(err)=>http_respond_ng(rqc,err)
				),
				cbok,cbng
			);
			ctl.queue.push(rqc);
			return rqc;
		},
	}
	ctl.last_launched=Date.now()-ctl.interval;
	return ctl;
}

function http_controller_poll(ctl){

	if(ctl.end)return false;

	var cont=[]
	for(var rqc of ctl.wip){
		if(rqc.end)continue;
		cont.push(rqc);
	}
	ctl.wip=cont;

	while(ctl.queue.length>0){
		if(ctl.limit!==null && ctl.wip.length>=ctl.limit)break;
		if(Date.now()<ctl.last_launched+ctl.interval)break;
		var rqc=ctl.queue.shift();
		ctl.wip.push(rqc);
		rqc.cbreq();
	}

	return true;
}

function http_controller_abort(ctl){

	if(ctl.end)return;
	ctl.end=true;

	for(var proc of ctl.wip)proc.abort();
	for(var proc of ctl.queue)proc.abort();

	log_info('end of client controller');
}

function http_controller(opt={}){
	var ctl=http_controller_new(opt);

	engine_launch(
		()=>http_controller_poll(ctl),
		null,
		()=>http_controller_abort(ctl)
	);

	return ctl;
}

const http_client_ready=true;
