// † EmulationStation NullPopPoCustom † //
// required: 1stkit.js 

ipl_modules.load('http_client.js');

var es_caps={
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

function es_date_format(val){

	if(!val)return '';
	var yp=0;
	var mp=4;
	var dp=6;
	switch(val.length){
		// YYYYMMDDThhmmss 
		case 8: case 15:
		break;

		// YYYY-MM-DDThh:mm:ss 
		case 10: case 19:
		mp+=1;
		dp+=2;
		break;

		default:
		return '';
	}

	var y=parseInt(val.substring(yp,yp+4));
	if(isNaN(y))return '';
	var m=parseInt(val.substring(mp,mp+2));
	if(isNaN(m))return '';
	var d=parseInt(val.substring(dp,dp+2));
	if(isNaN(d))return '';
	return [y,m,d]
}

function es_date_short(val){
	val=es_date_format(val);
	if(!val)return '';

	return zerofill(''+val[0],4)+zerofill(val[1],2)+zerofill(val[2],2);
}

function es_date(val){
	val=es_date_format(val);
	if(!val)return '';

	return zerofill(''+val[0],4)+'-'+zerofill(val[1],2)+'-'+zerofill(val[2],2);
}

function es_datetime(val){
	var date=es_date(val);
	if(!date)return '';

	var tp=8;
	var hp=9;
	var ip=11;
	var sp=13;
	switch(val.length){
		// YYYYMMDDThhmmss 
		case 8: case 15:
		break;

		// YYYY-MM-DDThh:mm:ss 
		case 10: case 19:
		tp+=2;
		hp+=2;
		ip+=3;
		sp+=4;
		break;

		default:
		return date;
	}

	if(val.substring(tp,tp+1)!='T')return date;

	var h=parseInt(val.substring(hp,hp+2));
	if(isNaN(h))return date;
	var i=parseInt(val.substring(ip,ip+2));
	if(isNaN(i))return date;
	var s=parseInt(val.substring(sp,sp+2));
	if(isNaN(s))return date;

	return date+' '+zerofill(h,2)+':'+zerofill(i,2)+':'+zerofill(s,2);
}

const es_client=http_controller({
	secure:false,
	base:'',
	limit:5,
	interval:100,
});

const es_resource={
	star0:es_client.makeurl('/resources/star_unfilled.svg'),
	star1:es_client.makeurl('/resources/star_filled.svg'),
}

const es_client_ready=true;