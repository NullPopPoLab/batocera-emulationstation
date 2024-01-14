// † EmulationStation NullPopPoCustom † //
// required: 1stkit.js 

function objview(data,opt={},name=null){

	var fs=quickhtml({
		tag:'fieldset',
	});
	if(opt.style_field){
		fs.setAttribute('class',opt.style_field);
	}

	if(name){
		var cs=quickhtml({
			target:fs,
			tag:'legend',
			sub:[name]
		});
		if(opt.style_legend){
			cs.setAttribute('class',opt.style_caption);
		}
	}

	for(var k in data){
		var v=data[k];
		if(typeof v==='object'){
			fs.append(objview(v,opt,k));
		}
		else{
			var ks=quickhtml({
				target:fs,
				tag:'div',
				sub:[''+k]
			});
			if(opt.style_key){
				ks.setAttribute('class',opt.style_key);
			}
			else{
				ks.setAttribute('style','display:inline-block;border-style:outset;margin:0.2em;padding-left:0.2em');
			}

			var vs=quickhtml({
				target:ks,
				tag:'div',
				sub:[''+v]
			});
			if(opt.style_value){
				vs.setAttribute('class',opt.style_value);
			}
			else{
				vs.setAttribute('style','display:inline-block;border-style:inset;padding:0.2em;margin-left:0.2em');
			}
		}
	}

	return fs;
}
