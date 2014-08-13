var fs = require('fs');
var spawn = require('child_process').spawn;

// Load entities
var entitiesFiles = ['entities/xml.json', 'entities/html4.json', 'entities/html5.json']
var entities = {};
for(var i in entitiesFiles){
	var o = JSON.parse(fs.readFileSync(entitiesFiles[i]).toString());
	for(var i in o){
		entities[i] = o[i];
	}
}

// accented characters for normalization
var acc_from_norm = [ "Ä",  "Ö",  "Ü",  "ä",  "ö",  "ü",  "ß", 'À', 'Á', 'Â', 'Ã',  'Å', 'Ā', 'Ą', 'Ă', 'Æ', 'Ç', 'Ć', 'Č', 'Ĉ', 'Ċ', 'Ď', 'Đ', 'È', 'É', 'Ê', 'Ë', 'Ē', 'Ę', 'Ě', 'Ĕ', 'Ė', 'Ĝ', 'Ğ', 'Ġ', 'Ģ', 'Ĥ', 'Ħ', 'Ì', 'Í', 'Î', 'Ï', 'Ī', 'Ĩ', 'Ĭ', 'Į', 'İ', 'Ĳ', 'Ĵ', 'Ķ', 'Ł', 'Ľ', 'Ĺ', 'Ļ', 'Ŀ', 'Ñ', 'Ń', 'Ň', 'Ņ', 'Ŋ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ø', 'Ō', 'Ő', 'Ŏ', 'Œ', 'Ŕ', 'Ř', 'Ŗ', 'Ś', 'Š', 'Ş', 'Ŝ', 'Ș', 'Ť', 'Ţ', 'Ŧ', 'Ț', 'Ù', 'Ú', 'Û',  'Ū', 'Ů', 'Ű', 'Ŭ', 'Ũ', 'Ų', 'Ŵ', 'Ý', 'Ŷ', 'Ÿ', 'Ź', 'Ž', 'Ż', 'à', 'á', 'â', 'ã', 'å', 'ā', 'ą', 'ă', 'æ', 'ç', 'ć', 'č', 'ĉ', 'ċ', 'ď', 'đ', 'è', 'é', 'ê', 'ë', 'ē', 'ę', 'ě', 'ĕ', 'ė', 'ƒ', 'ĝ', 'ğ', 'ġ', 'ģ', 'ĥ', 'ħ', 'ì', 'í', 'î', 'ï', 'ī', 'ĩ', 'ĭ', 'į', 'ı', 'ĳ', 'ĵ', 'ķ', 'ĸ', 'ł', 'ľ', 'ĺ', 'ļ', 'ŀ', 'ñ', 'ń', 'ň', 'ņ', 'ŉ', 'ŋ', 'ò', 'ó', 'ô', 'õ', 'ø', 'ō', 'ő', 'ŏ', 'œ', 'ŕ', 'ř', 'ŗ', 'ś', 'š', 'ş', 'ŝ', 'ș', 'ť', 'ţ', 'ŧ', 'ț', 'ù', 'ú', 'û',  'ū', 'ů', 'ű', 'ŭ', 'ũ', 'ų', 'ŵ', 'ý', 'ÿ', 'ŷ', 'ž', 'ż', 'ź', 'Þ', 'þ', 'ſ', 'Ð', 'ð'];
var acc_to_norm   = [ "Ae", "Oe", "Ue", "ae", "oe", "ue", "ss", 'A', 'A', 'A', 'A',  'A', 'A', 'A', 'A', 'AE', 'C', 'C', 'C', 'C', 'C', 'D', 'D', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'G', 'G', 'G', 'G', 'H', 'H', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'J', 'J', 'K', 'L', 'L', 'L', 'L', 'L', 'N', 'N', 'N', 'N', 'N', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'E', 'R', 'R', 'R', 'S', 'S', 'S', 'S', 'S', 'T', 'T', 'T', 'T', 'U', 'U', 'U',  'U', 'U', 'U', 'U', 'U', 'U', 'W', 'Y', 'Y', 'Y', 'Z', 'Z', 'Z', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'e', 'c', 'c', 'c', 'c', 'c', 'd', 'd', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'f', 'g', 'g' ,'g', 'g', 'h', 'h', 'i', 'i', 'i', 'i', 'i', 'i', 'i','i', 'i', 'j', 'j', 'k', 'k', 'l', 'l', 'l', 'l' ,'l' ,'n', 'n', 'n', 'n', 'n', 'n', 'o', 'o', 'o', 'o', 'o', 'o', 'o' ,'o', 'e', 'r' ,'r' ,'r' ,'s', 's', 's' ,'s', 's', 't' ,'t' ,'t' ,'t' ,'u' ,'u', 'u' , 'u', 'u' ,'u' ,'u' ,'u' ,'u' ,'w', 'y', 'y', 'y', 'z', 'z', 'z', 'T', 't', 'f', 'D', 'd'];

// accented characters for stripping
var acc_from_strip = [ 'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Ā', 'Ą', 'Ă', 'Æ', 'Ç', 'Ć', 'Č', 'Ĉ', 'Ċ', 'Ď', 'Đ', 'È', 'É', 'Ê', 'Ë', 'Ē', 'Ę', 'Ě', 'Ĕ', 'Ė', 'Ĝ', 'Ğ', 'Ġ', 'Ģ', 'Ĥ', 'Ħ', 'Ì', 'Í', 'Î', 'Ï', 'Ī', 'Ĩ', 'Ĭ', 'Į', 'İ', 'Ĳ', 'Ĵ', 'Ķ', 'Ł', 'Ľ', 'Ĺ', 'Ļ', 'Ŀ', 'Ñ', 'Ń', 'Ň', 'Ņ', 'Ŋ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ø', 'Ō', 'Ő', 'Ŏ', 'Œ', 'Ŕ', 'Ř', 'Ŗ', 'Ś', 'Š', 'Ş', 'Ŝ', 'Ș', 'Ť', 'Ţ', 'Ŧ', 'Ț', 'Ù', 'Ú', 'Û', 'Ü', 'Ū', 'Ů', 'Ű', 'Ŭ', 'Ũ', 'Ų', 'Ŵ', 'Ý', 'Ŷ', 'Ÿ', 'Ź', 'Ž', 'Ż', 'à', 'á', 'â', 'ã', 'ä', 'å', 'ā', 'ą', 'ă', 'æ', 'ç', 'ć', 'č', 'ĉ', 'ċ', 'ď', 'đ', 'è', 'é', 'ê', 'ë', 'ē', 'ę', 'ě', 'ĕ', 'ė', 'ƒ', 'ĝ', 'ğ', 'ġ', 'ģ', 'ĥ', 'ħ', 'ì', 'í', 'î', 'ï', 'ī', 'ĩ', 'ĭ', 'į', 'ı', 'ĳ', 'ĵ', 'ķ', 'ĸ', 'ł', 'ľ', 'ĺ', 'ļ', 'ŀ', 'ñ', 'ń', 'ň', 'ņ', 'ŉ', 'ŋ', 'ò', 'ó', 'ô', 'õ', 'ö', 'ø', 'ō', 'ő', 'ŏ', 'œ', 'ŕ', 'ř', 'ŗ', 'ś', 'š', 'ş', 'ŝ', 'ș', 'ť', 'ţ', 'ŧ', 'ț', 'ù', 'ú', 'û', 'ü', 'ū', 'ů', 'ű', 'ŭ', 'ũ', 'ų', 'ŵ', 'ý', 'ÿ', 'ŷ', 'ž', 'ż', 'ź', 'Þ', 'þ', 'ß', 'ſ', 'Ð', 'ð'];
var acc_to_strip   = [ 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'AE', 'C', 'C', 'C', 'C', 'C', 'D', 'D', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'G', 'G', 'G', 'G', 'H', 'H', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'J', 'J', 'K', 'L', 'L', 'L', 'L', 'L', 'N', 'N', 'N', 'N', 'N', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'E', 'R', 'R', 'R', 'S', 'S', 'S', 'S', 'S', 'T', 'T', 'T', 'T', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'W', 'Y', 'Y', 'Y', 'Z', 'Z', 'Z', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'e', 'c', 'c', 'c', 'c', 'c', 'd', 'd', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'f', 'g', 'g' ,'g', 'g', 'h', 'h', 'i', 'i', 'i', 'i', 'i', 'i', 'i','i', 'i', 'j', 'j', 'k', 'k', 'l', 'l', 'l', 'l' ,'l' ,'n', 'n', 'n', 'n', 'n', 'n', 'o', 'o', 'o', 'o' ,'o', 'o', 'o', 'o' ,'o', 'e', 'r' ,'r' ,'r' ,'s', 's', 's' ,'s', 's', 't' ,'t' ,'t' ,'t' ,'u' ,'u', 'u' ,'u' ,'u', 'u' ,'u' ,'u' ,'u' ,'u' ,'w', 'y', 'y', 'y', 'z', 'z', 'z', 'T', 't', 'ss', 'f', 'D', 'd'];


// Generate HTML entities hash table
var gperfFile = [
'struct entity { const char *name; const uint16_t code[2];};',
'%readonly-tables',
'%language=C++',
'%define lookup-function-name lookup_entity',
'%define class-name EntityLookup',
'%define initializer-suffix ,{0,0}',
'%switch=1',
'%%',
];

for(var i in entities){
	gperfFile.push(i+',{'+entities[i].charCodeAt(0) + ','+ (entities[i].length >1 ? entities[i].charCodeAt(1) : '0') + '}');
}

gperfFile = gperfFile.join('\n');


//console.log(gperfFile);

var gperf  = spawn('gperf', ['-t','--output-file','entities.hpp']);

gperf.stdin.write(gperfFile);
gperf.stdin.end();

function char_code_hex(num){
	var c =  num.toString(16);
	for(var i = c.length; i<4; ++i){
		c = '0' + c;
	}
	return c;
}

function generate_case(from, to, lines){
	lines.push(
		"		case 0x" +char_code_hex(from.charCodeAt(0)) + ": // '" + from[0] + "'"
	);
	for(var i in to){
		lines.push(
			"			*outBuf++ = 0x" +char_code_hex(to.charCodeAt(i)) + "; // '" + to[i] + "'"
		);
	}
	lines.push(
		"			return true;"
	);
}

// generate functions for accented characters normalization
var lines = [
'// functions to transliterate accented characters',
'#ifndef ACCENTED_TRANSLITERATE_H',
'#define ACCENTED_TRANSLITERATE_H',
'',
'static inline bool',
'transliterate_accented_norm(uint16_t* inBuf, size_t &i, uint16_t* &outBuf){',
'	switch(inBuf[i]){'
];

for(var i in acc_from_norm){
	generate_case(acc_from_norm[i],acc_to_norm[i], lines);
}

lines.push(
	'		default: return false;',
	'	}',
	'}',
	''
);

lines.push(
	'static inline bool',
	'transliterate_accented_strip(uint16_t* inBuf, size_t &i, uint16_t* &outBuf){',
	'	switch(inBuf[i]){'
);

for(var i in acc_from_strip){
	generate_case(acc_from_strip[i],acc_to_strip[i], lines);
}

lines.push(
	'		default: return false;',
	'	}',
	'}',
	''
);

lines.push(
	'',
	'#endif // ACCENTED_TRANSLITERATE_H'
)

fs.writeFileSync('acc_translit.hpp',lines.join('\n'));