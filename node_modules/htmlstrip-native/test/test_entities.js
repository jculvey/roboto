var fs = require('fs')
var hs = require('../')

// Load entities
var entitiesFiles = ['../entities/xml.json', '../entities/html4.json', '../entities/html5.json']
var entities = {};
for(var i in entitiesFiles){
	var o = JSON.parse(fs.readFileSync(__dirname + '/' + entitiesFiles[i]).toString());
	for(var i in o){
		entities[i] = o[i];
	}
	
}

function rs(len) {
    var text = "";
    var possible = "" +
		"`~!@#$%^&*()_+=-/.,<>?';\":][}{]\\|" +
		"`~!@#$%^&*()_+=-/.,<>?';\":][}{]\\|" +
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+
		"`~!@#$%^&*()_+=-/.,<>?';\":][}{]\\|"
		;

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
		
		// we don't wan't fake num entities 
		text = text.replace(/&#/g,'&@');
		return text;
}

// create random imput and expected output
var inl = [];
var outl = [];
for(var i in entities){
	var p = rs(3);
	var ins = p ;
	var outs = p ;

	ins += '&' + i;
	outs += entities[i];
	
	p = rs(2);
	while(entities[i].slice(-1) != ';' &&  p[0] == ';'){
		p = rs(2);
	}
	ins += p +'\n';
	outs += p +'\n';
	
	inl.push(ins);
	outl.push(outs);
}

var ITERATIONS = 100;

for(var kkk; kkk< ITERATIONS ; ++kkk){
	for(var i in inl){
		var ins = inl[i];
		var outs = outl[i];
		var decoded = hs.html_entities_decode(ins);
		var ok = outs == decoded;
		if(!ok){
			console.log('FAIL');
			console.log('in:',ins);
			console.log('expected:',outs, new Buffer(outs,'binary'));
			console.log('decoded:',decoded, new Buffer(decoded,'binary'));
			process.exit(-1);
		}
	}
}

console.log('OK');
