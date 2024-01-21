// † EmulationStation NullPopPoCustom † //
// required: 1stkit.js 

function htmlut_emptycb_button(ctl){ctl.unlock();}

function htmlut_safebutton(opt={}){

	var disabled=opt.disabled??false;
	var lock=false;

	var qht_root={
		tag:'button',
		attr:{},
		sub:[opt.caption??'']
	}
	if(opt.target)qht_root.target=opt.target;
	if(disabled)qht_root.attr.disabled='disabled';
	if(opt.class_button)qht_root.attr.class=opt.class_button;

	var view_root=quickhtml(qht_root);
	var ctl_root={
		view: view_root,
		cbexec:opt.cbexec??htmlut_emptycb_button,

		disable:()=>{
			disabled=true;
			view_root.disabled=true;
		},
		enable:()=>{
			disabled=false;
			view_root.disabled=disabled||lock;
		},
		unlock:()=>{
			lock=false;
			view_root.disabled=disabled||lock;
		},
	}
	view_root.onclick=()=>{
		if(lock)return;
		lock=true;
		view_root.disabled=true;
		ctl_root.cbexec(ctl_root);
	}

	return ctl_root;
}

function htmlut_confirmset(opt={}){

	var opt_cancel={
		caption:opt.caption_cancel??'Cancel',
		cbexec:(ctl)=>{
			(opt.cbcancel??htmlut_emptycb_button)(ctl);
		}
	}
	if(opt.class_cancel)opt_cancel.class_button=opt.class_cancel;
	var ctl_cancel=htmlut_safebutton(opt_cancel);

	var opt_ok={
		caption:opt.caption_ok??'OK',
		cbexec:(ctl)=>{
			(opt.cbexec??htmlut_emptycb_button)(ctl);
		},
	}
	if(opt.class_ok)opt_ok.class_button=opt.class_ok;
	var ctl_ok=htmlut_safebutton(opt_ok);

	var qht_confirm={
		tag:'span',
		attr:{},
		sub:[
			opt.msg_confirm??'are you sure?',
			ctl_cancel.view,
			ctl_ok.view,
		]
	}
	if(opt.class_confirm)qht_confirm.attr.class=opt.class_confirm;
	var view_confirm=quickhtml(qht_confirm);

	var ctl_root={
		view:view_confirm,
		ok:ctl_ok,
		cancel:ctl_cancel,
	}
	return ctl_root;
}

function htmlut_confirmbutton(opt={}){

	var confirming=false;
	var visible=opt.visible??true;

	var opt_first={
		caption:opt.caption_first??'',
		cbexec:(ctl)=>{
			confirming=true;
			view_root.innerHTML='';
			view_root.append(ctl_confirm.view);
			ctl.unlock();
		},
	}
	if(opt.class_first)qht_first.class_button=opt.class_first;
	var ctl_first=htmlut_safebutton(opt_first);

	var opt_confirm={
		cbcancel:(ctl)=>{
			confirming=false;
			view_root.innerHTML='';
			view_root.append(ctl_first.view);
			ctl.unlock();
		},
		cbexec:(ctl)=>{
			confirming=false;
			ctl_root.hide();
			(opt.cbexec??htmlut_emptycb_button)(ctl_root);
			ctl.unlock();
		},
	}
	if(opt.class_ok)opt_confirm.class_ok=opt.class_ok;
	if(opt.class_cancel)opt_confirm.class_cancel=opt.class_cancel;
	if(opt.class_confirm)opt_confirm.class_confirm=opt.class_confirm;
	if(opt.msg_confirm)opt_confirm.msg_confirm=opt.msg_confirm;
	var ctl_confirm=htmlut_confirmset(opt_confirm);

	var qht_root={
		tag:'span',
		attr:{},
	}
	if(opt.target)qht_root.target=opt.target;
	if(opt.class_outline)qht_root.attr.class=opt.class_outline;
	var view_root=quickhtml(qht_root);
	var ctl_root={
		view:view_root,

		hide:()=>{
			visible=false;
			view_root.innerHTML='';
		},
		show:()=>{
			visible=true;
			view_root.innerHTML='';
			view_root.append(confirming?ctl_confirm.view:ctl_first.view);
		},
	}
	if(visible)ctl_root.show();

	return ctl_root;
}

function htmlut_filebutton(opt={}){

	var visible=opt.visible??true;
	var selected=[]

	var opt_select={
		caption:opt.caption_select??'Select',
		cbexec:(ctl)=>{
			view_root.innerHTML='';

			var vw=quickhtml({
				target:view_root,
				tag:'input',
				attr:{type:'file',accept:opt.filter??''},
			});
			vw.addEventListener('cancel',()=>{
				ctl_root.show();
			});
			vw.addEventListener('change',(ev)=>{
				if(ev.target.files.length<1)return;
				selected=ev.target.files;
				view_root.innerHTML='';
				if(opt.cbselect)opt.cbselect(ctl_root,selected);
			});
			vw.click();
			ctl.unlock();
		},
	}
	if(opt.class_select)opt_select.attr.class=opt.class_select;
	var ctl_select=htmlut_safebutton(opt_select);

	var opt_confirm={
		cbcancel:(ctl)=>{
			ctl_root.show();
			if(opt.cbcancel)opt.cbcancel(ctl_root,selected);
			selected=[]
			ctl.unlock();
		},
		cbexec:(ctl)=>{
			ctl_root.hide();
			if(opt.cbexec)opt.cbexec(ctl_root,selected);
			ctl.unlock();
		},
	}
	if(opt.class_ok)opt_confirm.class_ok=opt.class_ok;
	if(opt.class_cancel)opt_confirm.class_cancel=opt.class_cancel;
	if(opt.class_confirm)opt_confirm.class_confirm=opt.class_confirm;
	if(opt.msg_confirm)opt_confirm.msg_confirm=opt.msg_confirm;
	var ctl_confirm=htmlut_confirmset(opt_confirm);

	var qht_root={
		tag:'span',
		attr:{},
	}
	if(opt.target)qht_root.target=opt.target;
	if(opt.class_outline)qht_root.attr.class=opt.class_outline;
	var view_root=quickhtml(qht_root);
	var ctl_root={
		view:view_root,

		hide:()=>{
			visible=false;
			view_root.innerHTML='';
		},
		show:()=>{
			visible=true;
			view_root.innerHTML='';
			view_root.append(ctl_select.view);
		},
		confirm:()=>{
			visible=true;
			view_root.innerHTML='';
			view_root.append(ctl_confirm.view);
		}
	}
	if(visible)ctl_root.show();

	return ctl_root;
}

const htmlut_ready=true;
