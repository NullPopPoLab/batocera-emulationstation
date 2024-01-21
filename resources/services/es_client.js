// † EmulationStation NullPopPoCustom † //
// required: 1stkit.js 

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