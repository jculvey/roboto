#include <node.h>
#include "v8.h"

#include <string.h>
#include "entities.hpp"
#include "acc_translit.hpp"


#include <stdlib.h>
#include <ctype.h>

using namespace v8;

enum states {
	IN_TEXT,
	IN_TAG,
	IN_COMMENT,
	IN_SCRIPT,
	IN_STYLE
};

enum tagtype {
	TAG_ANY,
	TAG_SCRIPT_START,
	TAG_STYLE_START,
	TAG_COMMENT
};

static Persistent<String> chars_written_sym;
static Persistent<String> include_script_sym;
static Persistent<String> include_style_sym;
static Persistent<String> compact_whitespace_sym;


#define IS_SCRIPT_OPEN(inBuf,i,numInChars) \
	( \
		(i+7 < numInChars) \
		&& tolower(inBuf[i+1]) == 's' && tolower(inBuf[i+2]) == 'c' && tolower(inBuf[i+3]) == 'r' \
		&& tolower(inBuf[i+4]) == 'i' && tolower(inBuf[i+5]) == 'p' && tolower(inBuf[i+6]) == 't' \
		&& !isalpha(inBuf[i+7]) \
	)

#define IS_SCRIPT_CLOSE(inBuf,i,numInChars) \
	(\
		(i+8 < numInChars) \
		&& inBuf[i+1] == '/' \
		&& tolower(inBuf[i+2]) == 's' && tolower(inBuf[i+3]) == 'c' && tolower(inBuf[i+4]) == 'r' \
		&& tolower(inBuf[i+5]) == 'i' && tolower(inBuf[i+6]) == 'p' && tolower(inBuf[i+7]) == 't' \
		&& !isalpha(inBuf[i+8]) \
	)

#define IS_STYLE_OPEN(inBuf,i,numInChars) \
	( \
		(i+6 < numInChars) \
		&& tolower(inBuf[i+1]) == 's' && tolower(inBuf[i+2]) == 't' && tolower(inBuf[i+3]) == 'y' \
		&& tolower(inBuf[i+4]) == 'l' && tolower(inBuf[i+5]) == 'e' \
		&& !isalpha(inBuf[i+6]) \
	)

#define IS_STYLE_CLOSE(inBuf,i,numInChars) \
	(\
		(i+7 < numInChars) \
		&& inBuf[i+1] == '/' \
		&& tolower(inBuf[i+2]) == 's' && tolower(inBuf[i+3]) == 't' && tolower(inBuf[i+4]) == 'y' \
		&& tolower(inBuf[i+5]) == 'l' && tolower(inBuf[i+6]) == 'e' \
		&& !isalpha(inBuf[i+7]) \
	)

#define APPEND_WS_COMPACT(b) if(*(b-1) != ' ') { *b++ = ' '; };

// convert a html entity
// inBuf - input buffer
// i - position in input buffer, should point at the '&'
// outBuf - output buffer where to place the entity character
// return true on successfull conversion, false on no match
static inline bool
decode_html_entity(uint16_t* inBuf, size_t &i,const size_t numInChars, uint16_t* &outBuf){
	switch(inBuf[i+1]){
		case '\x09': break;
		case '\x0a': break;
		case '\x0c': break;
		case '\x20': break;
		case '\x3c': break;
		case '\x26': break;
		case '#':{
			size_t j = i+2;
			bool base16 = false;
			if(tolower(inBuf[j]) == 'x'){
				base16 = true;
				++j;
			}
			size_t ns = j;
			char str[32];
			int k = 0;
			str[0] = 0;
			for(k=0; ns < numInChars && (k < 30); ++k){
				uint16_t c = tolower(inBuf[ns]);
				if(c >= '0' && c <= '9'){
					str[k] = (char)inBuf[ns++];
					continue;
				}
				if(base16 && c >= 'a' && c <= 'f'){
					str[k] = (char)inBuf[ns++];
					continue;
				}
				break;
			}
			if(k==0){
				// parse error
				return false;
			}
			str[k] = 0;
			uint16_t code = static_cast<uint16_t>(strtoll(str,NULL,base16?16:10));
			*outBuf++ = code;
			i = ns;
			return true;
		}break;
		default:{
			// Longest HTML entity is 32 chars
			char str[34];
			size_t ns = i+1;
			int k;
			str[0] = 0;
			for(k=0; ns < numInChars && isalnum(inBuf[ns]) && (k < 32); ++k){
				str[k] = static_cast<char>(inBuf[ns++]);
			}
			if(k>0){
				// lookup entity here
				if(inBuf[ns] == ';'){
					str[k] = inBuf[ns++];
					str[++k] = 0;
				} else {
					str[k] = 0;
				}
				const struct entity *e = EntityLookup::lookup_entity(str,k);
				if(e){
					*outBuf++ = e->code[0];
					if(e->code[1]){
						*outBuf++ = e->code[1];
					}
					i = ns-1;
					return true;
				}
				// now try for all combinations, that don't end with ;
				for(int l=k-1; l>=2 && !e; --l){
					--ns;
					str[l] = 0;
					e = EntityLookup::lookup_entity(str,l);
				}
				if(e){
					*outBuf++ = e->code[0];
					if(e->code[1]){
						*outBuf++ = e->code[1];
					}
					i = ns-1;
					return true;
				}
			}
			// parse error
			return false;
		}break;
	}
	return false;
}

Handle<Value> HtmlStrip(const Arguments& args) {
    HandleScope scope;

		uint16_t* inBuf = NULL;
		size_t inBufSize = 0;
    if (args.Length() >= 2) {
			inBuf = static_cast<uint16_t*>(  // NULL on flush.
	        args[0].As<Object>()->GetIndexedPropertiesExternalArrayData());
			inBufSize = args[1]->Uint32Value();
    }
		
		if(!inBuf){
			return ThrowException(
            Exception::TypeError(
							String::New("HtmlStrip: Arguments must be a UTF-16 encoded Buffer, and length"))
        );
		}
		
		bool include_script = true;
		bool include_style = true;
		bool compact_whitespace = false;
		// Check if we have any options passed
		if(args.Length() >= 3){
      Local<Object> opts = args[2].As<Object>();
			
			if(opts->Has(include_script_sym)){
				include_script = opts->Get(include_script_sym)->ToBoolean()->Value();
			}

			if(opts->Has(include_style_sym)){
				include_style = opts->Get(include_style_sym)->ToBoolean()->Value();
			}

			if(opts->Has(compact_whitespace_sym)){
				compact_whitespace = opts->Get(compact_whitespace_sym)->ToBoolean()->Value();
			}
		}
		
		// Create output buffer
	  Local<Object> global = v8::Context::GetCurrent()->Global();
	  Local<Value> bv = global->Get(String::NewSymbol("Buffer"));
	  assert(bv->IsFunction());
	  Local<Function> b = Local<Function>::Cast(bv);

	  Local<Value> argv[1] = { Number::New(double(inBufSize)) };
	  Local<Object> outBuffer = b->NewInstance(1, argv);

		
		uint16_t* outBuf = static_cast<uint16_t*>(
			outBuffer->GetIndexedPropertiesExternalArrayData());

		// Baby take off your tags , real fast :)
		size_t numInChars = inBufSize/2;
		int state = IN_TEXT;
		int tagType = TAG_ANY;
		for(size_t i=0; i<numInChars; ++i){
			switch(inBuf[i]){
				case '<':
					if(state == IN_SCRIPT || state == IN_STYLE){
						if( state == IN_SCRIPT && IS_SCRIPT_CLOSE(inBuf,i,numInChars) ){
							state = IN_TEXT;
							i+=7;
						} else if (state == IN_STYLE && IS_STYLE_CLOSE(inBuf,i,numInChars) ){
							state = IN_TEXT;
							i+=6;
						} else {
							break;
						}
						// if we found a close tag, consume the rest of it
						if(state == IN_TEXT){
							while(inBuf[i+1] != '>'){
								++i;
							}
						}
					}else if( (i+3 < numInChars) && inBuf[i+1] == '!' && inBuf[i+2] == '-' && inBuf[i+3] == '-' ){
						state = IN_COMMENT;
						tagType = TAG_COMMENT;
					}else if( IS_SCRIPT_OPEN(inBuf,i,numInChars) ){
							state = IN_TAG;
							tagType = TAG_SCRIPT_START;
					}else if( IS_STYLE_OPEN(inBuf,i,numInChars) ){
							state = IN_TAG;
							tagType = TAG_STYLE_START;
					}else if(state != IN_COMMENT ){
						state = IN_TAG;
						tagType = TAG_ANY;
					} else {
						continue;
					}
					if(compact_whitespace){
						APPEND_WS_COMPACT(outBuf);
					}else {
						*outBuf++ = ' ';
					}
					continue;
				case '>':
					if(state == IN_SCRIPT || state == IN_STYLE){
						break;
					}else  if(state == IN_COMMENT){
						if(inBuf[i-1] == '-' && inBuf[i-2] == '-' ){
							state = IN_TEXT;
						}
					}else	if(state == IN_TAG && tagType == TAG_SCRIPT_START){
						state = IN_SCRIPT;
					}else	if(state == IN_TAG && tagType == TAG_STYLE_START){
						state = IN_STYLE;
					} else {
						state = IN_TEXT;
					}
					continue;
				case '&':
					if( (state == IN_TEXT || state == IN_SCRIPT) && (i+2)<numInChars){
						// Handle unicode character code
						if(decode_html_entity(inBuf,i,numInChars,outBuf)){
							continue;
						}
					}break;
				// handle whitespace as defined in \s :
				//		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
				case ' ':
				case '\f':
				case '\n':
				case '\r':
				case '\t':
				case '\v':
				case 0x00A0:
				case 0x1680:
				case 0x180e:
				case 0x2000:
				case 0x2001:
				case 0x2002:
				case 0x2003:
				case 0x2004:
				case 0x2005:
				case 0x2006:
				case 0x2007:
				case 0x2008:
				case 0x2009:
				case 0x200a:
				case 0x2028:
				case 0x2029:
				case 0x202f:
				case 0x205f:
				case 0x3000:
					if(compact_whitespace){
						APPEND_WS_COMPACT(outBuf);
						continue;
					}
					break;
				default: break;
			}
			switch(state){
				case IN_STYLE:
					if(include_style){
						*outBuf++ = inBuf[i];
					}
					break;
				case IN_SCRIPT:
					if(include_script){
						*outBuf++ = inBuf[i];
					}
					break;
				case IN_TEXT:
					*outBuf++ = inBuf[i];
					break;
				default: break;
			}
		}
		// Set the number of characters written
		outBuffer->Set(chars_written_sym, 
			Integer::New(outBuf - static_cast<uint16_t*>(
				outBuffer->GetIndexedPropertiesExternalArrayData()))
		);
    return scope.Close(outBuffer);
}

Handle<Value> HtmlEntitiesDecode(const Arguments& args) {
    HandleScope scope;

		uint16_t* inBuf = NULL;
		size_t inBufSize = 0;
    if (args.Length() >= 2) {
			inBuf = static_cast<uint16_t*>(  // NULL on flush.
	        args[0].As<Object>()->GetIndexedPropertiesExternalArrayData());
			inBufSize = args[1]->Uint32Value();
    }
		
		if(!inBuf){
			return ThrowException(
            Exception::TypeError(
							String::New("ConvertHtmlEntities: Arguments must be a UTF-16 encoded Buffer, and length"))
        );
		}
		
		// Create output buffer
	  Local<Object> global = v8::Context::GetCurrent()->Global();
	  Local<Value> bv = global->Get(String::NewSymbol("Buffer"));
	  assert(bv->IsFunction());
	  Local<Function> b = Local<Function>::Cast(bv);

	  Local<Value> argv[1] = { Number::New(double(inBufSize)) };
	  Local<Object> outBuffer = b->NewInstance(1, argv);

		
		uint16_t* outBuf = static_cast<uint16_t*>(
			outBuffer->GetIndexedPropertiesExternalArrayData());

		size_t numInChars = inBufSize/2;
		for(size_t i=0; i<numInChars; ++i){
			switch(inBuf[i]){
				case '&':
					if(decode_html_entity(inBuf,i,numInChars,outBuf)){
						continue;
					}
					break;
				default: break;
			}
			*outBuf++ = inBuf[i];
		}
		// Set the number of characters written
		outBuffer->Set(chars_written_sym, 
			Integer::New(outBuf - static_cast<uint16_t*>(
				outBuffer->GetIndexedPropertiesExternalArrayData()))
		);
    return scope.Close(outBuffer);
}

// Covert accenteds char to its ascii representation,
// this may produce longer output string, than the output
Handle<Value> AccentedCharsNormalize(const Arguments& args) {
    HandleScope scope;

		uint16_t* inBuf = NULL;
		size_t inBufSize = 0;
    if (args.Length() >= 2) {
			inBuf = static_cast<uint16_t*>(  // NULL on flush.
	        args[0].As<Object>()->GetIndexedPropertiesExternalArrayData());
			inBufSize = args[1]->Uint32Value();
    }
		
		if(!inBuf){
			return ThrowException(
            Exception::TypeError(
							String::New("AccentedCharsNormalize: Arguments must be a UTF-16 encoded Buffer, and length"))
        );
		}
		
		// Create output buffer
	  Local<Object> global = v8::Context::GetCurrent()->Global();
	  Local<Value> bv = global->Get(String::NewSymbol("Buffer"));
	  assert(bv->IsFunction());
	  Local<Function> b = Local<Function>::Cast(bv);

		// Allocate double size buffer , as in the worst case output string will be double legnth
	  Local<Value> argv[1] = { Number::New(double(inBufSize * 2)) };
	  Local<Object> outBuffer = b->NewInstance(1, argv);

		
		uint16_t* outBuf = static_cast<uint16_t*>(
			outBuffer->GetIndexedPropertiesExternalArrayData());

		size_t numInChars = inBufSize/2;
		for(size_t i=0; i<numInChars; ++i){
			if(transliterate_accented_norm(inBuf, i, outBuf)){
				continue;
			}
			*outBuf++ = inBuf[i];
		}
		// Set the number of characters written
		outBuffer->Set(chars_written_sym, 
			Integer::New(outBuf - static_cast<uint16_t*>(
				outBuffer->GetIndexedPropertiesExternalArrayData()))
		);
    return scope.Close(outBuffer);
}

// remove accents from accented chars
// this may produce longer output string, than the output
Handle<Value> AccentedCharsStrip(const Arguments& args) {
    HandleScope scope;

		uint16_t* inBuf = NULL;
		size_t inBufSize = 0;
    if (args.Length() >= 2) {
			inBuf = static_cast<uint16_t*>(  // NULL on flush.
	        args[0].As<Object>()->GetIndexedPropertiesExternalArrayData());
			inBufSize = args[1]->Uint32Value();
    }
		
		if(!inBuf){
			return ThrowException(
            Exception::TypeError(
							String::New("AccentedCharsNormalize: Arguments must be a UTF-16 encoded Buffer, and length"))
        );
		}
		
		// Create output buffer
	  Local<Object> global = v8::Context::GetCurrent()->Global();
	  Local<Value> bv = global->Get(String::NewSymbol("Buffer"));
	  assert(bv->IsFunction());
	  Local<Function> b = Local<Function>::Cast(bv);

		// Allocate double size buffer , as in the worst case output string will be double legnth
	  Local<Value> argv[1] = { Number::New(double(inBufSize * 2)) };
	  Local<Object> outBuffer = b->NewInstance(1, argv);

		
		uint16_t* outBuf = static_cast<uint16_t*>(
			outBuffer->GetIndexedPropertiesExternalArrayData());

		size_t numInChars = inBufSize/2;
		for(size_t i=0; i<numInChars; ++i){
			if(transliterate_accented_strip(inBuf, i, outBuf)){
				continue;
			}
			*outBuf++ = inBuf[i];
		}
		// Set the number of characters written
		outBuffer->Set(chars_written_sym, 
			Integer::New(outBuf - static_cast<uint16_t*>(
				outBuffer->GetIndexedPropertiesExternalArrayData()))
		);
    return scope.Close(outBuffer);
}




void RegisterModule(Handle<Object> target) {
  chars_written_sym = NODE_PSYMBOL("_charsWritten");
	include_script_sym = NODE_PSYMBOL("include_script");
	include_style_sym = NODE_PSYMBOL("include_style");
	compact_whitespace_sym = NODE_PSYMBOL("compact_whitespace");
	
  target->Set(String::NewSymbol("html_strip"),
      FunctionTemplate::New(HtmlStrip)->GetFunction());

	target->Set(String::NewSymbol("html_entities_decode"),
      FunctionTemplate::New(HtmlEntitiesDecode)->GetFunction());

	target->Set(String::NewSymbol("accented_chars_norm"),
      FunctionTemplate::New(AccentedCharsNormalize)->GetFunction());

	target->Set(String::NewSymbol("accented_chars_strip"),
      FunctionTemplate::New(AccentedCharsStrip)->GetFunction());
}

NODE_MODULE(htmlstrip, RegisterModule);
