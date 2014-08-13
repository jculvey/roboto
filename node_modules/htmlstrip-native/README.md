#Simple HTML tags stripping library


## Install

via npm:
    
    npm install htmlstrip-native
		
from source:
    
    git clone git://github.com/zaro/node-htmlstrip-native.git
		cd node-htmlstrip-native
		npm install
		
## Use

Example:

    var html_strip = require('htmlstrip-native');
    
    var html = '<style>b {color: red;}</style>' +
							 ' Yey, <b> No more, tags</b>' +
							 '<script>document.write("Hello from Javascript")</script>';
    var options = {
			include_script : false,
			include_style : false,
			compact_whitespace : true
		};
		
		// Strip tags and decode HTML entities
    var text = html_strip.html_strip(html,options);
    
    console.log(text)
		
		// Decode HTML entities only
		var no_entities = html_strip.html_entities_decode('Hello &smile;')

The html_strip function expects either a string as first argument or a 'utf-16le',
encoded Buffer. The optional second argument can hold the following options:
    
		{
			include_script : true, // include the content of <script> tags
			include_style : true, // include the content of <style> tags
			compact_whitespace : false // compact consecutive '\s' whitespace into single char
		}


		
## Speed

Same thing can be achieved really simply without native modules with htmlparser2 for example.
This module is ~30 times faster than using htmlparser2.
