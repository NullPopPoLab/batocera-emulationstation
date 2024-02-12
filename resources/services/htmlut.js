// † EmulationStation NullPopPoCustom † //
// required: 1stkit.js 

function htmlut_emptycb_button(ctrl){ctrl.unlock();}

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
	var ctrl_root={
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
		ctrl_root.cbexec(ctrl_root);
	}

	return ctrl_root;
}

function htmlut_lockbutton(opt={}){

	var qht={
		tag:'span',
		sub:[opt.caption??'']
	}
	if(opt.target)qht.target=opt.target;

	var side=!!(opt.init??false);
	var ctrl={
		view:quickhtml(qht),
		is_locked:()=>side,
		lock:(val)=>{
			val=!!val;
			if(val==side)return;
			side=val;
			updview();
		},
		set_caption:(val)=>{
			ctrl.view.innerHTML=val;
		},
	}
	ctrl.view.onclick=()=>{
		side=!side;
		updview();
	}

	if(opt.class_off&&opt.class_on){
		var updview=()=>{
			ctrl.view.setAttribute('class',side?opt.class_on:opt.class_off);
		}
	}
	else{
		ctrl.view.style.display='inline-block';
		var updview=()=>{
			ctrl.view.style.border=side?'inset':'outset';
		}
	}

	updview();
	return ctrl;
}

function htmlut_confirmset(opt={}){

	var opt_cancel={
		caption:opt.caption_cancel??'Cancel',
		cbexec:(ctrl)=>{
			(opt.cbcancel??htmlut_emptycb_button)(ctrl);
		}
	}
	if(opt.class_cancel)opt_cancel.class_button=opt.class_cancel;
	var ctrl_cancel=htmlut_safebutton(opt_cancel);

	var opt_ok={
		caption:opt.caption_ok??'OK',
		cbexec:(ctrl)=>{
			(opt.cbexec??htmlut_emptycb_button)(ctrl);
		},
	}
	if(opt.class_ok)opt_ok.class_button=opt.class_ok;
	var ctrl_ok=htmlut_safebutton(opt_ok);

	var qht_confirm={
		tag:'span',
		attr:{},
		sub:[
			opt.msg_confirm??'are you sure?',
			ctrl_cancel.view,
			ctrl_ok.view,
		]
	}
	if(opt.class_confirm)qht_confirm.attr.class=opt.class_confirm;
	var view_confirm=quickhtml(qht_confirm);

	var ctrl_root={
		view:view_confirm,
		ok:ctrl_ok,
		cancel:ctrl_cancel,
	}
	return ctrl_root;
}

function htmlut_confirmbutton(opt={}){

	var confirming=false;
	var visible=opt.visible??true;

	var opt_first={
		caption:opt.caption_first??'',
		cbexec:(ctrl)=>{
			confirming=true;
			view_root.innerHTML='';
			view_root.append(ctrl_confirm.view);
			ctrl.unlock();
		},
	}
	if(opt.class_first)qht_first.class_button=opt.class_first;
	var ctrl_first=htmlut_safebutton(opt_first);

	var opt_confirm={
		cbcancel:(ctrl)=>{
			confirming=false;
			view_root.innerHTML='';
			view_root.append(ctrl_first.view);
			ctrl.unlock();
		},
		cbexec:(ctrl)=>{
			confirming=false;
			ctrl_root.hide();
			(opt.cbexec??htmlut_emptycb_button)(ctrl_root);
			ctrl.unlock();
		},
	}
	if(opt.class_ok)opt_confirm.class_ok=opt.class_ok;
	if(opt.class_cancel)opt_confirm.class_cancel=opt.class_cancel;
	if(opt.class_confirm)opt_confirm.class_confirm=opt.class_confirm;
	if(opt.msg_confirm)opt_confirm.msg_confirm=opt.msg_confirm;
	var ctrl_confirm=htmlut_confirmset(opt_confirm);

	var qht_root={
		tag:'span',
		attr:{},
	}
	if(opt.target)qht_root.target=opt.target;
	if(opt.class_outline)qht_root.attr.class=opt.class_outline;
	var view_root=quickhtml(qht_root);
	var ctrl_root={
		view:view_root,

		hide:()=>{
			visible=false;
			view_root.innerHTML='';
		},
		show:()=>{
			visible=true;
			view_root.innerHTML='';
			view_root.append(confirming?ctrl_confirm.view:ctrl_first.view);
		},
	}
	if(visible)ctrl_root.show();

	return ctrl_root;
}

function htmlut_filebutton(opt={}){

	var visible=opt.visible??true;
	var selected=[]

	var view_name=quickhtml({
		tag:'span',
	});
	if(opt.class_selected)view_name.setAttribute('class',opt.class_selected);

	var opt_select={
		caption:opt.caption_select??'Select',
		cbexec:(ctrl)=>{
			view_root.innerHTML='';

			var vw=quickhtml({
				target:view_root,
				tag:'input',
				attr:{type:'file',accept:opt.filter??''},
			});
			vw.addEventListener('cancel',()=>{
				ctrl_root.show();
			});
			vw.addEventListener('change',(ev)=>{
				if(ev.target.files.length<1)return;
				selected=ev.target.files;
				view_root.innerHTML='';
				view_name.innerHTML=selected[0].name;
				if(opt.cbselect)opt.cbselect(ctrl_root,selected);
			});
			vw.click();
			ctrl.unlock();
		},
	}
	if(opt.class_select)opt_select.class_button=opt.class_select;
	var ctrl_select=htmlut_safebutton(opt_select);

	var opt_confirm={
		msg_confirm: view_name,

		cbcancel:(ctrl)=>{
			ctrl_root.show();
			if(opt.cbcancel)opt.cbcancel(ctrl_root,selected);
			selected=[]
			ctrl.unlock();
		},
		cbexec:(ctrl)=>{
			ctrl_root.hide();
			if(opt.cbexec)opt.cbexec(ctrl_root,selected);
			ctrl.unlock();
		},
	}
	if(opt.class_ok)opt_confirm.class_ok=opt.class_ok;
	if(opt.class_cancel)opt_confirm.class_cancel=opt.class_cancel;
	if(opt.class_confirm)opt_confirm.class_confirm=opt.class_confirm;
	var ctrl_confirm=htmlut_confirmset(opt_confirm);

	var qht_root={
		tag:'span',
		attr:{},
	}
	if(opt.target)qht_root.target=opt.target;
	if(opt.class_outline)qht_root.attr.class=opt.class_outline;
	var view_root=quickhtml(qht_root);
	var ctrl_root={
		view:view_root,

		hide:()=>{
			visible=false;
			view_root.innerHTML='';
		},
		show:()=>{
			visible=true;
			view_root.innerHTML='';
			view_root.append(ctrl_select.view);
		},
		confirm:()=>{
			visible=true;
			view_root.innerHTML='';
			view_root.append(ctrl_confirm.view);
		}
	}
	if(visible)ctrl_root.show();

	return ctrl_root;
}

const htmlut_ready=true;
