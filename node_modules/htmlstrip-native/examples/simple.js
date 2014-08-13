    var html_strip = require('../').html_strip
    
    var html = '<style>b {color: red;}</style>' +
							 ' Yey, <b> No more, tags</b>' +
							 '<script>document.write("Hello from Javascript")</script>';
    var options = {
			include_script : false,
			include_style : false,
			compact_whitespace : true
		};
		
    var text = html_strip(html,options)
    
    console.log(text)
