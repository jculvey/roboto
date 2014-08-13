var binding ;
try {
	binding = require('./build/Release/htmlstrip.node')
} catch(e){
	binding = require('./build/Debug/htmlstrip.node')
}


module.exports.html_strip = function(html,options){
	if (typeof html == 'string'){
		html = new Buffer(html,'utf-16le');
	}
	
	var buf = binding.html_strip(html, html.length, options);
	return buf.toString('utf-16le',0,buf._charsWritten*2);
}

module.exports.html_entities_decode = function(string){
	if (typeof string == 'string'){
		string = new Buffer(string,'utf-16le');
	}
	
	var buf = binding.html_entities_decode(string, string.length);
	return buf.toString('utf-16le',0,buf._charsWritten*2);
}

module.exports.accented_chars_norm = function(string){
	if (typeof string == 'string'){
		string = new Buffer(string,'utf-16le');
	}
	
	var buf = binding.accented_chars_norm(string, string.length);
	return buf.toString('utf-16le',0,buf._charsWritten*2);
}

module.exports.accented_chars_strip = function(string){
	if (typeof string == 'string'){
		string = new Buffer(string,'utf-16le');
	}
	
	var buf = binding.accented_chars_strip(string, string.length);
	return buf.toString('utf-16le',0,buf._charsWritten*2);
}
