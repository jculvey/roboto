var hs = require('../')

var strings = [
'<a href="#"> linky link </a>',
'							<p><strong>Somebody  around<br />',
'&Aacute; &Auml; =	Ä | &Auml	 = Ä| &Aringngstr&oumlm',
'&&&approx;',
]

for(var i in strings){
	console.log("'" + strings[i] + "' --> '" +hs.html_strip(strings[i]) + "'");
}


